CREATE TABLE "users" (
    "id" VARCHAR(26) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "sessions" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "tags" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "label" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "tasks" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "tag_id" VARCHAR(26) NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    "is_manual" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "stopped_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "notif_subs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "endpoint" VARCHAR(255) NOT NULL UNIQUE,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "notifs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" VARCHAR(26) NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "send_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);
