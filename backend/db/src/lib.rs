use config::CONFIG;
use sqlx::PgPool;
use ulid::Ulid;

pub mod tags;
pub mod tasks;

pub type Pool = PgPool;

pub async fn get_db() -> Pool {
    let pool = PgPool::connect(&CONFIG.database_url)
        .await
        .expect("error connecting to database");

    return pool;
}

pub fn create_id() -> String {
    return Ulid::new().to_string();
}
