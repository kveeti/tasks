use std::collections::HashMap;

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
use common::date::{
    end_of_day, end_of_month, end_of_week, end_of_year, start_of_day, start_of_month,
    start_of_week, start_of_year,
};
use db::tasks::{get_stats, SecondsByDay, StatsTimeframe};
use serde_json::json;

pub async fn get_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let date = query
        .get("date")
        .ok_or(ApiError::BadRequest("no date".to_string()))?
        .parse::<DateTime<Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid date".to_string()))?;

    let timeframe = query
        .get("timeframe")
        .ok_or(ApiError::BadRequest("no timeframe".to_string()))?
        .parse::<StatsTimeframe>()
        .map_err(|_| ApiError::BadRequest("invalid timeframe".to_string()))?;

    let (start, end) = match timeframe {
        StatsTimeframe::Day => (start_of_day(date), end_of_day(date)),
        StatsTimeframe::Week => (start_of_week(date), end_of_week(date)),
        StatsTimeframe::Month => (start_of_month(date), end_of_month(date)),
        StatsTimeframe::Year => (start_of_year(date), end_of_year(date)),
    };

    let stats = get_stats(&state.db2, &user_id, &timeframe, &start, &end)
        .await
        .context("error getting seconds by day")?;

    return Ok(Json(json!({
        "timeframe": timeframe,
        "start": start,
        "end": end,
        "stats": fill_in_missing_days(&timeframe, &start, &end, &stats),
    })));
}

fn fill_in_missing_days(
    timeframe: &StatsTimeframe,
    start: &DateTime<Utc>,
    end: &DateTime<Utc>,
    stats: &Vec<SecondsByDay>,
) -> Vec<SecondsByDay> {
    let mut new_stats: Vec<SecondsByDay> = stats.to_vec();
    let mut date = start_of_day(start.clone());

    while date <= *end {
        if !new_stats.iter().any(|s| s.date == Some(date)) {
            new_stats.push(SecondsByDay {
                date: Some(date),
                seconds: Some(0),
            });
        }

        let new_date = match timeframe {
            StatsTimeframe::Day => date + Duration::hours(1),
            StatsTimeframe::Week => date + Duration::days(1),
            StatsTimeframe::Month => date + Duration::weeks(1),
            StatsTimeframe::Year => date + Duration::days(30),
        };

        date = new_date;
    }

    return new_stats;
}
