use anyhow::Context;
use dotenv::dotenv;
use once_cell::sync::Lazy;

#[derive(Clone, serde::Deserialize)]
pub struct Config {
    #[serde(default = "default_host")]
    pub host: String,
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
        match dotenv() {
            Ok(_) => {}
            Err(dotenv::Error::Io(error)) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(error).context("error loading .env"),
        }

        let config = envy::from_env::<Self>().context("invalid environment variables")?;

        return Ok(config);
    }
}

fn default_host() -> String {
    "0.0.0.0:8000".to_string()
}

pub static CONFIG: Lazy<Config> = Lazy::new(|| Config::new().expect("error loading config"));

pub static IS_PROD: Lazy<bool> = Lazy::new(|| cfg!(not(debug_assertions)));
