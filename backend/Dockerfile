FROM rust AS base 
RUN cargo install cargo-chef 
WORKDIR /app

FROM base AS planner
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM base AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release --bin backend

FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*
WORKDIR app
COPY --from=builder /app/target/release/backend /usr/local/bin
ENTRYPOINT ["/usr/local/bin/backend"]