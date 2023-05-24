use anyhow::Context;
use config::CONFIG;
use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, TokenData, Validation,
};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn create_token(
    user_id: &str,
    expires_at: chrono::NaiveDateTime,
) -> Result<String, anyhow::Error> {
    return encode(
        &Header::new(Algorithm::HS256),
        &TokenClaims {
            sub: user_id.to_string(),
            exp: expires_at.timestamp() as usize,
            iat: chrono::Utc::now().timestamp() as usize,
        },
        &EncodingKey::from_secret(&CONFIG.jwt_secret.as_ref()),
    )
    .context("Failed to create token");
}

pub fn decode_token(token: &str) -> Result<TokenData<TokenClaims>, anyhow::Error> {
    let mut validation = Validation::new(Algorithm::HS256);

    validation.set_audience(&[&CONFIG.jwt_aud]);
    validation.set_issuer(&[&CONFIG.jwt_iss]);
    validation.set_required_spec_claims(&["sub", "exp", "iat", "aud", "iss"]);

    return decode::<TokenClaims>(
        token,
        &DecodingKey::from_secret(&CONFIG.jwt_secret.as_ref()),
        &validation,
    )
    .context("Failed to decode token");
}
