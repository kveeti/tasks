use crate::types::{ApiError, RequestState};
use anyhow::Context;
use auth::token::create_token;
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
        .build().context("Failed to build auth url")?;

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

#[derive(serde::Serialize)]
struct AuthVerifyCodeResponseBody {
    pub id: String,
    pub email: String,
}

pub async fn auth_verify_code_endpoint(
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let client = reqwest::Client::new();

    let code = query
        .get("code")
        .ok_or(ApiError::BadRequest(
            "Missing 'code' query parameter".to_string(),
        ))?
        .to_string();

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

    if access_token_response.status() != StatusCode::OK {
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

    let existing_user = db::users::get_by_email(&state.db2, &oauth_me_response_body.email)
        .await
        .context("error getting existing user")?;

    let user_id = match existing_user {
        Some(user) => user.id,
        None => {
            let user = db::users::create(&state.db2, &oauth_me_response_body.email)
                .await
                .context("error creating user")?;

            user.id
        }
    };

    let expires_at = Utc::now() + Duration::days(7);

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        format!(
            "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly",
            create_token(&user_id, expires_at)?,
            expires_at.format("%a, %d %b %Y %T GMT")
        )
        .parse()
        .context("error creating cookie header")?,
    )]);

    return Ok((
        StatusCode::OK,
        headers,
        Json(AuthVerifyCodeResponseBody {
            id: user_id,
            email: oauth_me_response_body.email.to_owned(),
        }),
    ));
}

pub async fn dev_login(State(state): RequestState) -> Result<impl IntoResponse, ApiError> {
    let email = "dev@dev.local";

    let existing_user = db::users::get_by_email(&state.db2, email)
        .await
        .context("error getting existing user")?;

    let (user_id, email) = match existing_user {
        Some(user) => (user.id, user.email),
        None => {
            let user = db::users::create(&state.db2, email)
                .await
                .context("error creating user")?;

            (user.id, user.email)
        }
    };

    let expires_at = Utc::now() + Duration::days(30);

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        format!(
            "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly;",
            create_token(&user_id, expires_at)?,
            expires_at.format("%a, %d %b %Y %T GMT")
        )
        .parse()
        .context("error creating cookie header")?,
    )]);

    return Ok((
        StatusCode::OK,
        headers,
        Json(AuthVerifyCodeResponseBody { id: user_id, email }),
    ));
}
