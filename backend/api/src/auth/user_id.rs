use anyhow::Context;
use auth::token::decode_token;
use axum::{
    async_trait,
    extract::FromRequestParts,
    headers::{authorization::Bearer, Authorization, Cookie, HeaderMapExt},
    http::request::Parts,
};

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

        Ok(UserId(token.claims.sub))
    }
}
