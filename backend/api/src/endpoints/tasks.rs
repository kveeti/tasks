use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use chrono::NaiveDateTime;
use entity::tasks;
use hyper::StatusCode;
use sea_orm::{ActiveValue, EntityTrait};

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct AddTaskEndpointBody {
    pub id: String,
    pub tag_id: String,
    pub created_at: NaiveDateTime,
    pub stopped_at: Option<NaiveDateTime>,
    pub updated_at: NaiveDateTime,
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
        created_at: ActiveValue::Set(chrono::Utc::now().naive_utc()),
        stopped_at: ActiveValue::Set(body.stopped_at),
        updated_at: ActiveValue::Set(body.updated_at),
        og_created_at: ActiveValue::Set(body.created_at),
    })
    .exec(&ctx.db)
    .await
    .context("Failed to insert task")?;

    Ok(StatusCode::CREATED)
}
