use crate::{
    auth::user_id::UserId,
    types::{ApiError, RequestState},
};
use anyhow::Context;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Duration, Utc};
use chrono_tz::Tz;
use common::date::{
    end_of_day, end_of_month, end_of_week, end_of_year, start_of_day, start_of_month,
    start_of_week, start_of_year,
};
use db::tasks::{get_hours_by_stats, get_tag_distribution_stats, HoursByStat, StatsPrecision};
use serde_json::json;
use std::collections::HashMap;

pub async fn get_hours_by_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let date = query
        .get("date")
        .ok_or(ApiError::BadRequest("no date".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid date".to_string()))?;

    let precision = query
        .get("precision")
        .ok_or(ApiError::BadRequest("no precision".to_string()))?
        .parse::<StatsPrecision>()
        .map_err(|_| ApiError::BadRequest("invalid precision".to_string()))?;

    let (start, end) = match precision {
        StatsPrecision::Day => (start_of_week(date), end_of_week(date)),
        StatsPrecision::Week => (start_of_month(date), end_of_month(date)),
        StatsPrecision::Month => (start_of_year(date), end_of_year(date)),
    };

    let tz = query.get("tz").map_or(Ok(Tz::UTC), |tz_str| {
        tz_str
            .parse::<Tz>()
            .map_err(|_| ApiError::BadRequest("invalid tz".to_string()))
    })?;

    let stats = get_hours_by_stats(&state.db2, &user_id, &precision, &start, &end, &tz)
        .await
        .context("error getting stats")?;

    return Ok(Json(json!({
        "precision": precision,
        "start": start,
        "end": end,
        "tz": tz,
        "stats": fill_in_missing_days(&precision, &start, &end, &stats),
    })));
}

fn fill_in_missing_days(
    precision: &StatsPrecision,
    start: &DateTime<Utc>,
    end: &DateTime<Utc>,
    stats: &Vec<HoursByStat>,
) -> Vec<HoursByStat> {
    let mut new_stats: Vec<HoursByStat> = Vec::new();
    let mut date = start_of_day(start.clone()).naive_utc();
    let end = end_of_day(end.clone()).naive_utc();

    while date <= end {
        if let Some(stat) = stats.iter().find(|s| s.date == Some(date)) {
            new_stats.push(stat.clone());
        } else {
            new_stats.push(HoursByStat {
                date: Some(date),
                hours: Some(0.0),
            });
        }

        let new_date = match precision {
            StatsPrecision::Day => date + Duration::days(1),
            StatsPrecision::Week => date + Duration::weeks(1),
            StatsPrecision::Month => date + Duration::days(30),
        };

        date = new_date;
    }

    return new_stats;
}

#[derive(serde::Serialize)]
pub struct TagDistributionStat {
    pub tag_label: String,
    pub tag_color: String,
    pub seconds: f64,
    pub percentage: f64,
}

pub async fn get_tag_distribution_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let date = query
        .get("date")
        .ok_or(ApiError::BadRequest("no date".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid date".to_string()))?;

    let precision = query
        .get("precision")
        .ok_or(ApiError::BadRequest("no precision".to_string()))?
        .parse::<StatsPrecision>()
        .map_err(|_| ApiError::BadRequest("invalid precision".to_string()))?;

    let (start, end) = match precision {
        StatsPrecision::Day => (start_of_week(date), end_of_week(date)),
        StatsPrecision::Week => (start_of_month(date), end_of_month(date)),
        StatsPrecision::Month => (start_of_year(date), end_of_year(date)),
    };

    let stats = get_tag_distribution_stats(&state.db2, &user_id, &start, &end)
        .await
        .context("error getting seconds by day")?;

    let total_seconds = stats
        .iter()
        .map(|s| {
            if let Some(seconds) = s.seconds {
                return seconds.floor();
            } else {
                return 0.0;
            }
        })
        .sum::<f64>();

    let stats = stats
        .iter()
        .map(|s| {
            let percentage = if total_seconds > 0.0 {
                (s.seconds.unwrap_or(0.0) / total_seconds) * 100.0
            } else {
                0.0
            };

            return TagDistributionStat {
                tag_label: s.tag_label.clone(),
                tag_color: s.tag_color.clone(),
                seconds: s.seconds.unwrap_or(0.0).floor(),
                percentage: percentage.floor(),
            };
        })
        .collect::<Vec<TagDistributionStat>>();

    return Ok(Json(json!({
        "precision": precision,
        "start": start,
        "end": end,
        "total_seconds": total_seconds,
        "stats": stats,
    })));
}
