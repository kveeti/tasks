use std::{thread, time::Duration};

use config::CONFIG;
use data::get_db;
use entity::{notif_subs, notifs};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde_json::json;
use web_push::{
    SubscriptionInfo, VapidSignatureBuilder, WebPushClient, WebPushMessageBuilder, URL_SAFE_NO_PAD,
};

pub async fn start_notification_service() {
    tracing::info!("Starting notification service");

    let db = get_db().await;
    let client = WebPushClient::new().unwrap();
    let signature_builder =
        VapidSignatureBuilder::from_base64_no_sub(&CONFIG.vapid_private_key, URL_SAFE_NO_PAD)
            .unwrap();

    tracing::info!("Notification service started");

    loop {
        thread::sleep(Duration::from_secs(10));

        tracing::debug!("Checking for notifications");

        let notifs = notifs::Entity::find()
            .filter(notifs::Column::SendAt.lt(chrono::Utc::now()))
            .all(&db)
            .await;

        if let Err(e) = notifs {
            tracing::error!("Failed to get notifications: {}", e);
        } else if let Ok(notifs) = notifs {
            if notifs.len() <= 0 {
                continue;
            } else {
                let user_ids = notifs.iter().map(|n| n.user_id.to_owned());

                let subs = notif_subs::Entity::find()
                    .filter(notif_subs::Column::UserId.is_in(user_ids))
                    .all(&db)
                    .await;

                if let Err(e) = subs {
                    tracing::error!("Failed to get notification subscriptions: {}", e);
                } else if let Ok(subs) = subs {
                    tracing::debug!(
                        "Found {} notifications for {} subs",
                        notifs.len(),
                        subs.len()
                    );

                    let mut subs_by_user_id = std::collections::HashMap::new();

                    for sub in subs {
                        let user_id = sub.user_id.to_owned();
                        let subs = subs_by_user_id.entry(user_id).or_insert(vec![]);
                        subs.push(sub);
                    }

                    for notif in notifs.clone() {
                        let user_id = notif.user_id.to_owned();
                        let subs = subs_by_user_id.get_mut(&user_id);

                        if let None = subs {
                            continue;
                        } else if let Some(subs) = subs {
                            if subs.len() <= 0 {
                                continue;
                            }

                            let payload = json!({
                                "title": notif.title,
                                "message": notif.message,
                            })
                            .to_string();

                            let futures = subs.iter().map(|sub| {
                                let client = client.clone();

                                let subscription_info = SubscriptionInfo::new(
                                    sub.endpoint.to_owned(),
                                    sub.p256dh.to_owned(),
                                    sub.auth.to_owned(),
                                );

                                let signature = signature_builder
                                    .to_owned()
                                    .add_sub_info(&subscription_info)
                                    .build()
                                    .unwrap();

                                let mut message_builder =
                                    WebPushMessageBuilder::new(&subscription_info).unwrap();
                                message_builder.set_payload(
                                    web_push::ContentEncoding::Aes128Gcm,
                                    payload.as_bytes(),
                                );
                                message_builder.set_vapid_signature(signature.clone());

                                let message = message_builder.build().unwrap();

                                async move {
                                    let response = client.send(message).await;

                                    if let Err(e) = response {
                                        tracing::error!("Failed to send notification: {}", e);
                                    } else if let Ok(_response) = response {
                                        tracing::info!("Notification sent");
                                    }
                                }
                            });

                            futures::future::join_all(futures).await;
                        }
                    }
                }

                let notif_ids = notifs.iter().map(|n| n.id.to_owned());

                notifs::Entity::delete_many()
                    .filter(notifs::Column::Id.is_in(notif_ids))
                    .exec(&db)
                    .await
                    .unwrap();
            }
        }
    }
}
