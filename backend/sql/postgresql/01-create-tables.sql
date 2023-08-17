CREATE TABLE "users" (
    "id" VARCHAR(26) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "tags" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "label" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "was_last_used" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMP,
    "synced_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tasks" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "tag_id" VARCHAR(26) NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    "is_manual" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "stopped_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    "synced_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notif_subs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "endpoint" VARCHAR(255) NOT NULL UNIQUE,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL 
);

CREATE TABLE "notifs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" VARCHAR(26) NOT NULL, -- can't use foreign key because task might not have been synced yet when notification is created
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "send_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL
);