use anyhow::Context;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use entity::tags;
use hyper::StatusCode;
use sea_orm::{
    prelude::DateTimeWithTimeZone, ActiveModelTrait, ActiveValue, EntityTrait, IntoActiveModel,
};

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct AddTagEndpointRequestBody {
    id: String,
    label: String,
    created_at: DateTimeWithTimeZone,
    updated_at: DateTimeWithTimeZone,
}

pub async fn add_tag_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Json(body): Json<AddTagEndpointRequestBody>,
) -> Result<impl IntoResponse, ApiError> {
    tags::Entity::insert(tags::ActiveModel {
        id: ActiveValue::Set(body.id),
        user_id: ActiveValue::Set(user_id),
        label: ActiveValue::Set(body.label),
        created_at: ActiveValue::Set(chrono::Utc::now().into()),
        updated_at: ActiveValue::Set(body.updated_at),
        og_created_at: ActiveValue::Set(body.created_at),
    })
    .exec(&ctx.db)
    .await
    .context("Failed to insert tag")?;

    Ok(StatusCode::CREATED)
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct UpdateTagEndpointRequestBody {
    label: String,
}

pub async fn update_tag_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Path(tag_id): Path<String>,
    Json(body): Json<UpdateTagEndpointRequestBody>,
) -> Result<impl IntoResponse, ApiError> {
    let tag = tags::Entity::find_by_id(&tag_id)
        .one(&ctx.db)
        .await
        .context("Failed to find tag")?;

    match tag {
        Some(tag) => {
            if tag.user_id != user_id {
                return Err(ApiError::NotFoundError("Tag not found".to_string()));
            }

            let mut tag = tag.into_active_model();

            tag.label = ActiveValue::Set(body.label);
            tag.updated_at = ActiveValue::Set(chrono::Utc::now().into());

            tag.save(&ctx.db).await.context("Failed to update tag")?;

            return Ok(StatusCode::OK);
        }
        None => {
            return Err(ApiError::NotFoundError("Tag not found".to_string()));
        }
    }
}

pub async fn delete_tag_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Path(tag_id): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let tag = tags::Entity::find_by_id(&tag_id)
        .one(&ctx.db)
        .await
        .context("Failed to find tag")?;

    match tag {
        Some(tag) => {
            if tag.user_id != user_id {
                return Err(ApiError::NotFoundError("Tag not found".to_string()));
            }

            tags::Entity::delete_by_id(&tag_id)
                .exec(&ctx.db)
                .await
                .context("Failed to delete tag")?;

            return Ok(StatusCode::OK);
        }
        None => {
            return Err(ApiError::NotFoundError("Tag not found".to_string()));
        }
    }
}
