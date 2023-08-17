use anyhow::Context;
use auth::token::{create_token, decode_token};
use axum::{
    async_trait,
    extract::FromRequestParts,
    headers::{authorization::Bearer, Authorization, Cookie, HeaderMapExt},
    http::request::Parts,
};
use hyper::header;

use crate::types::ApiError;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserId(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for UserId
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let token = {
            let from_cookie = parts
                .headers
                .typed_get::<Cookie>()
                .and_then(|cookie_header| {
                    cookie_header
                        .get("token")
                        .and_then(|token| Some(token.to_string()))
                });

            let from_bearer = parts
                .headers
                .typed_get::<Authorization<Bearer>>()
                .and_then(|token| Some(token.token().to_string()));

            let token = from_cookie
                .or(from_bearer)
                .ok_or_else(|| ApiError::UnauthorizedError("No auth provided".to_string()))?;

            decode_token(&token).context("Failed to decode token")?
        };

        let user_id = token.claims.sub;

        let new_expiry = chrono::Utc::now().naive_utc() + chrono::Duration::days(7);

        // update token in cookie so it doesn't expire
        parts.headers.insert(
            header::SET_COOKIE,
            format!(
                "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly",
                create_token(&user_id, new_expiry)?,
                new_expiry.format("%a, %d %b %Y %T GMT")
            )
            .parse()
            .context("Failed to create new cookie")?,
        );

        Ok(UserId(user_id))
    }
}
