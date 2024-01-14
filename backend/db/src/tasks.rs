use crate::Db;
use anyhow::Context;
use chrono::{DateTime, NaiveDateTime, Utc};
use std::str::FromStr;

#[derive(Debug, serde::Serialize)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub tag_id: String,
    pub is_manual: bool,
    pub seconds: i32,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,
}

#[derive(Debug, serde::Serialize)]
pub struct TaskWithTag {
    pub id: String,
    pub user_id: String,
    pub tag_id: String,
    pub is_manual: bool,
    pub seconds: i32,
    pub start_at: DateTime<Utc>,
    pub end_at: DateTime<Utc>,

    pub tag_label: String,
    pub tag_color: String,
}

pub struct TagColor(pub String);
pub struct TagLabel(pub String);

impl TaskWithTag {
    pub fn from_task(task: &Task, tag_color: &TagColor, tag_label: &TagLabel) -> Self {
        return TaskWithTag {
            id: task.id.to_owned(),
            user_id: task.user_id.to_owned(),
            tag_id: task.tag_id.to_owned(),
            is_manual: task.is_manual,
            seconds: task.seconds,
            start_at: task.start_at.to_owned(),
            end_at: task.end_at.to_owned(),

            tag_label: tag_label.0.to_owned(),
            tag_color: tag_color.0.to_owned(),
        };
    }
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

pub async fn get_many(
    db: &Db,
    user_id: &str,
    last_id: Option<&str>,
) -> Result<Vec<TaskWithTag>, anyhow::Error> {
    let tasks_with_tags = if let Some(last_id) = last_id {
        sqlx::query_as!(
            TaskWithTag,
            r#"
                SELECT tasks.*, tags.color AS tag_color, tags.label AS tag_label
                FROM tasks
                INNER JOIN tags ON tasks.tag_id = tags.id
                WHERE tasks.user_id = $1
                AND tasks.id < $2
                ORDER BY tasks.start_at DESC
                LIMIT $3;
            "#,
            user_id,
            last_id,
            TASKS_PER_PAGE,
        )
        .fetch_all(db)
        .await
        .context("error fetching tasks")?
    } else {
        sqlx::query_as!(
            TaskWithTag,
            r#"
                SELECT tasks.*, tags.color AS tag_color, tags.label AS tag_label
                FROM tasks
                INNER JOIN tags ON tasks.tag_id = tags.id
                WHERE tasks.user_id = $1
                ORDER BY tasks.start_at DESC
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

pub async fn get_ongoing(db: &Db, user_id: &str) -> Result<Option<TaskWithTag>, anyhow::Error> {
    let ongoing_task = sqlx::query_as!(
        TaskWithTag,
        r#"
            SELECT tasks.*, tags.color AS tag_color, tags.label AS tag_label
            FROM tasks
            INNER JOIN tags ON tasks.tag_id = tags.id
            WHERE tasks.user_id = $1
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

pub async fn insert(db: &Db, task: &Task) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            INSERT INTO tasks (id, user_id, tag_id, is_manual, start_at, end_at, seconds)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        task.id,
        task.user_id,
        task.tag_id,
        task.is_manual,
        task.start_at,
        task.end_at,
        task.seconds,
    )
    .execute(db)
    .await
    .context("error inserting task")?;

    return Ok(());
}

pub async fn update(db: &Db, task: &Task) -> Result<(), anyhow::Error> {
    sqlx::query!(
        r#"
            UPDATE tasks
            SET tag_id = $1, is_manual = $2, start_at = $3, end_at = $4, seconds = $5
            WHERE id = $6
            AND user_id = $7
        "#,
        task.tag_id,
        task.is_manual,
        task.start_at,
        task.end_at,
        task.seconds,
        task.id,
        task.user_id,
    )
    .execute(db)
    .await
    .context("error updating task")?;

    return Ok(());
}

pub async fn delete(db: &Db, user_id: &str, task_id: &str) -> Result<(), anyhow::Error> {
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
pub enum StatsPrecision {
    Day,
    Week,
    Month,
}

impl FromStr for StatsPrecision {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "day" => Ok(StatsPrecision::Day),
            "week" => Ok(StatsPrecision::Week),
            "month" => Ok(StatsPrecision::Month),
            _ => Err(anyhow::anyhow!("invalid precision")),
        }
    }
}

impl AsRef<str> for StatsPrecision {
    fn as_ref(&self) -> &str {
        match self {
            StatsPrecision::Day => "day",
            StatsPrecision::Week => "week",
            StatsPrecision::Month => "month",
        }
    }
}

impl ToString for StatsPrecision {
    fn to_string(&self) -> String {
        self.as_ref().to_string()
    }
}

#[derive(serde::Serialize, Clone)]
pub struct HoursByStat {
    pub date: Option<NaiveDateTime>,
    pub hours: Option<f64>,
    pub tag_label: String,
}

#[derive(serde::Serialize, Clone)]
pub struct StatByDate {
    pub date: NaiveDateTime,
    pub stats: Vec<StatByTag>,
}

#[derive(serde::Serialize, Clone)]
pub struct StatByTag {
    pub tag_id: String,
    pub tag_label: String,
    pub tag_color: String,
    pub hours: f64,
}

pub async fn get_hours_by_stats(
    db: &Db,
    user_id: &str,
    precision: &StatsPrecision,
    start: &NaiveDateTime,
    end: &NaiveDateTime,
    tz: &chrono_tz::Tz,
) -> Result<Vec<StatByDate>, anyhow::Error> {
    let data = sqlx::query!(
        r#"
            SELECT
                tasks.tag_id,
                tags.label as tag_label,
                tags.color as tag_color,
                date_trunc($1, start_at AT TIME ZONE $5) AS date,
                CAST(SUM(tasks.seconds / 3600.0) as float) AS hours
            FROM
                tasks
            JOIN
                tags ON tasks.tag_id = tags.id
            WHERE
                tasks.user_id = $2
                AND start_at AT TIME ZONE $5 >= $3
                AND start_at AT TIME ZONE $5 <= $4
            GROUP BY
                date,
                tasks.tag_id,
                tag_label,
                tag_color
            ORDER BY
                date ASC;
        "#,
        precision.as_ref(),
        user_id,
        start,
        end,
        tz.name(),
    )
    .fetch_all(db)
    .await
    .context("error fetching tasks")?;

    let mut stats: Vec<StatByDate> = vec![];

    // TODO: horrible looking
    for stat in data {
        match stat.date {
            Some(stat_date) => match stat.hours {
                Some(stat_hours) => {
                    let existing = stats.iter().position(|s| s.date == stat_date);

                    match existing {
                        Some(pos) => stats[pos].stats.push(StatByTag {
                            tag_id: stat.tag_id,
                            tag_label: stat.tag_label,
                            tag_color: stat.tag_color,
                            hours: stat_hours,
                        }),
                        None => stats.push(StatByDate {
                            date: stat_date,
                            stats: vec![StatByTag {
                                tag_id: stat.tag_id,
                                tag_label: stat.tag_label,
                                tag_color: stat.tag_color,
                                hours: stat_hours,
                            }],
                        }),
                    }
                }
                None => continue,
            },
            None => continue,
        }
    }

    return Ok(stats);
}

#[derive(serde::Serialize, Debug)]
pub struct TagDistributionStat {
    pub tag_label: String,
    pub tag_color: String,
    pub seconds: Option<i64>,
}

pub async fn get_tag_distribution_stats(
    db: &Db,
    user_id: &str,
    start: &NaiveDateTime,
    end: &NaiveDateTime,
    tz: &chrono_tz::Tz,
) -> Result<Vec<TagDistributionStat>, anyhow::Error> {
    let tag_distribution = sqlx::query_as!(
        TagDistributionStat,
        r#"
            SELECT
                tags.label AS tag_label,
                tags.color AS tag_color,
                SUM(seconds) AS seconds
            FROM
                tasks
            INNER JOIN
                tags
            ON
                tasks.tag_id = tags.id
            WHERE
                tasks.user_id = $1
                AND tasks.start_at AT TIME ZONE $4 >= $2
                AND tasks.start_at AT TIME ZONE $4 <= $3
            GROUP BY
                tag_label,
                tag_color
            ORDER BY
                seconds DESC;
        "#,
        user_id,
        start,
        end,
        tz.name()
    )
    .fetch_all(db)
    .await
    .context("error fetching tasks")?;

    return Ok(tag_distribution);
}
