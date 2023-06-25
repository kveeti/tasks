CREATE TABLE users (
    id VARCHAR(26) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE tags (
    id VARCHAR(26) NOT NULL,
    user_id VARCHAR(26) NOT NULL,
    label VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id VARCHAR(26) NOT NULL,
    user_id VARCHAR(26) NOT NULL,
    tag_id VARCHAR(26) NOT NULL,
    is_manual BOOL NOT NULL,
    started_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    stopped_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE notif_subs (
    id VARCHAR(26) NOT NULL,
    user_id VARCHAR(26) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE (endpoint)
);

CREATE TABLE notifs (
    id VARCHAR(26) NOT NULL,
    user_id VARCHAR(26) NOT NULL,
    task_id VARCHAR(26) NOT NULL, -- can't use foreign key because task might not have been synced yet when notification is created
    title VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    send_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);