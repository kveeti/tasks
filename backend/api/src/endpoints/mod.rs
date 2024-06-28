use axum::{
    routing::{delete, get, post},
    Router,
};
use config::IS_PROD;

use crate::state::RequestStateStruct;

mod auth;
mod notif_subs;
mod stats;
mod tags;
mod tasks;
mod users;

pub fn router() -> Router<RequestStateStruct> {
    let mut v1_auth_routes = Router::new()
        .route("/google-init", get(auth::auth_init_endpoint))
        .route("/google-verify", post(auth::auth_verify_endpoint))
        .route("/me", get(auth::auth_me_endpoint))
        .route("/logout", get(auth::auth_logout_endpoint));

    if !*IS_PROD {
        v1_auth_routes = v1_auth_routes
            .route("/dev-login", get(auth::dev_login))
            .to_owned();
    }

    let v1_notif_subs_routes = Router::new().route(
        "/",
        post(notif_subs::add_notif_sub_endpoint).delete(notif_subs::delete_notif_sub_endpoint),
    );

    let v1_users_routes = Router::new().route("/me", delete(users::users_me_delete_endpoint));

    let v1_tags_routes = Router::new()
        .route("/", get(tags::get_tags).post(tags::add_tag))
        .route("/:tag_id", delete(tags::delete_tag).patch(tags::update_tag));

    let v1_tasks_routes = Router::new()
        .route("/", get(tasks::get_tasks).post(tasks::add_manual_task))
        .route("/:task_id", delete(tasks::delete_task))
        .route(
            "/on-going",
            get(tasks::get_ongoing_task)
                .delete(tasks::stop_ongoing_task)
                .post(tasks::start_task),
        );

    let v1_stats_routes = Router::new()
        .route("/hours-by", get(stats::get_hours_by_stats_endpoint))
        .route(
            "/tag-distribution",
            get(stats::get_tag_distribution_stats_endpoint),
        );

    let v1_routes = Router::new()
        .nest("/auth", v1_auth_routes)
        .nest("/notif-subs", v1_notif_subs_routes)
        .nest("/users", v1_users_routes)
        .nest("/tags", v1_tags_routes)
        .nest("/tasks", v1_tasks_routes)
        .nest("/stats", v1_stats_routes);

    Router::new().nest("/v1", v1_routes)
}
