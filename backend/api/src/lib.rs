use axum::{body::Body, response::Response, Router};
use config::CONFIG;
use hyper::http::HeaderValue;
use hyper::{header, Method, Request};
use state::RequestStateStruct;
use std::{net::SocketAddr, time::Duration};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::{info_span, Span};

mod auth;
pub mod date;
mod endpoints;
pub mod error;
mod state;
pub mod types;

pub async fn start_api() -> () {
    let db = db::get_db().await;
    let state = RequestStateStruct::new(db);

    let router = endpoints::router();

    let app = Router::new()
        .nest("/api", router)
        .with_state(state)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request<Body>| {
                    info_span!(
                        "request",
                        id = %db::create_id(),
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
                }),
        )
        .layer(cors());

    let addr = SocketAddr::from(([0, 0, 0, 0], CONFIG.port));

    tracing::info!("app listening at {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}

fn cors() -> CorsLayer {
    CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::OPTIONS,
            Method::PATCH,
            Method::DELETE,
            Method::HEAD,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            header::ACCEPT_ENCODING,
            header::ACCEPT_LANGUAGE,
        ])
        .allow_origin(
            CONFIG
                .front_url
                .parse::<HeaderValue>()
                .expect("Invalid allow_origin value"),
        )
        .allow_credentials(true)
}
