use anyhow::{anyhow, Context};
use auth::{
    cookie::{create_cookie, COOKIE_NAME},
    token::verify_token,
};
use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
    RequestPartsExt,
};
use axum_extra::{headers, typed_header::TypedHeaderRejectionReason, TypedHeader};
use chrono::{Duration, Utc};
use config::CONFIG;
use hyper::header;
use once_cell::sync::Lazy;

use crate::{error::ApiError, state::RequestStateStruct};

use super::session::create_session;

const EXPIRE_AFTER: Lazy<Duration> = Lazy::new(|| Duration::days(30));

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
        let cookies = parts
            .extract::<TypedHeader<headers::Cookie>>()
            .await
            .map_err(|e| match *e.name() {
                header::COOKIE => match e.reason() {
                    TypedHeaderRejectionReason::Missing => {
                        ApiError::Unauthorized("no cookie".to_owned())
                    }
                    _ => ApiError::UnexpectedError(anyhow!("error getting cookies")),
                },
                _ => ApiError::UnexpectedError(anyhow!("error getting cookies")),
            })?;

        let session_cookie = cookies
            .get(COOKIE_NAME)
            .ok_or(ApiError::Unauthorized("no cookie".to_owned()))?;

        let token =
            verify_token(&CONFIG.secret, &session_cookie).context("error verifying token")?;

        let state = parts
            .extract_with_state::<RequestStateStruct, _>(state)
            .await
            .context("error extracting state")?;

        let new_expiry = Utc::now() + *EXPIRE_AFTER;

        let ok = db::sessions::update_expires_at(
            &state.db,
            &token.session_id,
            &token.user_id,
            &new_expiry,
        )
        .await
        .context("error updating session")?;

        if !ok {
            return Err(ApiError::Unauthorized("session not found".to_owned()));
        }

        parts.headers.insert(
            header::SET_COOKIE,
            create_cookie(&session_cookie, &new_expiry)
                .parse()
                .context("error parsing cookie")?,
        );

        Ok(UserId(token.user_id.to_owned()))
    }
}

pub struct Auth(pub AuthStruct);

pub struct AuthStruct {
    pub user_id: String,
    pub session_id: String,
}

#[async_trait]
impl<S> FromRequestParts<S> for Auth
where
    RequestStateStruct: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let cookies = parts
            .extract::<TypedHeader<headers::Cookie>>()
            .await
            .map_err(|e| match *e.name() {
                header::COOKIE => match e.reason() {
                    TypedHeaderRejectionReason::Missing => {
                        ApiError::Unauthorized("no cookie".to_owned())
                    }
                    _ => ApiError::UnexpectedError(anyhow!("error getting cookies")),
                },
                _ => ApiError::UnexpectedError(anyhow!("error getting cookies")),
            })?;

        let session_cookie = cookies
            .get(COOKIE_NAME)
            .ok_or(ApiError::Unauthorized("no cookie".to_owned()))?;

        let token =
            verify_token(&CONFIG.secret, &session_cookie).context("error verifying token")?;

        let state = parts
            .extract_with_state::<RequestStateStruct, _>(state)
            .await
            .context("error extracting state")?;

        let new_expiry = Utc::now() + *EXPIRE_AFTER;

        let cookie = create_session(&state.db, &new_expiry, &token.user_id)
            .await
            .context("error creating session")?;

        parts.headers.insert(
            header::SET_COOKIE,
            cookie.parse().context("error parsing cookie")?,
        );

        Ok(Auth(AuthStruct {
            user_id: token.user_id.to_owned(),
            session_id: token.session_id.to_owned(),
        }))
    }
}
