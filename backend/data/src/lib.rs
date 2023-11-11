use config::CONFIG;
use sea_orm::Database;
use types::Db;

mod create_id;
pub use create_id::create_id;
pub mod types;

pub async fn get_db() -> Db {
    let pool = Database::connect(&CONFIG.database_url)
        .await
        .expect("Failed to connect to database");

    return pool;
}
