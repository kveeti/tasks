use anyhow::Context;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use entity::{tags, tasks};
use hyper::StatusCode;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryTrait};
use serde_json::json;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(Debug, serde::Deserialize)]
pub struct QueryParams {
    pub from: Option<chrono::DateTime<chrono::Utc>>,
}

pub async fn init(
    State(ctx): RequestContext,
    UserId(user_id): UserId,
    Query(query): Query<QueryParams>,
) -> Result<impl IntoResponse, ApiError> {
    let tasks = tasks::Entity::find()
        .filter(tasks::Column::UserId.eq(user_id.to_owned()))
        .apply_if(query.from, |q, last_synced_at| {
            q.filter(tasks::Column::SyncedAt.gt(last_synced_at - chrono::Duration::hours(1)))
        })
        .all(&ctx.db);

    let tags = tags::Entity::find()
        .filter(tags::Column::UserId.eq(user_id.to_owned()))
        .apply_if(query.from, |q, last_synced_at| {
            q.filter(tags::Column::SyncedAt.gt(last_synced_at - chrono::Duration::hours(1)))
        })
        .all(&ctx.db);

    let (tasks, tags) = tokio::try_join!(tasks, tags).context("Failed to fetch tags or tasks")?;

    return Ok((
        StatusCode::OK,
        Json(json!({
            "tasks": tasks,
            "tags": tags,
        })),
    ));
}
