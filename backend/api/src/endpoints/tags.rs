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
