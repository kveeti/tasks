use anyhow::Context;
use dotenv::dotenv;
use once_cell::sync::Lazy;

#[derive(Clone, serde::Deserialize)]
pub struct Config {
    pub database_url: String,
    pub secret: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub front_url: String,
    pub vapid_public_key: String,
    pub vapid_private_key: String,
}

impl Config {
    pub fn new() -> Result<Self, anyhow::Error> {
        dotenv().expect("error loading environment variables from .env");

        let config = envy::from_env::<Self>().context("invalid environment variables")?;

        return Ok(config);
    }
}

pub static CONFIG: Lazy<Config> = Lazy::new(|| Config::new().expect("error loading config"));

pub static IS_PROD: Lazy<bool> = Lazy::new(|| cfg!(not(debug_assertions)));
