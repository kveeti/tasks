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
use chrono::{DateTime, Duration, Utc};
use common::date::difference_in_seconds;
use db::{
    create_id,
    tasks::{Task, TaskWithTag},
};
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

    let tasks = db::tasks::get_many(&ctx.db2, &user_id, last_id)
        .await
        .context("error fetching tasks")?;

    return Ok((StatusCode::OK, Json(tasks)).into_response());
}

pub async fn get_ongoing_task(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let ongoing_task = db::tasks::get_ongoing(&state.db2, &user_id).await?;

    return match ongoing_task {
        Some(task) => Ok((StatusCode::OK, Json(task)).into_response()),
        None => Ok((StatusCode::OK, Json(json!(null))).into_response()),
    };
}

#[derive(serde::Deserialize)]
pub struct StartTaskRequestBody {
    pub tag_id: String,
    pub seconds: i32,
}

pub async fn start_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<StartTaskRequestBody>,
) -> Result<impl IntoResponse, ApiError> {
    if body.seconds > 60 * 60 * 2 {
        return Err(ApiError::BadRequest(
            "seconds must be less than 2 hours".to_string(),
        ));
    }

    db::tasks::get_ongoing(&state.db2, &user_id)
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

    let start_at = Utc::now();
    let end_at = start_at + Duration::seconds(body.seconds.into());

    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_label: tag.label.to_owned(),
        is_manual: false,
        seconds: body.seconds,
        start_at,
        end_at,
    };

    db::tasks::insert(&state.db2, &task)
        .await
        .context("error inserting task")?;

    let task_with_tag = TaskWithTag::from_task(&task, &tag.color);

    db::notifications::insert(
        &state.db2,
        &user_id,
        &task.id,
        "test notif title",
        "test notif message",
        &task.end_at,
    )
    .await
    .context("error inserting notification")?;

    return Ok((StatusCode::CREATED, Json(task_with_tag)));
}

pub async fn stop_ongoing_task(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let ongoing_task = db::tasks::get_ongoing(&state.db2, &user_id)
        .await
        .context("error getting ongoing task")?
        .ok_or(ApiError::BadRequest(
            "you don't have an ongoing task".to_string(),
        ))?;

    let end_at = Utc::now();

    let task = Task {
        id: ongoing_task.id.to_owned(),
        user_id: user_id.to_owned(),
        tag_label: ongoing_task.tag_label.to_owned(),
        is_manual: ongoing_task.is_manual,
        seconds: difference_in_seconds(&ongoing_task.start_at, &end_at),
        start_at: ongoing_task.start_at,
        end_at,
    };

    db::tasks::update(&state.db2, &task)
        .await
        .context("error updating task")?;

    return Ok(StatusCode::OK.into_response());
}

pub async fn delete_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    task_id: Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    db::tasks::delete(&state.db2, &user_id, &task_id)
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

    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_label: tag.label.to_owned(),
        is_manual: true,
        seconds: difference_in_seconds(&body.started_at, &body.expires_at),
        start_at: body.started_at,
        end_at: body.expires_at,
    };

    db::tasks::insert(&state.db2, &task)
        .await
        .context("error inserting task")?;

    let task_with_tag = TaskWithTag::from_task(&task, &tag.color);

    return Ok((StatusCode::CREATED, Json(task_with_tag)));
}
