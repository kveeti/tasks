use std::{net::SocketAddr, time::Duration};

use axum::http::HeaderValue;
use axum::{body::Body, response::Response, routing::get, routing::post, Router};
use config::CONFIG;
use data::{create_id, get_db};
use hyper::{Method, Request};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::{info_span, Span};
use tracing_subscriber::{
    filter, prelude::__tracing_subscriber_SubscriberExt, util::SubscriberInitExt,
};
use types::RequestContextStruct;

mod auth;
mod endpoints;
pub mod types;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(filter::LevelFilter::DEBUG)
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::OPTIONS,
            Method::PATCH,
            Method::DELETE,
            Method::PUT,
            Method::HEAD,
        ])
        .allow_origin(
            "http://localhost:3000"
                .parse::<HeaderValue>()
                .expect("Invalid origin"),
        )
        .allow_credentials(true);

    let db = get_db().await;
    let state = RequestContextStruct::new(db);

    let v1_auth_routes = Router::new().merge(
        Router::new()
            .route("/google-init", get(endpoints::auth::auth_init_endpoint))
            .route(
                "/google-verify-code",
                get(endpoints::auth::auth_verify_code_endpoint),
            ),
    );

    let v1_notif_subs_routes =
        Router::new().route("/", post(endpoints::notif_subs::add_notif_sub_endpoint));

    let v1_sync_routes = Router::new().route("/", post(endpoints::sync::sync_endpoint));

    let v1_tasks_routes = Router::new().route("/", post(endpoints::tasks::add_task_endpoint));

    let v1_routes = Router::new()
        .nest("/auth", v1_auth_routes)
        .nest("/notif-subs", v1_notif_subs_routes)
        .nest("/sync", v1_sync_routes)
        .nest("/tasks", v1_tasks_routes);

    let api_routes = Router::new().nest("/v1", v1_routes);

    let app = Router::new()
        .nest("/api", api_routes)
        .with_state(state)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request<Body>| {
                    info_span!(
                        "request",
                        id = %create_id(),
                        method = %request.method(),
                        uri = %request.uri(),
                    )
                })
                .on_response(|response: &Response, latency: Duration, _span: &Span| {
                    tracing::info!(
                        "response latency: {:?}, status: {:?}",
                        latency,
                        response.status()
                    );
                })
                .on_request(|request: &Request<Body>, _span: &Span| {
                    tracing::info!("request: {:?}", request);
                }),
        )
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));

    tracing::info!("App started in {}, listening at {}", CONFIG.env, addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
