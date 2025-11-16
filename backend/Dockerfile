from rust:1.91-slim as base
workdir /app
run apt update && apt install -y \
    ca-certificates \
    pkg-config \
    libssl-dev
run update-ca-certificates
run cargo install cargo-chef

from base as planner
copy Cargo.toml Cargo.lock .
copy . .
run --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=./target \ 
    cargo chef prepare --recipe-path recipe.json --bin backend

from base as builder
copy --from=planner /app/recipe.json recipe.json
run --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=./target \
    cargo chef cook --release --recipe-path recipe.json --bin backend
copy . .
env SQLX_OFFLINE=true
run --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=./target \
    cargo build --release --bin backend && \
    cp ./target/release/backend server
run chmod +x server

# 13.1-slim
from docker.io/debian@sha256:a347fd7510ee31a84387619a492ad6c8eb0af2f2682b916ff3e643eb076f925a
run apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*
run update-ca-certificates
copy --from=builder /app/server /usr/local/bin/server
expose 8000
entrypoint ["server"]
