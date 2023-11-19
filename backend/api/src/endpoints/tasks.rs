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
use chrono::{DateTime, Utc};
use db::tasks::TaskWithTag;
use hyper::StatusCode;
use serde_json::json;
use std::collections::HashMap;

pub async fn get_tasks(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let last_id = query.get("last_id").map_or(None, |last_id| {
        if last_id.len() == 0 {
            None
        } else {
            Some(last_id.as_str())
        }
    });

    let tasks = db::tasks::get_tasks(&ctx.db2, &user_id, last_id)
        .await
        .context("error fetching tasks")?;

    return Ok((StatusCode::OK, Json(tasks)).into_response());
}

pub async fn get_ongoing_task(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let ongoing_task = db::tasks::get_ongoing_task(&state.db2, &user_id).await?;

    return match ongoing_task {
        Some(task) => Ok((StatusCode::OK, Json(task)).into_response()),
        None => Ok((StatusCode::OK, Json(json!(null))).into_response()),
    };
}

#[derive(serde::Deserialize)]
pub struct StartTaskRequestBody {
    pub tag_id: String,
    pub expires_at: DateTime<Utc>,
}

pub async fn start_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<StartTaskRequestBody>,
) -> Result<impl IntoResponse, ApiError> {
    db::tasks::get_ongoing_task(&state.db2, &user_id)
        .await
        .context("error getting ongoing task")?
        .map_or(Ok(()), |_| {
            Err(ApiError::BadRequest(
                "you already have an ongoing task".to_string(),
            ))
        })?;

    let tag = db::tags::get_one(&state.db2, &user_id, &body.tag_id)
        .await
        .context("error fetching tag")?
        .ok_or(ApiError::BadRequest("tag not found".to_string()))?;

    let task = db::tasks::start_task(&state.db2, &user_id, &body.tag_id, body.expires_at).await?;

    let task_with_tag = TaskWithTag {
        id: task.id.to_owned(),
        user_id: task.user_id,
        tag_id: task.tag_id,
        is_manual: task.is_manual,
        started_at: task.started_at,
        expires_at: task.expires_at,
        stopped_at: task.stopped_at,
        created_at: task.created_at,

        tag_label: tag.label,
        tag_color: tag.color,
    };

    db::notifications::insert(
        &state.db2,
        &user_id,
        &task.id,
        "test notif title",
        "test notif message",
        &task.expires_at,
    )
    .await
    .context("error inserting notification")?;

    return Ok((StatusCode::CREATED, Json(task_with_tag)));
}

pub async fn stop_ongoing_task(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let ongoing_task = db::tasks::get_ongoing_task(&state.db2, &user_id)
        .await
        .context("error getting ongoing task")?
        .ok_or(ApiError::BadRequest(
            "you don't have an ongoing task".to_string(),
        ))?;

    db::tasks::stop_task(&state.db2, &user_id, &ongoing_task.id)
        .await
        .context("error stopping task")?;

    return Ok(StatusCode::OK.into_response());
}

pub async fn delete_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    task_id: Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    db::tasks::delete_task(&state.db2, &user_id, &task_id)
        .await
        .context("error deleting task")?;

    return Ok(StatusCode::NO_CONTENT.into_response());
}

#[derive(serde::Deserialize)]
pub struct AddManualTaskRequestBody {
    pub tag_id: String,
    pub started_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

pub async fn add_manual_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<AddManualTaskRequestBody>,
) -> Result<impl IntoResponse, ApiError> {
    let tag = db::tags::get_one(&state.db2, &user_id, &body.tag_id)
        .await
        .context("error fetching tag")?
        .ok_or(ApiError::BadRequest("tag not found".to_string()))?;

    let task = db::tasks::add_manual_task(
        &state.db2,
        &user_id,
        &body.tag_id,
        &body.started_at,
        &body.expires_at,
    )
    .await
    .context("error adding manual task")?;

    let task_with_tag = TaskWithTag {
        id: task.id,
        user_id: task.user_id,
        tag_id: task.tag_id,
        is_manual: task.is_manual,
        started_at: task.started_at,
        expires_at: task.expires_at,
        stopped_at: task.stopped_at,
        created_at: task.created_at,

        tag_label: tag.label,
        tag_color: tag.color,
    };

    return Ok((StatusCode::CREATED, Json(task_with_tag)));
}
