use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use data::create_id;
use entity::notifs;
use hyper::StatusCode;
use sea_orm::{ColumnTrait, EntityTrait, ModelTrait, QueryFilter};

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};

#[derive(serde::Deserialize)]
pub struct AddNotifEndpointBody {
    pub title: String,
    pub message: String,
    pub send_at: chrono::NaiveDateTime,
    pub task_id: String,
}

pub async fn add_notif_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestState,
    Json(body): Json<AddNotifEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    notifs::Entity::insert(notifs::ActiveModel {
        id: sea_orm::ActiveValue::Set(create_id()),
        user_id: sea_orm::ActiveValue::Set(user_id),
        task_id: sea_orm::ActiveValue::Set(body.task_id),
        title: sea_orm::ActiveValue::Set(body.title),
        message: sea_orm::ActiveValue::Set(body.message),
        created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().naive_utc()),
        send_at: sea_orm::ActiveValue::Set(body.send_at),
    })
    .exec(&ctx.db)
    .await
    .context("Failed to insert notif")?;

    return Ok(StatusCode::CREATED);
}

#[derive(serde::Deserialize)]
pub struct DeleteNotifEndpointBody {
    pub task_id: String,
}

pub async fn delete_notif_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<DeleteNotifEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    let notif = notifs::Entity::find()
        .filter(
            notifs::Column::TaskId
                .eq(body.task_id)
                .and(notifs::Column::UserId.eq(user_id)),
        )
        .one(&state.db)
        .await
        .context("Failed to find notif sub")?;

    if let Some(notif) = notif {
        notif
            .delete(&state.db)
            .await
            .context("Failed to delete notif")?;
    }

    return Ok(StatusCode::NO_CONTENT);
}
