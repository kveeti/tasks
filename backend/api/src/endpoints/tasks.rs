use anyhow::Context;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use entity::tasks;
use hyper::StatusCode;
use sea_orm::{
    prelude::DateTimeWithTimeZone, ActiveModelTrait, ActiveValue, EntityTrait, IntoActiveModel,
};

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct AddTaskEndpointBody {
    pub id: String,
    pub tag_id: String,
    pub created_at: DateTimeWithTimeZone,
    pub stopped_at: Option<DateTimeWithTimeZone>,
    pub updated_at: DateTimeWithTimeZone,
    pub expires_at: DateTimeWithTimeZone,
}

pub async fn add_task_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Json(body): Json<AddTaskEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    tasks::Entity::insert(tasks::ActiveModel {
        id: ActiveValue::Set(body.id),
        user_id: ActiveValue::Set(user_id),
        tag_id: ActiveValue::Set(body.tag_id),
        created_at: ActiveValue::Set(chrono::Utc::now().into()),
        stopped_at: ActiveValue::Set(body.stopped_at),
        expires_at: ActiveValue::Set(body.expires_at),
        updated_at: ActiveValue::Set(body.updated_at),
        og_created_at: ActiveValue::Set(body.created_at),
    })
    .exec(&ctx.db)
    .await
    .context("Failed to insert task")?;

    Ok(StatusCode::CREATED)
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct UpdateTaskEndpointBody {
    pub tag_id: Option<String>,
    pub stopped_at: Option<DateTimeWithTimeZone>,
}

pub async fn update_task_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Path(task_id): Path<String>,
    Json(body): Json<UpdateTaskEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    let task = tasks::Entity::find_by_id(&task_id)
        .one(&ctx.db)
        .await
        .context("Failed to find task")?;

    match task {
        Some(task) => {
            if task.user_id != user_id {
                return Err(ApiError::NotFoundError("Task not found".to_string()));
            };

            let mut task = task.into_active_model();
            if let Some(stopped_at) = body.stopped_at {
                task.stopped_at = ActiveValue::Set(stopped_at.into());
            }

            if let Some(tag_id) = body.tag_id {
                task.tag_id = ActiveValue::Set(tag_id);
            }

            if task.is_changed() {
                task.updated_at = ActiveValue::Set(Utc::now().into());
            }

            task.save(&ctx.db).await.context("Failed to update task")?;

            Ok(StatusCode::NO_CONTENT)
        }
        None => {
            return Err(ApiError::NotFoundError("Task not found".to_string()));
        }
    }
}
