use crate::{auth::user_id::UserId, error::ApiError, state::RequestState};
use anyhow::Context;
use axum::{extract::State, response::IntoResponse};
use hyper::{header, HeaderMap, StatusCode};

pub async fn users_me_delete_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    db::users::delete(&state.db, &user_id)
        .await
        .context("error deleting user")?;

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        format!(
            "token=; Expires={}; Path=/; SameSite=Lax; HttpOnly;",
            chrono::Utc::now().naive_utc().format("%a, %d %b %Y %T GMT")
        )
        .parse()
        .context("Failed to create cookie header")?,
    )]);

    return Ok((StatusCode::NO_CONTENT, headers));
}
