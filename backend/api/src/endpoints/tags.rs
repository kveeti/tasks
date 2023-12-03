use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};
use anyhow::Context;
use axum::{
    extract::{Path, State},
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

static VALID_TAG_COLORS: [&str; 5] = ["#d13c4b", "#1287A8", "#33a02c", "#f28e2c", "#bc80bd"];

pub async fn add_tag(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Json(body): Json<AddTagBody>,
) -> Result<impl IntoResponse, ApiError> {
    if !VALID_TAG_COLORS.contains(&body.color.as_str()) {
        return Err(ApiError::BadRequest(format!(
            "invalid tag color '{}'",
            body.color
        )));
    }

    let existing_tag = db::tags::get_by_label(&ctx.db2, &user_id, &body.label)
        .await
        .context("error fetching tag")?;

    if existing_tag.is_some() {
        return Err(ApiError::BadRequest(format!(
            "you already have a tag labeled '{}'",
            body.label
        )));
    }

    let tag = db::tags::insert(&ctx.db2, &user_id, &body.label, &body.color)
        .await
        .context("error creating tag")?;

    return Ok((StatusCode::CREATED, Json(tag)).into_response());
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
