use std::{collections::HashMap, time::Duration};

pub use crate::send::send_notification;
mod send;

pub async fn start_notification_service() {
    tracing::info!("starting notification service");

    let db = db::get_db().await;

    tracing::info!("notification service started");

    loop {
        let notifs = db::notifications::get_to_send(&db).await;

        if let Err(e) = notifs {
            tracing::error!("failed to get notifications: {}", e);
        } else if let Ok(notifs) = notifs {
            if notifs.len() > 0 {
                let user_ids = notifs
                    .iter()
                    .map(|n| n.user_id.to_owned())
                    .collect::<Vec<String>>();

                let subs = db::notification_subs::get_by_user_ids(&db, &user_ids).await;

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

                            let futures = subs.iter().map(|sub| {
                                let future = send_notification(&sub, &notif.title, &notif.message);

                                async move {
                                    let response = future.await;

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

                let _ = db::notifications::delete_by_ids(&db, &notif_ids).await;
            }
        }

        tokio::time::sleep(Duration::from_secs(10)).await;
    }
}
