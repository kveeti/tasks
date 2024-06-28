use axum::{
    response::{IntoResponse, Response},
    Json,
};
use hyper::StatusCode;
use serde_json::json;

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
