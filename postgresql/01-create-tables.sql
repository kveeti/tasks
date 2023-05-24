CREATE TABLE "users" (
    "id" VARCHAR(26) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tags" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id"),
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "og_created_at" TIMESTAMP NOT NULL
);

CREATE TABLE "tasks" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id"),
    "tag_id" VARCHAR(26) NOT NULL REFERENCES "tags"("id"),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stopped_at" TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,
    "og_created_at" TIMESTAMP NOT NULL
);

CREATE TABLE "notif_subs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id"),
    "endpoint" VARCHAR(255) NOT NULL,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notifs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id"),
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "send_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);