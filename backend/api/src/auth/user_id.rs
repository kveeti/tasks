use anyhow::Context;
use auth::token::verify_token;
use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts},
    headers::{authorization::Bearer, Authorization, Cookie, HeaderMapExt},
    http::request::Parts,
    RequestPartsExt,
};
use chrono::{Duration, Utc};
use hyper::header;

use crate::types::{ApiError, RequestStateStruct};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserId(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for UserId
where
    RequestStateStruct: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let mut from_cookie = false;

        let (token, token_string) = {
            let from_cookie = parts
                .headers
                .typed_get::<Cookie>()
                .and_then(|cookie_header| {
                    cookie_header.get("token").and_then(|token| {
                        from_cookie = true;
                        Some(token.to_string())
                    })
                });

            let from_bearer = parts
                .headers
                .typed_get::<Authorization<Bearer>>()
                .and_then(|token| Some(token.token().to_string()));

            let token_string = from_cookie
                .or(from_bearer)
                .ok_or(ApiError::Unauthorized("no auth".to_string()))?;

            (
                verify_token(&token_string).context("error verifying token")?,
                token_string,
            )
        };

        let state = parts
            .extract_with_state::<RequestStateStruct, _>(state)
            .await
            .context("error extracting state")?;

        let session_id = &token.session_id;
        let user_id = &token.user_id;
        let new_expiry = Utc::now() + Duration::days(30);
        let ok = db::sessions::update_expires_at(&state.db2, session_id, user_id, &new_expiry)
            .await
            .context("error updating session")?;

        if !ok {
            return Err(ApiError::Unauthorized(
                "session and/ user not found".to_string(),
            ));
        }

        if from_cookie {
            parts.headers.insert(
                header::SET_COOKIE,
                format!(
                    "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly",
                    token_string,
                    new_expiry.format("%a, %d %b %Y %T GMT")
                )
                .parse()
                .context("error creating new cookie")?,
            );
        }

        Ok(UserId(user_id.to_string()))
    }
}
