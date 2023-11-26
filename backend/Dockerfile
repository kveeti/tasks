FROM rust:alpine AS base
RUN apk add --no-cache openssl-dev musl-dev openssl-libs-static
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
ENV OPENSSL_STATIC=1
RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --release --bin backend --target x86_64-unknown-linux-musl

FROM scratch AS runtime
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/backend /usr/local/bin/backend
ENTRYPOINT ["/usr/local/bin/backend"]
EXPOSE 8000