use api::start_api;
use notifications::start_notification_service;
use tracing_subscriber::{
    prelude::__tracing_subscriber_SubscriberExt, util::SubscriberInitExt, EnvFilter,
};

#[tokio::main]
pub async fn main() {
    tracing_subscriber::registry()
        .with(EnvFilter::from(
            "api=trace,auth=debug,data=trace,notifications=debug,sea_orm=trace".to_string(),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    tokio::join!(start_api(), start_notification_service());
}
