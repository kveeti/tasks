FROM rust:alpine AS base
RUN apk add --no-cache openssl-dev musl-dev openssl-libs-static sccache
RUN cargo install cargo-chef
WORKDIR /app

FROM base AS planner
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM base AS builder
RUN apk add ca-certificates && update-ca-certificates
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE=true
ENV OPENSSL_STATIC=1
ENV RUSTC_WRAPPER=sccache
RUN rustup target add aarch64-unknown-linux-musl
RUN --mount=type=cache,target=/root/.cache/sccache \
  cargo build --release --bin backend --target x86_64-unknown-linux-musl

FROM scratch AS runtime
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/backend /usr/local/bin/backend
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/backend"]
