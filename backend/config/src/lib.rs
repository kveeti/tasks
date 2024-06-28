use anyhow::Context;
use once_cell::sync::Lazy;

#[derive(Clone, serde::Deserialize)]
pub struct Config {
    pub database_url: String,
    pub secret: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub port: u16,
    pub front_url: String,
    pub vapid_public_key: String,
    pub vapid_private_key: String,
}

impl Config {
    pub fn new() -> Result<Self, anyhow::Error> {
        #[cfg(debug_assertions)]
        {
            use dotenv::dotenv;
            dotenv().ok();
        }

        let config = envy::from_env::<Self>().context("Invalid environment variables")?;

        return Ok(config);
    }
}

pub static CONFIG: Lazy<Config> = Lazy::new(|| Config::new().expect("Failed to load app config"));

pub static IS_PROD: Lazy<bool> = Lazy::new(|| cfg!(not(debug_assertions)));
