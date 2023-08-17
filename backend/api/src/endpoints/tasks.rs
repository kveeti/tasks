use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use entity::tasks;
use hyper::StatusCode;
use sea_orm::{sea_query::OnConflict, ActiveValue, EntityTrait};
use serde_json::json;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, ClientTask, RequestContext},
};

pub async fn put_tasks(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Json(tasks): Json<Vec<ClientTask>>,
) -> Result<impl IntoResponse, ApiError> {
    tasks::Entity::insert_many(tasks.clone().into_iter().map(|task| tasks::ActiveModel {
        id: ActiveValue::Set(task.id),
        user_id: ActiveValue::Set(user_id.to_owned()),
        tag_id: ActiveValue::Set(task.tag_id),
        is_manual: ActiveValue::Set(task.is_manual),
        started_at: ActiveValue::Set(task.started_at),
        stopped_at: match task.stopped_at {
            Some(stopped_at) => ActiveValue::Set(Some(stopped_at)),
            None => ActiveValue::NotSet,
        },
        expires_at: ActiveValue::Set(task.expires_at),
        deleted_at: match task.deleted_at {
            Some(deleted_at) => ActiveValue::Set(Some(deleted_at)),
            None => ActiveValue::NotSet,
        },
        updated_at: ActiveValue::Set(task.updated_at),
        created_at: ActiveValue::Set(task.created_at),
        synced_at: ActiveValue::Set(chrono::Utc::now().naive_utc()),
    }))
    .on_conflict(
        OnConflict::column(tasks::Column::Id)
            .update_columns(vec![
                tasks::Column::TagId,
                tasks::Column::IsManual,
                tasks::Column::CreatedAt,
                tasks::Column::UpdatedAt,
                tasks::Column::StoppedAt,
                tasks::Column::DeletedAt,
                tasks::Column::SyncedAt,
            ])
            .to_owned(),
    )
    .exec(&ctx.db)
    .await
    .context("Failed to insert tasks")?;

    ctx.tx
        .send(
            json!({
                "t": "sync",
                "d": { "tasks": tasks }
            })
            .to_string(),
        )
        .ok();

    return Ok(StatusCode::CREATED);
}
