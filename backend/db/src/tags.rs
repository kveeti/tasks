use crate::{create_id, Db};
use anyhow::Context;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Tag {
    pub id: String,
    pub user_id: String,
    pub label: String,
    pub color: String,
}

pub async fn get_one(db: &Db, user_id: &str, tag_id: &str) -> Result<Option<Tag>, anyhow::Error> {
    let tag = sqlx::query_as!(
        Tag,
        r#"
            SELECT * FROM tags
            WHERE user_id = $1
            AND id = $2
        "#,
        user_id,
        tag_id
    )
    .fetch_optional(db)
    .await
    .context("error fetching tag")?;

    return Ok(tag);
}

pub async fn get_by_label(
    db: &Db,
    user_id: &str,
    label: &str,
) -> Result<Option<Tag>, anyhow::Error> {
    let tag = sqlx::query_as!(
        Tag,
        r#"
            SELECT * FROM tags
            WHERE user_id = $1
            AND label = $2
        "#,
        user_id,
        label
    )
    .fetch_optional(db)
    .await
    .context("error fetching tag")?;

    return Ok(tag);
}

pub async fn get_all(db: &Db, user_id: &str) -> Result<Vec<Tag>, anyhow::Error> {
    let tags = sqlx::query_as!(
        Tag,
        r#"
            SELECT * FROM tags
            WHERE user_id = $1
            ORDER BY id DESC
        "#,
        user_id
    )
    .fetch_all(db)
    .await
    .context("error fetching tags")?;

    return Ok(tags);
}

pub async fn insert(
    db: &Db,
    user_id: &str,
    label: &str,
    color: &str,
) -> Result<Tag, anyhow::Error> {
    let tag = Tag {
        id: create_id(),
        user_id: user_id.to_owned(),
        label: label.to_owned(),
        color: color.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO tags (id, user_id, label, color)
            VALUES ($1, $2, $3, $4)
        "#,
        tag.id,
        tag.user_id,
        tag.label,
        tag.color,
    )
    .execute(db)
    .await
    .context("error inserting tag")?;

    return Ok(tag);
}

pub async fn delete(db: &Db, user_id: &str, tag_id: &str) -> Result<(), anyhow::Error> {
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
    db: &Db,
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
