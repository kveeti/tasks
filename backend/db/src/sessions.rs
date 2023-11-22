use crate::{create_id, Db};
use anyhow::Context;
use chrono::{DateTime, Utc};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub expires_at: DateTime<Utc>,
}

pub async fn get_one(
    db: &Db,
    session_id: &str,
    user_id: &str,
) -> Result<Option<Session>, anyhow::Error> {
    let session = sqlx::query_as!(
        Session,
        r#"
            SELECT * FROM sessions
            WHERE id = $1 AND user_id = $2
        "#,
        session_id,
        user_id
    )
    .fetch_optional(db)
    .await
    .context("error fetching session")?;

    return Ok(session);
}

pub async fn create(
    db: &Db,
    user_id: &str,
    expires_at: &DateTime<Utc>,
) -> Result<String, anyhow::Error> {
    let session_id = create_id();

    sqlx::query!(
        r#"
            INSERT INTO sessions (id, user_id, expires_at)
            VALUES ($1, $2, $3)
        "#,
        session_id,
        user_id,
        expires_at
    )
    .execute(db)
    .await
    .context("error inserting session")?;

    return Ok(session_id);
}

pub async fn update_expires_at(
    db: &Db,
    session_id: &str,
    user_id: &str,
    expires_at: &DateTime<Utc>,
) -> Result<bool, anyhow::Error> {
    let res = sqlx::query!(
        r#"
            UPDATE sessions
            SET expires_at = $1
            WHERE id = $2 AND user_id = $3
        "#,
        expires_at,
        session_id,
        user_id
    )
    .execute(db)
    .await
    .context("error updating session")?;

    return Ok(res.rows_affected() == 1);
}

pub async fn delete(db: &Db, session_id: &str, user_id: &str) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            DELETE FROM sessions
            WHERE id = $1 AND user_id = $2
        "#,
        session_id,
        user_id
    )
    .execute(db)
    .await
    .context("error deleting session")?;

    return Ok(());
}
