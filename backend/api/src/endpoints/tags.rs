use anyhow::Context;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use entity::tags;
use hyper::StatusCode;
use sea_orm::{sea_query::OnConflict, ActiveValue, EntityTrait};
use serde_json::json;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, ClientTag, RequestState},
};

pub async fn put_tags(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Json(tags): Json<Vec<ClientTag>>,
) -> Result<impl IntoResponse, ApiError> {
    tags::Entity::insert_many(tags.clone().into_iter().map(|tag| tags::ActiveModel {
        id: ActiveValue::Set(tag.id),
        user_id: ActiveValue::Set(user_id.to_owned()),
        label: ActiveValue::Set(tag.label),
        color: ActiveValue::Set(tag.color.to_owned()),
        was_last_used: ActiveValue::Set(tag.was_last_used),
        deleted_at: match tag.deleted_at {
            Some(deleted_at) => ActiveValue::Set(Some(deleted_at)),
            None => ActiveValue::NotSet,
        },
        created_at: ActiveValue::Set(tag.created_at),
        updated_at: ActiveValue::Set(tag.updated_at),
        synced_at: ActiveValue::Set(chrono::Utc::now().naive_utc()),
    }))
    .on_conflict(
        OnConflict::column(tags::Column::Id)
            .update_columns(vec![
                tags::Column::Color,
                tags::Column::Label,
                tags::Column::CreatedAt,
                tags::Column::UpdatedAt,
                tags::Column::DeletedAt,
                tags::Column::SyncedAt,
            ])
            .to_owned(),
    )
    .exec(&ctx.db)
    .await
    .context("Failed to insert tags")?;

    ctx.tx
        .send(
            json!({
                "t": "sync",
                "d": { "tags": tags }
            })
            .to_string(),
        )
        .ok();

    return Ok(StatusCode::CREATED);
}

pub async fn get_tags(
    UserId(user_id): UserId,
    State(ctx): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let tags = db::tags::get_all(&ctx.db2, &user_id)
        .await
        .context("error fetching tags")?;

    return Ok((StatusCode::OK, Json(tags)));
}

#[derive(serde::Deserialize)]
pub struct AddTagBody {
    pub label: String,
    pub color: String,
}

pub async fn add_tag(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Json(tag): Json<AddTagBody>,
) -> Result<impl IntoResponse, ApiError> {
    let tag = db::tags::insert(&ctx.db2, &user_id, &tag.label, &tag.color)
        .await
        .context("error inserting tag")?;

    return Ok((StatusCode::CREATED, Json(tag)));
}

pub async fn delete_tag(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Path(tag_id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    db::tags::delete(&ctx.db2, &user_id, &tag_id)
        .await
        .context("error deleting tag")?;

    return Ok(StatusCode::NO_CONTENT);
}

#[derive(serde::Deserialize)]
pub struct UpdateTagBody {
    pub label: String,
    pub color: String,
}
pub async fn update_tag(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Path(tag_id): Path<String>,
    Json(tag): Json<UpdateTagBody>,
) -> Result<impl IntoResponse, ApiError> {
    let tag = db::tags::update(&ctx.db2, &user_id, &tag_id, &tag.label, &tag.color)
        .await
        .context("error updating tag")?;

    return Ok((StatusCode::OK, Json(tag)));
}
