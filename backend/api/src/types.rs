use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
};
use data::types::Db;
use db::Pool;
use hyper::StatusCode;
use serde_json::json;
use tokio::sync::broadcast;

#[derive(Clone)]
pub struct RequestStateStruct {
    pub db: Db,
    pub db2: Pool,
    pub tx: broadcast::Sender<String>,
}

impl RequestStateStruct {
    pub fn new(db: Db, db2: Pool) -> Self {
        Self {
            db,
            db2,
            tx: broadcast::channel(1000).0,
        }
    }
}

pub type RequestState = State<RequestStateStruct>;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error(transparent)]
    UnexpectedError(#[from] anyhow::Error),

    #[error("{0}")]
    BadRequest(String),

    #[error("{0}")]
    Unauthorized(String),

    #[error("{0}")]
    NotFound(String),

    #[error("forbidden")]
    Forbidden,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status_code, error_message) = match self {
            ApiError::UnexpectedError(err) => {
                tracing::error!("Unexpected error: {:#?}", err);

                (StatusCode::INTERNAL_SERVER_ERROR, "unexpected error".into())
            }
            ApiError::BadRequest(err) => (StatusCode::BAD_REQUEST, err),
            ApiError::Unauthorized(err) => (StatusCode::UNAUTHORIZED, err.into()),
            ApiError::NotFound(err) => (StatusCode::NOT_FOUND, err.into()),
            ApiError::Forbidden => (StatusCode::FORBIDDEN, "forbidden".into()),
        };

        return (status_code, Json(json!({ "error": error_message }))).into_response();
    }
}

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
