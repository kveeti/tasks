use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use data::create_id;
use entity::notifs;
use hyper::StatusCode;
use sea_orm::EntityTrait;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(serde::Deserialize)]
pub struct AddNotifEndpointBody {
    pub title: String,
    pub message: String,
    pub send_at: chrono::DateTime<chrono::Utc>,
}

pub async fn add_notif_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Json(body): Json<AddNotifEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    notifs::Entity::insert(notifs::ActiveModel {
        id: sea_orm::ActiveValue::Set(create_id()),
        user_id: sea_orm::ActiveValue::Set(user_id),
        title: sea_orm::ActiveValue::Set(body.title),
        message: sea_orm::ActiveValue::Set(body.message),
        created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().into()),
        send_at: sea_orm::ActiveValue::Set(body.send_at.into()),
        sent_at: sea_orm::ActiveValue::NotSet,
    })
    .exec(&ctx.db)
    .await
    .context("Failed to insert notif")?;

    return Ok(StatusCode::CREATED);
}
