use crate::{
    auth::user_id::UserId,
    date::start_of_day,
    types::{ApiError, RequestState},
};
use anyhow::Context;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Duration, Months, NaiveDateTime, TimeZone, Utc};
use chrono_tz::Tz;
use db::tasks::{
    get_hours_by_stats, get_tag_distribution_stats, HoursByStat, StatByDate, StatByTag,
    StatsPrecision,
};
use indexmap::IndexSet;
use serde_json::json;
use std::collections::{HashMap, HashSet};

#[derive(serde::Serialize, Debug, Eq, Hash, PartialEq)]
pub struct UniqueTag {
    pub id: String,
    pub label: String,
    pub color: String,
}

pub async fn get_hours_by_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let tz = query.get("tz").map_or(Ok(Tz::UTC), |tz_str| {
        tz_str
            .parse::<Tz>()
            .map_err(|_| ApiError::BadRequest("invalid tz".to_string()))
    })?;

    // TODO: calls with_timezone even if tz is UTC
    let start = query
        .get("start")
        .ok_or(ApiError::BadRequest("no start".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid start".to_string()))?
        .with_timezone(&tz);

    // TODO: calls with_timezone even if tz is UTC
    let end = query
        .get("end")
        .ok_or(ApiError::BadRequest("no end".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid end".to_string()))?
        .with_timezone(&tz);

    let precision = query
        .get("precision")
        .ok_or(ApiError::BadRequest("no precision".to_string()))?
        .parse::<StatsPrecision>()
        .map_err(|_| ApiError::BadRequest("invalid precision".to_string()))?;

    let start_naive = start.naive_local();
    let end_naive = end.naive_local();

    let stats = get_hours_by_stats(
        &state.db2,
        &user_id,
        &precision,
        &start_naive,
        &end_naive,
        &tz,
    )
    .await
    .context("error getting stats")?;

    let mut unique_tags = IndexSet::<UniqueTag>::new();
    for stat_by_date in &stats {
        for stat_by_tag in &stat_by_date.stats {
            unique_tags.insert(UniqueTag {
                id: stat_by_tag.tag_id.to_owned(),
                label: stat_by_tag.tag_label.to_owned(),
                color: stat_by_tag.tag_color.to_owned(),
            });
        }
    }

    let (most_hours, total_hours, stats) =
        fill_in_missing_days(&precision, &start_naive, &end_naive, &stats, &tz)
            .context("error filling in missing days")?;

    let avg_hours = total_hours / stats.len() as f64;

    return Ok(Json(json!({
        "precision": precision,
        "start": start.to_rfc3339(),
        "end": end.to_rfc3339(),
        "most_hours": most_hours,
        "stats": stats,
        "avg_hours": avg_hours,
        "tags": unique_tags
    })));
}

#[derive(serde::Serialize)]
pub struct HoursByStatTz {
    pub date: String,
    pub stats: Vec<StatByTag>,
}

fn fill_in_missing_days(
    precision: &StatsPrecision,
    start: &NaiveDateTime,
    end: &NaiveDateTime,
    stats: &Vec<StatByDate>,
    tz: &Tz,
) -> anyhow::Result<(f64, f64, Vec<HoursByStatTz>)> {
    // turn start date to start of day
    // because dates come as start of day
    // from the database
    let mut date = start_of_day(start).context("error getting start of day")?;

    let mut new_stats: Vec<HoursByStatTz> = Vec::new();
    let mut most_hours = 0.0;
    let mut total_hours = 0.0;

    while date <= *end {
        let stat = match stats.iter().find(|s| s.date == date) {
            Some(stat) => stat.to_owned(),
            None => StatByDate {
                date,
                stats: vec![],
            },
        };

        let total_hours_for_timeframe = stat.stats.iter().fold(0.0, |acc, stat| acc + stat.hours);
        if most_hours < total_hours_for_timeframe {
            most_hours = total_hours_for_timeframe;
        }

        total_hours += total_hours_for_timeframe;

        new_stats.push(HoursByStatTz {
            date: tz.from_local_datetime(&date).unwrap().to_rfc3339(),
            stats: stat.stats,
        });

        let next_date = match precision {
            StatsPrecision::Day => date + Duration::days(1),
            StatsPrecision::Week => date + Duration::weeks(1),
            StatsPrecision::Month => date
                .checked_add_months(Months::new(1))
                .context("error getting next month")?,
        };

        date = next_date;
    }

    return Ok((most_hours, total_hours, new_stats));
}

#[derive(serde::Serialize)]
pub struct TagDistributionStat {
    pub tag_label: String,
    pub tag_color: String,
    pub seconds: i64,
    pub percentage: i64,
}

pub async fn get_tag_distribution_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let tz = query.get("tz").map_or(Ok(Tz::UTC), |tz_str| {
        tz_str
            .parse::<Tz>()
            .map_err(|_| ApiError::BadRequest("invalid tz".to_string()))
    })?;

    // TODO: calls with_timezone even if tz is UTC
    let start = query
        .get("start")
        .ok_or(ApiError::BadRequest("no start".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid start".to_string()))?
        .with_timezone(&tz);

    // TODO: calls with_timezone even if tz is UTC
    let end = query
        .get("end")
        .ok_or(ApiError::BadRequest("no end".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid end".to_string()))?
        .with_timezone(&tz);

    let precision = query
        .get("precision")
        .ok_or(ApiError::BadRequest("no precision".to_string()))?
        .parse::<StatsPrecision>()
        .map_err(|_| ApiError::BadRequest("invalid precision".to_string()))?;

    let stats = get_tag_distribution_stats(
        &state.db2,
        &user_id,
        &start.naive_local(),
        &end.naive_local(),
        &tz,
    )
    .await
    .context("error getting seconds by day")?;

    let total_seconds = stats
        .iter()
        .map(|s| {
            if let Some(seconds) = s.seconds {
                return seconds;
            } else {
                return 0;
            }
        })
        .sum::<i64>();

    let stats = stats
        .iter()
        .map(|s| {
            let percentage = match total_seconds {
                0 => 0.0,
                _ => {
                    let seconds = s.seconds.unwrap_or(0);
                    (seconds as f64 / total_seconds as f64) * 100.0
                }
            };

            return TagDistributionStat {
                tag_label: s.tag_label.clone(),
                tag_color: s.tag_color.clone(),
                seconds: s.seconds.unwrap_or(0),
                percentage: percentage.round() as i64,
            };
        })
        .collect::<Vec<TagDistributionStat>>();

    return Ok(Json(json!({
        "precision": precision,
        "start": start.to_rfc3339(),
        "end": end.to_rfc3339(),
        "total_seconds": total_seconds,
        "stats": stats,
    })));
}
