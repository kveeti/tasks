use chrono::{DateTime, Utc};
use config::IS_PROD;

pub static COOKIE_NAME: &str = "token";

pub fn create_cookie(token: &str, expiry: &DateTime<Utc>) -> String {
    let expiry_formatted = expiry.format("%a, %d %b %Y %T GMT");

    format!(
        "{COOKIE_NAME}={token}; Expires={expiry_formatted}; Path=/; SameSite=Strict; HttpOnly;{}",
        if *IS_PROD { " Secure;" } else { "" }
    )
}

pub fn create_empty_cookie<'a>() -> String {
    format!(
        "{COOKIE_NAME}=; Path=/; SameSite=Strict; HttpOnly;{}",
        if *IS_PROD { " Secure;" } else { "" }
    )
}
