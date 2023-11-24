use std::{collections::HashMap, str::FromStr};

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
use chrono::{DateTime, NaiveDateTime, Utc};
use db::tasks::{get_seconds_by_day, StatsTimeframe};

pub async fn get_stats_endpoint(
    UserId(user_id): UserId,
    State(state): RequestState,
    Query(query): Query<HashMap<String, String>>,
) -> Result<impl IntoResponse, ApiError> {
    let date = query
        .get("date")
        .ok_or(ApiError::BadRequest("no date".to_string()))?
        .parse::<DateTime<chrono::Utc>>()
        .map_err(|_| ApiError::BadRequest("invalid date".to_string()))?;

    let timeframe = query
        .get("timeframe")
        .ok_or(ApiError::BadRequest("no timeframe".to_string()))?
        .parse::<StatsTimeframe>()
        .map_err(|_| ApiError::BadRequest("invalid timeframe".to_string()))?;

    let start = match timeframe {
        StatsTimeframe::Day => date,
        StatsTimeframe::Week => date - chrono::Duration::days(7),
        StatsTimeframe::Month => date - chrono::Duration::days(30),
        StatsTimeframe::Year => date - chrono::Duration::days(365),
    };

    Ok(())
}

fn start_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), date.day()),
            chrono::NaiveTime::from_hms(0, 0, 0),
        ),
        Utc,
    );
}

fn end_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), date.day()),
            chrono::NaiveTime::from_hms(23, 59, 59),
        ),
        Utc,
    );
}

fn start_of_week(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), date.day()),
            chrono::NaiveTime::from_hms(0, 0, 0),
        )
        .with_previous_or_same(chrono::Weekday::Mon)
        .unwrap(),
        Utc,
    );
}

fn end_of_week(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), date.day()),
            chrono::NaiveTime::from_hms(23, 59, 59),
        )
        .with_next_or_same(chrono::Weekday::Sun)
        .unwrap(),
        Utc,
    );
}

fn start_of_month(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), 1),
            chrono::NaiveTime::from_hms(0, 0, 0),
        ),
        Utc,
    );
}

fn end_of_month(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), date.month(), 1),
            chrono::NaiveTime::from_hms(23, 59, 59),
        )
        .with_last_day_of_month()
        .unwrap(),
        Utc,
    );
}

fn start_of_year(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), 1, 1),
            chrono::NaiveTime::from_hms(0, 0, 0),
        ),
        Utc,
    );
}

fn end_of_year(date: DateTime<Utc>) -> DateTime<Utc> {
    return DateTime::from_utc(
        NaiveDateTime::new(
            chrono::NaiveDate::from_ymd(date.year(), 1, 1),
            chrono::NaiveTime::from_hms(23, 59, 59),
        )
        .with_last_day_of_year()
        .unwrap(),
        Utc,
    );
}
