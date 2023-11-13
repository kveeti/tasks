use crate::{
    auth::user_id::UserId,
    types::{ApiError, ClientTask, RequestState},
};
use anyhow::Context;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use db::tasks::TaskWithTag;
use entity::tasks;
use hyper::StatusCode;
use sea_orm::{sea_query::OnConflict, ActiveValue, EntityTrait};
use serde_json::json;

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
) -> Result<impl IntoResponse, ApiError> {
    let tasks = db::tasks::get_tasks(&ctx.db2, &user_id)
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

    db::tasks::start_task(&state.db2, &user_id, &body.tag_id, body.expires_at).await?;

    let task_with_tag = TaskWithTag {
        id: "".to_string(),
        user_id: user_id.to_string(),
        tag_id: body.tag_id.to_string(),
        is_manual: false,
        started_at: Utc::now(),
        expires_at: body.expires_at,
        stopped_at: None,
        created_at: Utc::now(),

        tag_label: tag.label,
        tag_color: tag.color,
    };

    return Ok((StatusCode::CREATED, Json(task_with_tag)));
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
