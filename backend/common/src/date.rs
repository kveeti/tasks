use chrono::{DateTime, Datelike, Duration, TimeZone, Timelike, Utc};

pub fn start_of_week<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    let days_from_start = date.weekday().num_days_from_monday() as i64;
    return start_of_day(date - Duration::days(days_from_start));
}

pub fn end_of_week<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    let days_from_end = 6 - date.weekday().num_days_from_monday() as i64;
    return end_of_day(date + Duration::days(days_from_end));
}

pub fn start_of_month<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    return start_of_day(date.with_day(1).expect("Failed to set day to 1"));
}

pub fn end_of_month<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    let next_month = date
        .with_day(1)
        .expect("Failed to set day to 1")
        .with_month0(date.month0() + 1)
        .expect("Failed to set month to next month");

    return end_of_day(next_month - Duration::days(1));
}

pub fn start_of_year<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    return start_of_day(
        date.with_day(1)
            .expect("Failed to set day to 1")
            .with_month0(0)
            .expect("Failed to set month to 0"),
    );
}

pub fn end_of_year<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    return end_of_day(
        date.with_day(1)
            .expect("Failed to set day to 1")
            .with_month0(11)
            .expect("Failed to set month to 11")
            .with_day(31)
            .expect("Failed to set day to 31"),
    );
}

pub fn start_of_day<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    return date
        .with_hour(0)
        .expect("Failed to set hour to 0")
        .with_minute(0)
        .expect("Failed to set minute to 0")
        .with_second(0)
        .expect("Failed to set second to 0")
        .with_nanosecond(0)
        .expect("Failed to set nanosecond to 0");
}

pub fn end_of_day<Tz>(date: DateTime<Tz>) -> DateTime<Tz>
where
    Tz: TimeZone,
{
    return date
        .with_hour(23)
        .expect("Failed to set hour to 23")
        .with_minute(59)
        .expect("Failed to set minute to 59")
        .with_second(59)
        .expect("Failed to set second to 59")
        .with_nanosecond(999_999_999)
        .expect("Failed to set nanosecond to 999_999_999");
}

pub fn difference_in_seconds<Tz>(start: &DateTime<Tz>, end: &DateTime<Tz>) -> i32
where
    Tz: TimeZone + Copy + Clone,
{
    return (end.clone() - start.clone()).num_seconds() as i32;
}
