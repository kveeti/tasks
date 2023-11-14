use anyhow::Context;
use chrono::{DateTime, Utc};

use crate::{create_id, Pool};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Tag {
    pub id: String,
    pub user_id: String,
    pub label: String,
    pub color: String,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
}

pub async fn get_one(db: &Pool, user_id: &str, tag_id: &str) -> Result<Option<Tag>, anyhow::Error> {
    let tag = sqlx::query_as!(
        Tag,
        r#"
            SELECT * FROM tags
            WHERE user_id = $1
            AND id = $2
            AND deleted_at IS NULL
        "#,
        user_id,
        tag_id
    )
    .fetch_optional(db)
    .await
    .context("error fetching tag")?;

    return Ok(tag);
}

pub async fn get_all(db: &Pool, user_id: &str) -> Result<Vec<Tag>, anyhow::Error> {
    let tags = sqlx::query_as!(
        Tag,
        r#"
            SELECT * FROM tags
            WHERE user_id = $1
            AND deleted_at IS NULL
            ORDER BY created_at DESC
        "#,
        user_id
    )
    .fetch_all(db)
    .await
    .context("error fetching tags")?;

    return Ok(tags);
}

pub async fn insert(
    db: &Pool,
    user_id: &str,
    label: &str,
    color: &str,
) -> Result<Tag, anyhow::Error> {
    let tag = Tag {
        id: create_id(),
        user_id: user_id.to_owned(),
        label: label.to_owned(),
        color: color.to_owned(),
        created_at: chrono::Utc::now(),
        deleted_at: None,
    };

    sqlx::query!(
        r#"
            INSERT INTO tags (id, user_id, label, color, created_at)
            VALUES ($1, $2, $3, $4, $5)
        "#,
        tag.id,
        tag.user_id,
        tag.label,
        tag.color,
        tag.created_at,
    )
    .execute(db)
    .await
    .context("error inserting tag")?;

    return Ok(tag);
}

pub async fn delete_soft(db: &Pool, user_id: &str, tag_id: &str) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            UPDATE tags
            SET deleted_at = NOW()
            WHERE user_id = $1
            AND id = $2
        "#,
        user_id,
        tag_id
    )
    .execute(db)
    .await
    .context("error deleting tag")?;

    return Ok(());
}

pub async fn delete_permanent(db: &Pool, user_id: &str, tag_id: &str) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            DELETE FROM tags
            WHERE user_id = $1
            AND id = $2
        "#,
        user_id,
        tag_id
    )
    .execute(db)
    .await
    .context("error deleting tag")?;

    return Ok(());
}

pub async fn update(
    db: &Pool,
    user_id: &str,
    tag_id: &str,
    label: &str,
    color: &str,
) -> Result<Option<Tag>, anyhow::Error> {
    let tag = sqlx::query_as!(
        Tag,
        r#"
            UPDATE tags
            SET label = $3, color = $4
            WHERE user_id = $1
            AND id = $2
            RETURNING *
        "#,
        user_id,
        tag_id,
        label,
        color,
    )
    .fetch_optional(db)
    .await
    .context("error updating tag")?;

    return Ok(tag);
}
