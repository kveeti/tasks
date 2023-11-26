CREATE TABLE "users" (
    "id" VARCHAR(26) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "preferences" BIGINT NOT NULL,
    "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "sessions" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);
 
CREATE TABLE "tags" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "label" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    CONSTRAINT "unique_label_per_user" UNIQUE ("user_id", "label")
);

CREATE TABLE "tasks" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "tag_label" VARCHAR(255) NOT NULL,
    "is_manual" BOOLEAN NOT NULL,
    "seconds" INTEGER,
    "start_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY ("user_id", "tag_label") REFERENCES "tags"("user_id", "label") ON DELETE CASCADE
);

CREATE TABLE "notification_subs" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "endpoint" VARCHAR(255) NOT NULL UNIQUE,
    "p256dh" VARCHAR(255) NOT NULL,
    "auth" VARCHAR(255) NOT NULL
);

CREATE TABLE "notifications" (
    "id" VARCHAR(26) PRIMARY KEY,
    "user_id" VARCHAR(26) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" VARCHAR(26) NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "send_at" TIMESTAMP WITH TIME ZONE NOT NULL
);
