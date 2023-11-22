use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use db::tasks::get_seconds_by_day;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};

pub async fn get_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    Ok(Json(
        get_seconds_by_day(&state.db2, &user_id)
            .await
            .context("error fetching hours by day")?,
    ))
}
