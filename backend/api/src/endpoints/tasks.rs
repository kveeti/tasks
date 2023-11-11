use std::collections::HashMap;

use anyhow::Context;
use axum::{
    extract::{Path, Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use entity::tasks;
use hyper::StatusCode;
use sea_orm::{sea_query::OnConflict, ActiveValue, EntityTrait};
use serde_json::json;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, ClientTask, RequestState},
};

pub async fn put_tasks(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Json(tasks): Json<Vec<ClientTask>>,
) -> Result<impl IntoResponse, ApiError> {
    tasks::Entity::insert_many(tasks.clone().into_iter().map(|task| tasks::ActiveModel {
        id: ActiveValue::Set(task.id),
        user_id: ActiveValue::Set(user_id.to_owned()),
        tag_id: ActiveValue::Set(task.tag_id),
        is_manual: ActiveValue::Set(task.is_manual),
        started_at: ActiveValue::Set(task.started_at),
        stopped_at: match task.stopped_at {
            Some(stopped_at) => ActiveValue::Set(Some(stopped_at)),
            None => ActiveValue::NotSet,
        },
        expires_at: ActiveValue::Set(task.expires_at),
        deleted_at: match task.deleted_at {
            Some(deleted_at) => ActiveValue::Set(Some(deleted_at)),
            None => ActiveValue::NotSet,
        },
        updated_at: ActiveValue::Set(task.updated_at),
        created_at: ActiveValue::Set(task.created_at),
        synced_at: ActiveValue::Set(chrono::Utc::now().naive_utc()),
    }))
    .on_conflict(
        OnConflict::column(tasks::Column::Id)
            .update_columns(vec![
                tasks::Column::TagId,
                tasks::Column::IsManual,
                tasks::Column::CreatedAt,
                tasks::Column::UpdatedAt,
                tasks::Column::StoppedAt,
                tasks::Column::DeletedAt,
                tasks::Column::SyncedAt,
            ])
            .to_owned(),
    )
    .exec(&ctx.db)
    .await
    .context("Failed to insert tasks")?;

    ctx.tx
        .send(
            json!({
                "t": "sync",
                "d": { "tasks": tasks }
            })
            .to_string(),
        )
        .ok();

    return Ok(StatusCode::CREATED);
}

pub async fn get_tasks(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let day = match query.get("day") {
        Some(day) => {
            let date = DateTime::parse_from_rfc3339(day);

            match date {
                Ok(date) => date.with_timezone(&Utc),
                Err(_) => {
                    return Ok((
                        StatusCode::BAD_REQUEST,
                        Json(json!({ "error": "invalid day query parameter" })),
                    )
                        .into_response());
                }
            }
        }
        None => {
            return Ok((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "missing day query parameter" })),
            )
                .into_response());
        }
    };

    let tasks = db::tasks::get_tasks_by_day(&ctx.db2, &user_id, &day)
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
    let ongoing_task = db::tasks::get_ongoing_task(&state.db2, &user_id)
        .await
        .context("error getting ongoing task")?;

    if ongoing_task.is_some() {
        return Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "you already have an ongoing task" })),
        )
            .into_response());
    }

    let owns_tag = db::tags::owns_tag(&state.db2, &user_id, &body.tag_id)
        .await
        .context("error checking tag owner")?;

    if owns_tag == false {
        return Ok(StatusCode::FORBIDDEN.into_response());
    }

    db::tasks::start_task(&state.db2, &user_id, &body.tag_id, body.expires_at).await?;

    return Ok(StatusCode::CREATED.into_response());
}

pub async fn stop_ongoing_task(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let ongoing_task = db::tasks::get_ongoing_task(&state.db2, &user_id)
        .await
        .context("error getting ongoing task")?;

    return match ongoing_task {
        Some(task) => {
            db::tasks::stop_task(&state.db2, &user_id, &task.id)
                .await
                .context("error stopping task")?;

            Ok(StatusCode::OK.into_response())
        }
        None => Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "you don't have an ongoing task" })),
        )
            .into_response()),
    };
}

pub async fn delete_task(
    UserId(user_id): UserId,
    State(state): RequestState,
    task_id: Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let owns_task = db::tasks::owns_task(&state.db2, &user_id, &task_id)
        .await
        .context("error checking task owner")?;

    if owns_task == false {
        return Ok(StatusCode::FORBIDDEN.into_response());
    }

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
    let owns_tag = db::tags::owns_tag(&state.db2, &user_id, &body.tag_id)
        .await
        .context("error checking tag owner")?;

    if owns_tag == false {
        return Ok(StatusCode::FORBIDDEN.into_response());
    }

    db::tasks::add_manual_task(
        &state.db2,
        &user_id,
        &body.tag_id,
        &body.started_at,
        &body.expires_at,
    )
    .await
    .context("error adding manual task")?;

    return Ok(StatusCode::CREATED.into_response());
}
