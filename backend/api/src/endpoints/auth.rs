use crate::{
    auth::user_id::{Auth, UserId},
    error::ApiError,
    state::RequestState,
};
use anyhow::Context;
use auth::{cookie::create_empty_cookie, token::create_token};
use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
    Json,
};
use chrono::{Duration, Utc};
use config::CONFIG;
use hyper::{header, HeaderMap, StatusCode};
use std::collections::HashMap;

pub async fn auth_init_endpoint() -> Result<impl IntoResponse, ApiError> {
    let url = hyper::Uri::builder()
        .scheme("https")
        .authority("accounts.google.com")
        .path_and_query(format!(
            "/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=email&prompt=select_account",
            CONFIG.google_client_id,
            format!("{}/auth/callback", CONFIG.front_url),
        ))
        .build().context("error building auth url")?;

    return Ok(Redirect::to(&url.to_string()));
}

#[derive(serde::Deserialize)]
struct AccessTokenResponseBody {
    pub access_token: String,
}

#[derive(serde::Deserialize)]
struct OAuthUserInfoResponseBody {
    pub email: String,
}

pub async fn auth_verify_endpoint(
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let code = query
        .get("code")
        .ok_or(ApiError::BadRequest(
            "missing 'code' query parameter".to_string(),
        ))?
        .to_string();

    let client = reqwest::Client::new();

    let access_token_response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code),
            ("client_id", CONFIG.google_client_id.to_string()),
            ("client_secret", CONFIG.google_client_secret.to_string()),
            (
                "redirect_uri",
                format!("{}/auth/callback", CONFIG.front_url),
            ),
            ("grant_type", "authorization_code".to_string()),
        ])
        .send()
        .await
        .context("error sending access token request")?;

    if access_token_response.status() != reqwest::StatusCode::OK {
        let status = access_token_response.status();
        let access_token_response_body = access_token_response
            .text()
            .await
            .context("error parsing access token response body")?;

        tracing::error!(
            "error getting access token - status: {}, body: {}",
            status,
            access_token_response_body
        );

        return Err(ApiError::UnexpectedError(anyhow::Error::msg(format!(
            "error getting access token - status: {}",
            status,
        ))));
    }

    let access_token_response_body = access_token_response
        .json::<AccessTokenResponseBody>()
        .await
        .context("error parsing access token response body")?;

    let oauth_me_response_body = client
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(access_token_response_body.access_token.to_string())
        .send()
        .await
        .context("error sending user request")?
        .json::<OAuthUserInfoResponseBody>()
        .await
        .context("error parsing user response body")?;

    let existing_user = db::users::get_by_email(&state.db, &oauth_me_response_body.email)
        .await
        .context("error getting existing user")?;

    let user = match existing_user {
        Some(user) => user,
        None => {
            let user = db::users::create(&state.db, &oauth_me_response_body.email)
                .await
                .context("error creating user")?;

            user
        }
    };

    let expires_at = Utc::now() + Duration::days(30);

    let session_id = db::sessions::insert(&state.db, &user.id, &expires_at)
        .await
        .context("error creating session")?;

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        format!(
            "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly",
            create_token(&CONFIG.secret, &user.id, &session_id),
            expires_at.format("%a, %d %b %Y %T GMT")
        )
        .parse()
        .context("error creating cookie header")?,
    )]);

    return Ok((StatusCode::OK, headers, Json(user)));
}

pub async fn auth_me_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    let user = db::users::get_by_id(&state.db, &user_id)
        .await
        .context("error getting user")?
        .ok_or(ApiError::Unauthorized("user not found".to_string()))?;

    return Ok((StatusCode::OK, Json(user)));
}

pub async fn auth_logout_endpoint(
    Auth(auth): Auth,
    State(state): RequestState,
) -> Result<impl IntoResponse, ApiError> {
    db::sessions::delete(&state.db, &auth.session_id, &auth.user_id)
        .await
        .context("error deleting session")?;

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        create_empty_cookie().parse().context("error parsing cookie")?,
    )]);

    return Ok((StatusCode::OK, headers));
}

#[cfg(debug_assertions)]
pub async fn dev_login(State(state): RequestState) -> Result<impl IntoResponse, ApiError> {
    use auth::cookie::create_cookie;

    let email = "dev@dev.local";

    let existing_user = db::users::get_by_email(&state.db, email)
        .await
        .context("error getting existing user")?;

    let user_id = match existing_user {
        Some(user) => user.id,
        None => {
            let user = db::users::create(&state.db, email)
                .await
                .context("error creating user")?;

            user.id
        }
    };

    let expires_at = Utc::now() + Duration::days(30);

    let session_id = db::sessions::insert(&state.db, &user_id, &expires_at)
        .await
        .context("error creating session")?;

    let headers: HeaderMap = HeaderMap::from_iter(vec![
        (
            header::SET_COOKIE,
            create_cookie(
                &create_token(&CONFIG.secret, &user_id, &session_id),
                &expires_at,
            )
            .parse()
            .context("error parsing cookie header")?,
        ),
        (
            header::LOCATION,
            "http://localhost:3000/app"
                .parse()
                .context("error parsing location header")?,
        ),
    ]);

    return Ok((StatusCode::SEE_OTHER, headers));
}
