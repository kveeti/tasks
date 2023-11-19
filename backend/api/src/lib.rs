use axum::routing::delete;
use axum::{
    body::Body,
    response::Response,
    routing::{get, post},
    Router,
};
use config::{Env, CONFIG};
use hyper::http::HeaderValue;
use hyper::{header, Method, Request};
use std::{net::SocketAddr, time::Duration};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing::{info_span, Span};
use types::RequestStateStruct;

mod auth;
mod endpoints;
pub mod types;

pub async fn start_api() -> () {
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
        .allow_credentials(true);

    let db2 = db::get_db().await;
    let state = RequestStateStruct::new(db2);

    let mut v1_auth_routes = Router::new()
        .route("/google-init", get(endpoints::auth::auth_init_endpoint))
        .route(
            "/google-callback",
            get(endpoints::auth::auth_callback_endpoint),
        )
        .route("/me", get(endpoints::auth::auth_me_endpoint));

    if CONFIG.env == Env::NotProd {
        v1_auth_routes = v1_auth_routes
            .route("/dev-login", get(endpoints::auth::dev_login))
            .to_owned();
    }

    let v1_notif_subs_routes =
        Router::new().route("/", post(endpoints::notif_subs::add_notif_sub_endpoint));

    let v1_users_routes =
        Router::new().route("/me", delete(endpoints::users::users_me_delete_endpoint));

    let v1_tags_routes = Router::new()
        .route(
            "/",
            get(endpoints::tags::get_tags).post(endpoints::tags::add_tag),
        )
        .route(
            "/:tag_id",
            delete(endpoints::tags::delete_tag).patch(endpoints::tags::update_tag),
        );

    let v1_tasks_routes = Router::new()
        .route(
            "/",
            get(endpoints::tasks::get_tasks).post(endpoints::tasks::add_manual_task),
        )
        .route("/:task_id", delete(endpoints::tasks::delete_task))
        .route(
            "/on-going",
            get(endpoints::tasks::get_ongoing_task)
                .delete(endpoints::tasks::stop_ongoing_task)
                .post(endpoints::tasks::start_task),
        );

    let v1_routes = Router::new()
        .nest("/auth", v1_auth_routes)
        .nest("/notif-subs", v1_notif_subs_routes)
        .nest("/users", v1_users_routes)
        .nest("/tags", v1_tags_routes)
        .nest("/tasks", v1_tasks_routes)
        .route("/ws", get(endpoints::ws::ws_handler));

    let api_routes = Router::new().nest("/v1", v1_routes);

    let app = Router::new()
        .nest("/api", api_routes)
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
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], CONFIG.port));

    tracing::info!("App started in {}, listening at {}", CONFIG.env, addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}
