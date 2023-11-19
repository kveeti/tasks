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
    db::notification_subs::get_by_endpoint(&state.db2, &body.endpoint)
        .await
        .context("error getting existing notification sub")?
        .map_or(Ok(()), |_| {
            Err(ApiError::BadRequest(
                "notification sub already exists".to_owned(),
            ))
        })?;

    db::notification_subs::insert(
        &state.db2,
        &user_id,
        &body.endpoint,
        &body.p256dh,
        &body.auth,
    )
    .await
    .context("error inserting notification sub")?;

    return Ok(StatusCode::CREATED);
}
