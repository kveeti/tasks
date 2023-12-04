use anyhow::Context;
use chrono::{Datelike, Duration, NaiveDate, NaiveDateTime};

pub fn end_of_month(dt: &NaiveDateTime) -> anyhow::Result<NaiveDateTime> {
    let (year, month) = if dt.month() == 12 {
        (dt.year() + 1, 1)
    } else {
        (dt.year(), dt.month() + 1)
    };

    let next_month = NaiveDate::from_ymd_opt(year, month, 1)
        .context("error from_ymd_opt")?
        .and_hms_opt(0, 0, 0)
        .context("error and_hms_opt")?;

    return Ok(next_month - Duration::seconds(1));
}

pub fn start_of_day(dt: &NaiveDateTime) -> anyhow::Result<NaiveDateTime> {
    let start_of_day = NaiveDate::from_ymd_opt(dt.year(), dt.month(), dt.day())
        .context("error from_ymd_opt")?
        .and_hms_opt(0, 0, 0)
        .context("error and_hms_opt")?;

    Ok(start_of_day)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_end_of_month_success() {
        // Test for a date within the middle of the month
        let dt1 =
            NaiveDateTime::parse_from_str("2023-03-15 12:34:56", "%Y-%m-%d %H:%M:%S").unwrap();
        let result1 = end_of_month(&dt1);
        assert!(result1.is_ok(), "Expected Ok, got Err: {:?}", result1);
        assert_eq!(
            result1.unwrap(),
            NaiveDateTime::parse_from_str("2023-03-31 23:59:59", "%Y-%m-%d %H:%M:%S").unwrap()
        );

        // Test for the end of December
        let dt2 =
            NaiveDateTime::parse_from_str("2023-12-31 23:59:59", "%Y-%m-%d %H:%M:%S").unwrap();
        let result2 = end_of_month(&dt2);
        assert!(result2.is_ok(), "Expected Ok, got Err: {:?}", result2);
        assert_eq!(
            result2.unwrap(),
            NaiveDateTime::parse_from_str("2023-12-31 23:59:59", "%Y-%m-%d %H:%M:%S").unwrap()
        );

        // Test for the end of February in a leap year
        let dt3 =
            NaiveDateTime::parse_from_str("2024-02-29 12:34:56", "%Y-%m-%d %H:%M:%S").unwrap();
        let result3 = end_of_month(&dt3);
        assert!(result3.is_ok(), "Expected Ok, got Err: {:?}", result3);
        assert_eq!(
            result3.unwrap(),
            NaiveDateTime::parse_from_str("2024-02-29 23:59:59", "%Y-%m-%d %H:%M:%S").unwrap()
        );
    }

    #[test]
    fn test_start_of_day_success() {
        // Test for a date within the middle of the day
        let dt1 =
            NaiveDateTime::parse_from_str("2023-03-15 12:34:56", "%Y-%m-%d %H:%M:%S").unwrap();
        let result1 = start_of_day(&dt1);
        assert!(result1.is_ok(), "Expected Ok, got Err: {:?}", result1);

        // Test for the start of the day (midnight)
        let dt2 =
            NaiveDateTime::parse_from_str("2023-03-15 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap();
        let result2 = start_of_day(&dt2);
        assert!(result2.is_ok(), "Expected Ok, got Err: {:?}", result2);
    }
}
