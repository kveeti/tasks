use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
};
use data::types::Db;
use hyper::StatusCode;
use serde_json::json;
use tokio::sync::broadcast;

#[derive(Clone)]
pub struct RequestContextStruct {
    pub db: Db,
    pub tx: broadcast::Sender<String>,
}

impl RequestContextStruct {
    pub fn new(db: Db) -> Self {
        Self {
            db,
            tx: broadcast::channel(1000).0,
        }
    }
}

pub type RequestContext = State<RequestContextStruct>;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error(transparent)]
    UnexpectedError(#[from] anyhow::Error),

    #[error("{0}")]
    BadRequestError(String),

    #[error("{0}")]
    UnauthorizedError(String),

    #[error("{0}")]
    NotFoundError(String),

    #[error("Forbidden")]
    ForbiddenError,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status_code, error_message) = match self {
            ApiError::UnexpectedError(err) => {
                tracing::error!("Unexpected error: {:#?}", err);

                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({ "message": "Internal server error" }),
                )
            }
            ApiError::BadRequestError(err) => {
                tracing::info!("Validation error: {:#?}", err);

                (StatusCode::BAD_REQUEST, json!({ "message": err }))
            }
            ApiError::UnauthorizedError(err) => {
                (StatusCode::UNAUTHORIZED, json!({ "message": err }))
            }
            ApiError::NotFoundError(err) => (StatusCode::NOT_FOUND, json!({ "message": err })),
            ApiError::ForbiddenError => (StatusCode::FORBIDDEN, json!({ "message": "Forbidden" })),
        };

        let body = Json(json!({
            "error": error_message,
        }));

        return (status_code, body).into_response();
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
