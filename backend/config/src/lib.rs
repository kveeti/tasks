use anyhow::Context;

#[derive(Clone, serde::Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Env {
    Dev,
    Staging,
    Prod,
}

impl std::fmt::Display for Env {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Env::Dev => write!(f, "dev"),
            Env::Staging => write!(f, "staging"),
            Env::Prod => write!(f, "prod"),
        }
    }
}

#[derive(Clone, serde::Deserialize)]
pub struct Config {
    pub env: Env,
    pub db_url: String,
    pub jwt_secret: String,
    pub jwt_aud: String,
    pub jwt_iss: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub port: u16,
    pub front_url: String,
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

pub static CONFIG: once_cell::sync::Lazy<Config> =
    once_cell::sync::Lazy::new(|| Config::new().expect("Failed to load app config"));
