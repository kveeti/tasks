use anyhow::Context;
use axum::{extract::State, response::IntoResponse};
use entity::users;
use hyper::{header, HeaderMap, StatusCode};
use sea_orm::EntityTrait;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

pub async fn users_me_delete_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
) -> Result<impl IntoResponse, ApiError> {
    users::Entity::delete_by_id(user_id)
        .exec(&ctx.db)
        .await
        .context("Failed to delete user")?;

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
