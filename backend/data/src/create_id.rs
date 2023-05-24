use ulid::Ulid;

pub fn create_id() -> String {
    return Ulid::new().to_string();
}
