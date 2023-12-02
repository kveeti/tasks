use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};
use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};

use hyper::StatusCode;

#[derive(serde::Deserialize)]
pub struct AddNotifSubEndpointBody {
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
}

pub async fn add_notif_sub_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<AddNotifSubEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    let notification_sub = db::notification_subs::upsert(
        &state.db2,
        &user_id,
        &body.endpoint,
        &body.p256dh,
        &body.auth,
    )
    .await
    .context("error inserting notification sub")?;

    notifications::send_notification(
        &notification_sub,
        "Test notification",
        "If you see this, notifications are working! 🥳",
    )
    .await
    .context("error sending notification")?;

    return Ok(StatusCode::CREATED);
}

#[derive(serde::Deserialize)]
pub struct DeleteNotifSubBody {
    pub endpoint: String,
}

pub async fn delete_notif_sub_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Json(body): Json<DeleteNotifSubBody>,
) -> Result<impl IntoResponse, ApiError> {
    let deleted = db::notification_subs::delete(&state.db2, &user_id, &body.endpoint)
        .await
        .context("error deleting notification sub")?;

    if !deleted {
        return Err(ApiError::NotFound("notification sub not found".to_owned()));
    }

    return Ok(StatusCode::NO_CONTENT);
}
