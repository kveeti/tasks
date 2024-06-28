#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
pub struct ClientTag {
    pub id: String,
    pub label: String,
    pub color: String,
    pub was_last_used: bool,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
    pub deleted_at: Option<chrono::NaiveDateTime>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
pub struct ClientTask {
    pub id: String,
    pub tag_id: String,
    pub is_manual: bool,
    pub started_at: chrono::NaiveDateTime,
    pub expires_at: chrono::NaiveDateTime,
    pub stopped_at: Option<chrono::NaiveDateTime>,
    pub deleted_at: Option<chrono::NaiveDateTime>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}
