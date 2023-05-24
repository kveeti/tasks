use axum::{
    extract::State,
    response::{IntoResponse, Response},
    Json,
};
use data::types::Db;
use handlers::types::HandlerError;
use hyper::StatusCode;
use serde_json::json;

#[derive(Clone)]
pub struct RequestContextStruct {
    pub db: Db,
}

impl RequestContextStruct {
    pub fn new(db: Db) -> Self {
        Self { db }
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
            ApiError::ForbiddenError => (StatusCode::FORBIDDEN, json!({ "message": "Forbidden" })),
        };

        let body = Json(json!({
            "error": error_message,
        }));

        return (status_code, body).into_response();
    }
}

impl From<HandlerError> for ApiError {
    fn from(err: HandlerError) -> Self {
        match err {
            HandlerError::UnexpectedError(err) => ApiError::UnexpectedError(err),
            HandlerError::BadRequestError(err) => ApiError::BadRequestError(err),
        }
    }
}
