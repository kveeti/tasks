use crate::{create_id, Db};
use anyhow::Context;
use chrono::{DateTime, Utc};

#[derive(Debug)]
pub struct Notification {
    pub id: String,
    pub user_id: String,
    pub task_id: String,
    pub title: String,
    pub message: String,
    pub send_at: DateTime<Utc>,
}

pub async fn insert(
    db: &Db,
    user_id: &str,
    task_id: &str,
    title: &str,
    message: &str,
    send_at: &DateTime<Utc>,
) -> Result<Notification, anyhow::Error> {
    let id = create_id();

    let notification = Notification {
        id: id.to_owned(),
        user_id: user_id.to_owned(),
        task_id: task_id.to_owned(),
        title: title.to_owned(),
        message: message.to_owned(),
        send_at: send_at.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO notifications (id, user_id, task_id, title, message, send_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        notification.id,
        notification.user_id,
        notification.task_id,
        notification.title,
        notification.message,
        notification.send_at,
    )
    .execute(db)
    .await
    .context("error inserting notification")?;

    return Ok(notification);
}

pub async fn get_to_send(db: &Db) -> Result<Vec<Notification>, anyhow::Error> {
    return Ok(sqlx::query_as!(
        Notification,
        r#"
            SELECT * FROM notifications
            WHERE send_at <= NOW()
        "#,
    )
    .fetch_all(db)
    .await
    .context("error getting notifications")?);
}

pub async fn delete_by_ids(db: &Db, ids: &Vec<String>) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            DELETE FROM notifications
            WHERE id = ANY($1)
        "#,
        ids
    )
    .execute(db)
    .await
    .context("error deleting notifications")?;

    return Ok(());
}
