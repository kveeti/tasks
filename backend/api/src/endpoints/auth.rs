use std::collections::HashMap;

use anyhow::Context;
use auth::token::create_token;
use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
    Json,
};
use config::CONFIG;
use entity::users::{self, Entity as UserEntity};
use hyper::{header, HeaderMap, StatusCode};
use sea_orm::{sea_query::OnConflict, EntityTrait};
use serde_json::json;
use ulid::Ulid;

use crate::types::{ApiError, RequestContext};

pub async fn auth_init_endpoint() -> Result<impl IntoResponse, ApiError> {
    let url = hyper::Uri::builder()
        .scheme("https")
        .authority("accounts.google.com")
        .path_and_query(format!(
            "/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=email&prompt=select_account",
            CONFIG.google_client_id,
            CONFIG.google_redirect_url,
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

pub async fn auth_verify_code_endpoint(
    State(state): RequestContext,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let client = reqwest::Client::new();

    let code = query
        .get("code")
        .ok_or(ApiError::BadRequestError(
            "Missing 'code' query parameter".to_string(),
        ))?
        .to_string();

    let access_token_response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code),
            ("client_id", CONFIG.google_client_id.to_string()),
            ("client_secret", CONFIG.google_client_secret.to_string()),
            ("redirect_uri", CONFIG.google_redirect_url.to_string()),
            ("grant_type", "authorization_code".to_string()),
        ])
        .send()
        .await
        .context("Failed to send access token request")?;

    if access_token_response.status() != StatusCode::OK {
        let status = access_token_response.status();
        let access_token_response_body = access_token_response
            .text()
            .await
            .context("Failed to parse access token response body")?;

        tracing::error!(
            "Failed to get access token - status: {}, body: {}",
            status,
            access_token_response_body
        );

        return Err(ApiError::UnexpectedError(anyhow::Error::msg(format!(
            "Failed to get access token - status: {}",
            status,
        ))));
    }

    let access_token_response_body = access_token_response
        .json::<AccessTokenResponseBody>()
        .await
        .context("Failed to parse access token response body")?;

    let oauth_me_response_body = client
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(access_token_response_body.access_token.to_string())
        .send()
        .await
        .context("Failed to send user request")?
        .json::<OAuthUserInfoResponseBody>()
        .await
        .context("Failed to parse user response body")?;

    let user_upsert_result = UserEntity::insert(users::ActiveModel {
        id: sea_orm::ActiveValue::set(Ulid::new().to_string()),
        email: sea_orm::ActiveValue::Set(oauth_me_response_body.email),
        created_at: sea_orm::ActiveValue::set(chrono::Utc::now().naive_utc()),
    })
    .on_conflict(
        OnConflict::column(users::Column::Email)
            .do_nothing()
            .to_owned(),
    )
    .exec(&state.db)
    .await
    .context("Failed to upsert user")?;

    let expires_at = chrono::Utc::now().naive_utc() + chrono::Duration::days(30);

    let headers: HeaderMap = HeaderMap::from_iter(vec![(
        header::SET_COOKIE,
        format!(
            "token={}; Expires={}; Path=/; SameSite=Lax; HttpOnly",
            create_token(&user_upsert_result.last_insert_id, expires_at)?,
            expires_at.format("%a, %d %b %Y %T GMT")
        )
        .parse()
        .context("Failed to create cookie header")?,
    )]);

    return Ok((
        StatusCode::OK,
        headers,
        Json(json!({
            "user_id": user_upsert_result.last_insert_id,
        })),
    ));
}
