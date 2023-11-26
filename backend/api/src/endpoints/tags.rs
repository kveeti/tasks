use std::collections::HashMap;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};
use anyhow::Context;
use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use hyper::StatusCode;

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
    Json(body): Json<AddTagBody>,
) -> Result<impl IntoResponse, ApiError> {
    let existing_tag = db::tags::get_by_label(&ctx.db2, &user_id, &body.label)
        .await
        .context("error fetching existing tag")?;

    let (tag, status_code) = match existing_tag {
        Some(tag) => {
            let tag = db::tags::upsert(&ctx.db2, &user_id, &tag.id, &tag.label, &body.color, &None)
                .await
                .context("error upserting tag")?;

            (tag, StatusCode::OK)
        }
        None => {
            let tag = db::tags::insert(&ctx.db2, &user_id, &body.label, &body.color)
                .await
                .context("error creating tag")?;

            (tag, StatusCode::CREATED)
        }
    };

    return Ok((status_code, Json(tag)));
}

pub async fn delete_tag(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Path(tag_id): Path<String>,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let permanent = query.get("permanent").map(|v| v == "true").unwrap_or(false);

    if permanent {
        db::tags::delete_permanent(&ctx.db2, &user_id, &tag_id)
            .await
            .context("error deleting tag permanently")?;
    } else {
        db::tags::delete_soft(&ctx.db2, &user_id, &tag_id)
            .await
            .context("error deleting tag")?;
    }

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
