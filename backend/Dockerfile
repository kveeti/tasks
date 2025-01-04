from rust:1.83-slim as base
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

from gcr.io/distroless/cc-debian12 as runtime
copy --from=builder /app/server /usr/local/bin/server
copy --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
expose 8000
entrypoint ["server"]
