ALTER TABLE tags
ADD COLUMN last_used_at TIMESTAMPTZ;

CREATE INDEX idx_tags_last_used_at ON tags(last_used_at);
