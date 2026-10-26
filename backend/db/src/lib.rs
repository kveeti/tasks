use config::CONFIG;
use sqlx::PgPool;
use ulid::Ulid;

pub mod notification_subs;
pub mod notifications;
pub mod sessions;
pub mod tags;
pub mod tasks;
pub mod users;

pub type Db = PgPool;

pub async fn get_db() -> Db {
    let pool = PgPool::connect(&CONFIG.database_url)
        .await
        .expect("error connecting to database");

    sqlx::migrate!()
        .run(&pool)
        .await
        .expect("error running migrations");
    tracing::info!("migrated!");

    return pool;
}

pub async fn ping(db: &Db) -> Result<(), sqlx::Error> {
    sqlx::query("SELECT 1").execute(db).await?;
    Ok(())
}

pub fn create_id() -> String {
    return Ulid::new().to_string();
}
