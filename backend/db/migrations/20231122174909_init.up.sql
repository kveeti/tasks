CREATE TABLE "users" (
    "id" VARCHAR(26) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "preferences" BIGINT NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_users_email ON "users"("email")

CREATE TABLE "sessions" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_user_id ON "sessions"("user_id");
 
CREATE TABLE "tags" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "label" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL
);
CREATE INDEX idx_tags_user_id ON "tags"("user_id");
CREATE INDEX idx_tags_label ON "tags"("label");

CREATE TABLE "tasks" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "tag_id" VARCHAR(26) NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
    "is_manual" BOOLEAN NOT NULL,
    "seconds" INTEGER NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_tasks_user_id ON "tasks"("user_id");
CREATE INDEX idx_tasks_start_at ON "tasks"("start_at");
CREATE INDEX idx_tasks_end_at ON "tasks"("end_at");

CREATE TABLE "notification_subs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "endpoint" VARCHAR(255) NOT NULL UNIQUE,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL
);
CREATE INDEX idx_notification_subs_user_id ON "notification_subs"("user_id");

CREATE TABLE "notifications" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" VARCHAR(26) NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "send_at" TIMESTAMPTZ NOT NULL
);
