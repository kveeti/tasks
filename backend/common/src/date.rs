use anyhow::Context;
use chrono::{DateTime, Datelike, Duration, TimeZone, Timelike};

pub fn start_of_week<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    let days_from_start = date.weekday().num_days_from_monday() as i64;
    return start_of_day(&(date.clone() - Duration::days(days_from_start)));
}

pub fn end_of_week<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    let days_from_end = 6 - date.weekday().num_days_from_monday() as i64;
    return end_of_day(&(date.clone() + Duration::days(days_from_end)));
}

pub fn start_of_month<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return start_of_day(&date.with_day(1).expect("error setting day to 1"));
}

pub fn end_of_month<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    let next_month = next_month(date).context("error getting next month")?;
    return Ok(next_month - Duration::days(1));
}

pub fn next_month<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    if date.month() == 12 {
        return next_year(date).context("error getting next year");
    }

    return date
        .with_month(date.month() + 1)
        .context("error setting month to next month");
}

pub fn next_year<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return start_of_year(date)
        .context("error getting start of year")?
        .with_year(date.year() + 1)
        .context("error setting year to next year");
}

pub fn start_of_year<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return start_of_day(
        &date
            .with_day(1)
            .expect("error setting day to 1")
            .with_month0(0)
            .expect("error setting month to 0"),
    );
}

pub fn end_of_year<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return end_of_day(
        &date
            .with_day(1)
            .context("error setting day to 1")?
            .with_month0(11)
            .context("error setting month to 11")?
            .with_day(31)
            .context("error setting day to 31")?,
    )
    .context("error getting end of day");
}

pub fn start_of_day<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return date
        .with_hour(0)
        .context("error setting hour to 0")?
        .with_minute(0)
        .context("error setting minute to 0")?
        .with_second(0)
        .context("error setting second to 0")?
        .with_nanosecond(0)
        .context("error setting nanosecond to 0");
}

pub fn end_of_day<Tz>(date: &DateTime<Tz>) -> anyhow::Result<DateTime<Tz>>
where
    Tz: TimeZone,
{
    return date
        .with_hour(23)
        .context("error setting hour to 23")?
        .with_minute(59)
        .context("error setting minute to 59")?
        .with_second(59)
        .context("error setting second to 59")?
        .with_nanosecond(999_999_999)
        .context("error setting nanosecond to 999_999_999");
}

pub fn difference_in_seconds<Tz>(start: &DateTime<Tz>, end: &DateTime<Tz>) -> i32
where
    Tz: TimeZone,
{
    return (end.clone() - start.clone()).num_seconds() as i32;
}
