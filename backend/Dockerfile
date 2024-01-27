FROM rust:alpine AS base
RUN apk add --no-cache openssl-dev musl-dev openssl-libs-static
RUN cargo install cargo-chef
WORKDIR /app

FROM base AS planner
COPY .cargo .cargo
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY api api
COPY auth auth
COPY backend backend
COPY config config
COPY db db
COPY notifications notifications
RUN cargo chef prepare --recipe-path recipe.json

FROM base AS builder
RUN apk add ca-certificates && update-ca-certificates
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY api api
COPY auth auth
COPY backend backend
COPY config config
COPY db db
COPY notifications notifications
COPY .sqlx .sqlx
COPY .cargo .cargo
ENV SQLX_OFFLINE=true
ENV OPENSSL_STATIC=1
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --bin backend --target x86_64-unknown-linux-musl
RUN chmod +x ./target/x86_64-unknown-linux-musl/release/backend

FROM scratch AS runtime
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/backend /usr/local/bin/backend
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8000
ENTRYPOINT ["backend"]
