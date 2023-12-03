use anyhow::{Context, Ok};
use config::CONFIG;
use cookie::Cookie;

static COOKIE_NAME: &str = "token";

pub fn create_cookie<'a>(
    token: &str,
    expiry: &chrono::DateTime<chrono::Utc>,
) -> anyhow::Result<Cookie<'a>> {
    return Ok(Cookie::build((COOKIE_NAME, token.to_string()))
        .path("/")
        .same_site(cookie::SameSite::Strict)
        .secure(CONFIG.env == config::Env::Prod)
        .http_only(true)
        .expires(
            cookie::time::OffsetDateTime::from_unix_timestamp(expiry.timestamp()).context(
                "error converting chrono::DateTime<chrono::Utc> to cookie::time::OffsetDateTime",
            )?,
        )
        .build());
}

pub fn create_empty_cookie<'a>() -> anyhow::Result<Cookie<'a>> {
    return Ok(Cookie::build((COOKIE_NAME, ""))
        .path("/")
        .same_site(cookie::SameSite::Strict)
        .secure(CONFIG.env == config::Env::Prod)
        .http_only(true)
        .expires(
            cookie::time::OffsetDateTime::from_unix_timestamp(0)
                .context("error getting expired cookie expiry timestamp")?,
        )
        .build());
}
