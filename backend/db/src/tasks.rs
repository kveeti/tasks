use std::str::FromStr;

use crate::{create_id, Db};
use anyhow::Context;
use chrono::{DateTime, Utc};
use common::date::difference_in_seconds;

#[derive(Debug, serde::Serialize)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub tag_label: String,
    pub is_manual: bool,
    pub seconds: Option<i32>,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct TaskWithTag {
    pub id: String,
    pub user_id: String,
    pub tag_label: String,
    pub is_manual: bool,
    pub seconds: Option<i32>,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,

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
                SELECT tasks.*, tags.color AS tag_color
                FROM tasks
                INNER JOIN tags ON tasks.tag_label = tags.label
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
                SELECT tasks.*, tags.color AS tag_color
                FROM tasks
                INNER JOIN tags ON tasks.tag_label = tags.label
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
            SELECT tasks.*, tags.color AS tag_color 
            FROM tasks
            INNER JOIN tags ON tasks.tag_label = tags.label
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
    tag_label: &str,
    start_at: &DateTime<Utc>,
    end_at: &DateTime<Utc>,
) -> Result<Task, anyhow::Error> {
    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_label: tag_label.to_owned(),
        is_manual: true,
        seconds: Some(difference_in_seconds(*start_at, *end_at)),
        start_at: start_at.to_owned(),
        end_at: end_at.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO tasks (id, user_id, tag_label, is_manual, start_at, end_at, seconds)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        task.id,
        task.user_id,
        task.tag_label,
        task.is_manual,
        task.start_at,
        task.end_at,
        task.seconds,
    )
    .execute(db)
    .await
    .context("error inserting manual task")?;

    return Ok(task);
}

pub async fn start_task(
    db: &Db,
    user_id: &str,
    tag_label: &str,
    end_at: &DateTime<Utc>,
) -> Result<Task, anyhow::Error> {
    let task = Task {
        id: create_id(),
        user_id: user_id.to_owned(),
        tag_label: tag_label.to_owned(),
        is_manual: false,
        seconds: None,
        start_at: Utc::now(),
        end_at: end_at.to_owned(),
    };

    sqlx::query!(
        r#"
            INSERT INTO tasks (id, user_id, tag_label, is_manual, start_at, end_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        task.id,
        task.user_id,
        task.tag_label,
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

#[derive(Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StatsTimeframe {
    Day,
    Week,
    Month,
    Year,
}

impl FromStr for StatsTimeframe {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "day" => Ok(StatsTimeframe::Day),
            "week" => Ok(StatsTimeframe::Week),
            "month" => Ok(StatsTimeframe::Month),
            "year" => Ok(StatsTimeframe::Year),
            _ => Err(anyhow::anyhow!("invalid timeframe")),
        }
    }
}

impl AsRef<str> for StatsTimeframe {
    fn as_ref(&self) -> &str {
        match self {
            StatsTimeframe::Day => "day",
            StatsTimeframe::Week => "week",
            StatsTimeframe::Month => "month",
            StatsTimeframe::Year => "year",
        }
    }
}

impl ToString for StatsTimeframe {
    fn to_string(&self) -> String {
        self.as_ref().to_string()
    }
}

#[derive(serde::Serialize, Clone)]
pub struct HoursByStat {
    pub date: Option<DateTime<Utc>>,
    pub hours: Option<f64>,
}

pub async fn get_hours_by_stats(
    db: &Db,
    user_id: &str,
    timeframe: &StatsTimeframe,
    start: &DateTime<Utc>,
    end: &DateTime<Utc>,
) -> Result<Vec<HoursByStat>, anyhow::Error> {
    let seconds_by_day = sqlx::query!(
        r#"
            SELECT date_trunc($1, start_at) AS date, CAST(SUM(seconds) AS float) / CAST(60 AS float) / CAST(60 AS float) AS hours
            FROM tasks
            WHERE user_id = $2
            AND start_at >= $3
            AND start_at <= $4
            GROUP BY date
            ORDER BY date ASC
        "#,
        timeframe.as_ref(),
        user_id,
        start,
        end,
    )
    .fetch_all(db)
    .await
    .context("error fetching tasks")?;

    return Ok(seconds_by_day
        .into_iter()
        .map(|s| HoursByStat {
            date: s.date,
            hours: match s.hours {
                Some(h) => Some(h.round()),
                None => None,
            },
        })
        .collect());
}

#[derive(serde::Serialize, Debug)]
pub struct TagDistributionStat {
    pub tag_label: String,
    pub tag_color: String,
    pub hours: Option<f64>,
}

pub async fn get_tag_distribution_stats(
    db: &Db,
    user_id: &str,
    start: &DateTime<Utc>,
    end: &DateTime<Utc>,
) -> Result<Vec<TagDistributionStat>, anyhow::Error> {
    let tag_distribution = sqlx::query_as!(
        TagDistributionStat,
        r#"
            SELECT 
                tag_label,
                tags.color as tag_color, 
                CAST(SUM(seconds) AS float) / CAST(60 AS float) / CAST(60 AS float) AS hours
            FROM tasks
            INNER JOIN tags ON tasks.tag_label = tags.label
            WHERE tasks.user_id = $1
            AND tasks.start_at >= $2
            AND tasks.start_at <= $3
            GROUP BY tag_label, tag_color
            ORDER BY hours DESC
        "#,
        user_id,
        start,
        end,
    )
    .fetch_all(db)
    .await
    .context("error fetching tasks")?;

    return Ok(tag_distribution);
}
