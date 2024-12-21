FROM rust:1.83-slim AS base
RUN apt update && apt install -y ca-certificates pkg-config libssl-dev && update-ca-certificates

WORKDIR /app

FROM base AS builder
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY api api
COPY auth auth
COPY backend backend
COPY config config
COPY db db
COPY notifications notifications
COPY .sqlx .sqlx
ENV SQLX_OFFLINE=true
RUN cargo build --release --bin backend
RUN chmod +x ./target/release/backend

FROM gcr.io/distroless/cc-debian12 AS runtime
COPY --from=builder /app/target/release/backend /usr/local/bin/backend
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8000
ENTRYPOINT ["backend"]
