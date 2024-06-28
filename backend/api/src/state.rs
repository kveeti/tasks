use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts, State},
    http::request::Parts,
};

use crate::error::ApiError;

#[derive(Clone)]
pub struct RequestStateStruct {
    pub db: db::Db,
}

impl RequestStateStruct {
    pub fn new(db: db::Db) -> Self {
        Self { db }
    }
}

pub type RequestState = State<RequestStateStruct>;

#[async_trait]
impl<S> FromRequestParts<S> for RequestStateStruct
where
    Self: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(_parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        Ok(Self::from_ref(state))
    }
}
