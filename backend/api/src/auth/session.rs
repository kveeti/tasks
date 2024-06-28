use anyhow::Context;
use auth::{cookie::create_cookie, token::create_token};
use chrono::{DateTime, Utc};
use config::CONFIG;

pub async fn create_session(
    db: &db::Db,
    expiry: &DateTime<Utc>,
    user_id: &str,
) -> anyhow::Result<String> {
    let session_id = db::sessions::insert(db, user_id, &expiry)
        .await
        .context("error inserting session")?;

    let token = create_token(&CONFIG.secret, user_id, &session_id);

    let cookie = create_cookie(&token, &expiry);

    return Ok(cookie);
}
