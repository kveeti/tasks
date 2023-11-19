use std::{collections::HashMap, time::Duration};

use anyhow::Context;
use config::CONFIG;
use serde_json::json;
use web_push::{
    SubscriptionInfo, VapidSignatureBuilder, WebPushClient, WebPushMessageBuilder, URL_SAFE_NO_PAD,
};

pub async fn start_notification_service() {
    tracing::info!("starting notification service");

    let db2 = db::get_db().await;
    let client = WebPushClient::new().unwrap();
    let signature_builder =
        VapidSignatureBuilder::from_base64_no_sub(&CONFIG.vapid_private_key, URL_SAFE_NO_PAD)
            .unwrap();

    tracing::info!("notification service started");

    loop {
        let notifs = db::notifications::get_to_send(&db2)
            .await
            .context("error getting notifications");

        if let Err(e) = notifs {
            tracing::error!("failed to get notifications: {}", e);
        } else if let Ok(notifs) = notifs {
            if notifs.len() > 0 {
                let user_ids = notifs
                    .iter()
                    .map(|n| n.user_id.to_owned())
                    .collect::<Vec<String>>();

                let subs = db::notification_subs::get_by_user_ids(&db2, &user_ids).await;

                let notif_ids = notifs
                    .iter()
                    .map(|n| n.id.to_owned())
                    .collect::<Vec<String>>();

                if let Err(_) = subs {
                    tracing::error!("error getting notification subs");
                } else if let Ok(subs) = subs {
                    tracing::debug!(
                        "found {} notifications for {} subs",
                        notifs.len(),
                        subs.len()
                    );

                    let mut subs_by_user_id = HashMap::new();

                    for sub in subs {
                        let user_id = sub.user_id.to_owned();
                        let subs = subs_by_user_id.entry(user_id).or_insert(vec![]);
                        subs.push(sub);
                    }

                    for notif in notifs {
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

                                tracing::info!(
                                    "Sending notification to {} {} {} {}",
                                    sub.user_id,
                                    sub.endpoint,
                                    sub.p256dh,
                                    sub.auth
                                );

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

                let _ = db::notifications::delete_by_ids(&db2, &notif_ids).await;
            }
        }

        tokio::time::sleep(Duration::from_secs(10)).await;
    }
}
