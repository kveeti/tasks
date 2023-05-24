use anyhow::Context;
use axum::{extract::State, response::IntoResponse, Json};
use chrono::NaiveDateTime;
use entity::{
    tags::{self, Entity as TagsEntity},
    tasks::{self, Entity as TasksEntity},
};
use hyper::StatusCode;
use sea_orm::{
    sea_query::OnConflict, ColumnTrait, Condition, EntityTrait, QueryFilter, QueryTrait,
};
use serde_json::json;

use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestContext},
};

#[derive(serde::Deserialize, serde::Serialize)]
pub struct SyncEndpointTask {
    pub id: String,
    pub tag_id: String,
    pub created_at: NaiveDateTime,
    pub stopped_at: Option<NaiveDateTime>,
    pub updated_at: NaiveDateTime,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct SyncEndpointTag {
    pub id: String,
    pub label: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(serde::Deserialize, serde::Serialize)]
pub struct SyncEndpointBody {
    pub last_synced_at: Option<chrono::NaiveDateTime>,
    pub tasks: Vec<SyncEndpointTask>,
    pub tags: Vec<SyncEndpointTag>,
}

pub async fn sync_endpoint(
    UserId(user_id): UserId,
    State(ctx): RequestContext,
    Json(body): Json<SyncEndpointBody>,
) -> Result<impl IntoResponse, ApiError> {
    if body.tags.len() > 0 {
        tracing::info!("Upserting {} tags", body.tasks.len());

        TagsEntity::insert_many(body.tags.into_iter().map(|task| tags::ActiveModel {
            id: sea_orm::ActiveValue::Set(task.id),
            user_id: sea_orm::ActiveValue::Set(user_id.to_owned()),
            label: sea_orm::ActiveValue::Set(task.label),
            created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().naive_utc()),
            updated_at: sea_orm::ActiveValue::Set(task.updated_at),
            og_created_at: sea_orm::ActiveValue::Set(task.created_at),
        }))
        .on_conflict(
            OnConflict::column(tasks::Column::Id)
                .update_columns(vec![tasks::Column::UpdatedAt])
                .to_owned(),
        )
        .exec(&ctx.db)
        .await
        .context("Failed to upsert tags")?;
    }

    if body.tasks.len() > 0 {
        tracing::info!("Upserting {} tasks", body.tasks.len());

        TasksEntity::insert_many(body.tasks.into_iter().map(|task| tasks::ActiveModel {
            id: sea_orm::ActiveValue::Set(task.id),
            user_id: sea_orm::ActiveValue::Set(user_id.to_owned()),
            tag_id: sea_orm::ActiveValue::Set(task.tag_id),
            created_at: sea_orm::ActiveValue::Set(chrono::Utc::now().naive_utc()),
            stopped_at: sea_orm::ActiveValue::Set(task.stopped_at),
            updated_at: sea_orm::ActiveValue::Set(task.updated_at),
            og_created_at: sea_orm::ActiveValue::Set(task.created_at),
        }))
        .on_conflict(
            OnConflict::column(tasks::Column::Id)
                .update_columns(vec![tasks::Column::TagId, tasks::Column::UpdatedAt])
                .to_owned(),
        )
        .exec(&ctx.db)
        .await
        .context("Failed to upsert tasks")?;
    }

    let tags_out_of_date_on_client = TagsEntity::find()
        .filter(tags::Column::UserId.eq(user_id.to_owned()))
        .apply_if(body.last_synced_at, |q, last_synced_at| {
            q.filter(
                Condition::any()
                    .add(tags::Column::UpdatedAt.gt(last_synced_at))
                    .add(tags::Column::OgCreatedAt.gt(last_synced_at)),
            )
        })
        .all(&ctx.db)
        .await
        .context("Failed to find tags out of date on client")?;

    let tasks_out_of_date_on_client = TasksEntity::find()
        .filter(tasks::Column::UserId.eq(user_id))
        .apply_if(body.last_synced_at, |q, last_synced_at| {
            q.filter(
                Condition::any()
                    .add(tasks::Column::UpdatedAt.gt(last_synced_at))
                    .add(tasks::Column::OgCreatedAt.gt(last_synced_at)),
            )
        })
        .all(&ctx.db)
        .await
        .context("Failed to find tasks out of date on client")?;

    return Ok((
        StatusCode::CREATED,
        Json(json!({
            "tags": tags_out_of_date_on_client.into_iter().map(|tag| SyncEndpointTag {
                id: tag.id,
                label: tag.label,
                created_at: tag.og_created_at,
                updated_at: tag.updated_at,
            }).collect::<Vec<_>>(),
            "tasks": tasks_out_of_date_on_client .into_iter().map(|task| SyncEndpointTask {
                id: task.id,
                tag_id: task.tag_id,
                created_at: task.og_created_at,
                stopped_at: task.stopped_at,
                updated_at: task.updated_at,
            }).collect::<Vec<_>>(),
        })),
    ));
}
