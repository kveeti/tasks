use crate::{create_id, Db};
use anyhow::Context;
use chrono::{DateTime, Utc};

#[derive(Debug, serde::Serialize)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub tag_id: String,
    pub is_manual: bool,
    pub seconds: Option<i32>,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct TaskWithTag {
    pub id: String,
    pub user_id: String,
    pub tag_id: String,
    pub is_manual: bool,
    pub seconds: Option<i32>,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,

    pub tag_label: String,
    pub tag_color: String,
}

pub async fn owns_task(db: &Db, user_id: &str, task_id: &str) -> Result<bool, anyhow::Error> {
    let owns_task = sqlx::query!(
        r#"
            SELECT EXISTS (
                SELECT 1 FROM tasks
                WHERE id = $1
                AND user_id = $2
            )
        "#,
        task_id,
        user_id
    )
    .fetch_one(db)
    .await
    .context("error checking task owner")?
    .exists
    .context("error checking task owner")?;

    return Ok(owns_task);
}

const TASKS_PER_PAGE: i64 = 30;

pub async fn get_tasks(
    db: &Db,
    user_id: &str,
    last_id: Option<&str>,
) -> Result<Vec<TaskWithTag>, anyhow::Error> {
    let tasks_with_tags = if let Some(last_id) = last_id {
        sqlx::query_as!(
            TaskWithTag,
            r#"
                SELECT tasks.*, tags.label AS tag_label, tags.color AS tag_color
                FROM tasks
                INNER JOIN tags ON tasks.tag_id = tags.id
                WHERE tasks.user_id = $1
                AND tasks.id < $2
                ORDER BY tasks.id DESC
                LIMIT 30;
            "#,
            user_id,
            last_id,
        )
        .fetch_all(db)
        .await
        .context("error fetching tasks")?
    } else {
        sqlx::query_as!(
            TaskWithTag,
            r#"
                SELECT tasks.*, tags.label AS tag_label, tags.color AS tag_color
                FROM tasks
                INNER JOIN tags ON tasks.tag_id = tags.id
                WHERE tasks.user_id = $1
                ORDER BY tasks.id DESC
                LIMIT $2;
            "#,
            user_id,
            TASKS_PER_PAGE,
        )
        .fetch_all(db)
        .await
        .context("error fetching tasks")?
    };

    return Ok(tasks_with_tags);
}

pub async fn get_ongoing_task(
    db: &Db,
    user_id: &str,
) -> Result<Option<TaskWithTag>, anyhow::Error> {
    let ongoing_task = sqlx::query_as!(
        TaskWithTag,
        r#"
            SELECT tasks.*, tags.label AS tag_label, tags.color AS tag_color 
            FROM tasks
            INNER JOIN tags ON tasks.tag_id = tags.id
            WHERE tasks.user_id = $1
            AND tasks.seconds IS NULL
            AND tasks.start_at < $2
            AND tasks.end_at > $3
        "#,
        user_id,
        Utc::now(),
        Utc::now(),
    )
    .fetch_optional(db)
    .await
    .context("error fetching ongoing task")?;

    return Ok(ongoing_task);
}

pub async fn add_manual_task(
    db: &Db,
    user_id: &str,
    tag_id: &str,
    start_at: &DateTime<Utc>,
    end_at: &DateTime<Utc>,
) -> Result<Task, anyhow::Error> {
    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_id: tag_id.to_owned(),
        is_manual: true,
        seconds: None,
        start_at: start_at.to_owned(),
        end_at: end_at.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO tasks (id, user_id, tag_id, is_manual, start_at, end_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        task.id,
        task.user_id,
        task.tag_id,
        task.is_manual,
        task.start_at,
        task.end_at,
    )
    .execute(db)
    .await
    .context("error inserting manual task")?;

    return Ok(task);
}

pub async fn start_task(
    db: &Db,
    user_id: &str,
    tag_id: &str,
    end_at: &DateTime<Utc>,
) -> Result<Task, anyhow::Error> {
    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_id: tag_id.to_owned(),
        is_manual: false,
        seconds: None,
        start_at: Utc::now(),
        end_at: end_at.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO tasks (id, user_id, tag_id, is_manual, start_at, end_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        task.id,
        task.user_id,
        task.tag_id,
        task.is_manual,
        task.start_at,
        task.end_at,
    )
    .execute(db)
    .await
    .context("error inserting task")?;

    return Ok(task);
}

pub async fn stop_task(db: &Db, user_id: &str, task_id: &str) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            UPDATE tasks
            SET end_at = NOW(), seconds = EXTRACT(EPOCH FROM NOW() - start_at)
            WHERE id = $1
            AND user_id = $2
        "#,
        task_id,
        user_id,
    )
    .execute(db)
    .await
    .context("error stopping task")?;

    return Ok(());
}

pub async fn delete_task(db: &Db, user_id: &str, task_id: &str) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            DELETE FROM tasks
            WHERE id = $1
            AND user_id = $2
        "#,
        task_id,
        user_id
    )
    .execute(db)
    .await
    .context("error deleting task")?;

    return Ok(());
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SecondsByDay {
    pub day: Option<DateTime<Utc>>,
    pub seconds: Option<i64>,
}

pub async fn get_seconds_by_day(
    db: &Db,
    user_id: &str,
) -> Result<Vec<SecondsByDay>, anyhow::Error> {
    return Ok(sqlx::query_as!(
        SecondsByDay,
        r#"
            SELECT DATE_TRUNC('day', start_at) AS day, SUM(seconds) AS seconds
            FROM tasks
            WHERE user_id = $1
            GROUP BY day
            ORDER BY day DESC
        "#,
        user_id,
    )
    .fetch_all(db)
    .await
    .context("error fetching tasks")?);
}
