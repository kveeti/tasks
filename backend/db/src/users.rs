use crate::{create_id, Pool};
use anyhow::Context;
use chrono::{DateTime, Utc};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn get_by_email(db: &Pool, email: &str) -> Result<Option<User>, anyhow::Error> {
    let user = sqlx::query_as!(
        User,
        r#"
            SELECT * FROM users
            WHERE email = $1
        "#,
        email
    )
    .fetch_optional(db)
    .await
    .context("error fetching user by email")?;

    return Ok(user);
}

pub async fn get_by_id(db: &Pool, user_id: &str) -> Result<Option<User>, anyhow::Error> {
    let user = sqlx::query_as!(
        User,
        r#"
            SELECT * FROM users
            WHERE id = $1
        "#,
        user_id
    )
    .fetch_optional(db)
    .await
    .context("error fetching user by id")?;

    return Ok(user);
}

pub async fn create(db: &Pool, email: &str) -> Result<User, anyhow::Error> {
    let user = User {
        id: create_id(),
        email: email.to_string(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    sqlx::query!(
        r#"
            INSERT INTO users (id, email, created_at, updated_at)
            VALUES ($1, $2, $3, $4)
        "#,
        user.id,
        user.email,
        user.created_at,
        user.updated_at,
    )
    .execute(db)
    .await
    .context("error inserting user")?;

    return Ok(user);
}
