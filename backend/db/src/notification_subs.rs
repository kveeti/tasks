use crate::{create_id, Db};
use anyhow::Context;

pub struct NotificationSub {
    pub id: String,
    pub user_id: String,
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
}

pub async fn upsert(
    db: &Db,
    user_id: &str,
    endpoint: &str,
    p256dh: &str,
    auth: &str,
) -> Result<NotificationSub, anyhow::Error> {
    let id = create_id();

    let notification_sub = NotificationSub {
        id: id.to_owned(),
        user_id: user_id.to_owned(),
        endpoint: endpoint.to_owned(),
        p256dh: p256dh.to_owned(),
        auth: auth.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO notification_subs (id, user_id, endpoint, p256dh, auth)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, endpoint) DO UPDATE
            SET p256dh = $4, auth = $5
        "#,
        notification_sub.id,
        notification_sub.user_id,
        notification_sub.endpoint,
        notification_sub.p256dh,
        notification_sub.auth,
    )
    .execute(db)
    .await
    .context("error inserting notification sub")?;

    return Ok(notification_sub);
}

pub async fn get_by_endpoint(
    db: &Db,
    endpoint: &str,
) -> Result<Option<NotificationSub>, anyhow::Error> {
    return Ok(sqlx::query_as!(
        NotificationSub,
        r#"
            SELECT * FROM notification_subs
            WHERE endpoint = $1
        "#,
        endpoint
    )
    .fetch_optional(db)
    .await
    .context("error getting notification sub")?);
}

pub async fn get_by_user_ids(
    db: &Db,
    user_ids: &Vec<String>,
) -> Result<Vec<NotificationSub>, anyhow::Error> {
    return Ok(sqlx::query_as!(
        NotificationSub,
        r#"
            SELECT * FROM notification_subs
            WHERE user_id = ANY($1)
        "#,
        user_ids
    )
    .fetch_all(db)
    .await
    .context("error getting notification subs")?);
}
