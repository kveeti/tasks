use chrono::{DateTime, Datelike, Duration, Timelike, Utc};

pub fn start_of_week(date: DateTime<Utc>) -> DateTime<Utc> {
    let days_from_start = date.weekday().num_days_from_monday() as i64;
    return start_of_day(date - Duration::days(days_from_start));
}

pub fn end_of_week(date: DateTime<Utc>) -> DateTime<Utc> {
    let days_from_end = 6 - date.weekday().num_days_from_monday() as i64;
    return end_of_day(date + Duration::days(days_from_end));
}

pub fn start_of_month(date: DateTime<Utc>) -> DateTime<Utc> {
    return start_of_day(date.with_day(1).expect("Failed to set day to 1"));
}

pub fn end_of_month(date: DateTime<Utc>) -> DateTime<Utc> {
    let next_month = date
        .with_day(1)
        .expect("Failed to set day to 1")
        .with_month0(date.month0() + 1)
        .expect("Failed to set month to next month");

    return end_of_day(next_month - Duration::days(1));
}

pub fn start_of_year(date: DateTime<Utc>) -> DateTime<Utc> {
    return start_of_day(
        date.with_day(1)
            .expect("Failed to set day to 1")
            .with_month0(0)
            .expect("Failed to set month to 0"),
    );
}

pub fn end_of_year(date: DateTime<Utc>) -> DateTime<Utc> {
    return end_of_day(
        date.with_day(1)
            .expect("Failed to set day to 1")
            .with_month0(11)
            .expect("Failed to set month to 11")
            .with_day(31)
            .expect("Failed to set day to 31"),
    );
}

pub fn start_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
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

pub fn end_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
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

pub fn difference_in_seconds(start: DateTime<Utc>, end: DateTime<Utc>) -> i32 {
    return (end - start).num_seconds() as i32;
}
