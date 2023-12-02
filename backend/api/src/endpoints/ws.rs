use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use std::{net::SocketAddr, vec};

use crate::types::{RequestState, RequestStateStruct};

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(ctx): RequestState,
) -> impl IntoResponse {
    tracing::info!("{}: connected", addr);

    return ws.on_upgrade(move |socket| handle_socket(socket, addr, ctx.clone()));
}

async fn handle_socket(mut socket: WebSocket, who: SocketAddr, ctx: RequestStateStruct) -> () {
    if socket.send(Message::Ping(vec![1])).await.is_ok() {
        tracing::info!("{}: Ping sent", who);
    } else {
        tracing::info!("{}: Ping failed, closing connection", who);
    }

    let (mut sender, mut receiver) = socket.split();

    let mut rx = ctx.tx.subscribe();

    tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                tracing::info!("{}: failed to send message", who);
            }
        }
    });

    tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Ping(_d) => {
                    tracing::info!("{}: Ping received", who);
                }
                Message::Pong(_d) => {
                    tracing::info!("{}: Pong received", who);
                }
                _ => {
                    tracing::info!("{}: unknown message received", who);
                }
            }
        }
    });

    tracing::info!("{}: destroyed", who);
}
