ALTER TABLE notification_subs
ADD COLUMN new_endpoint TEXT;

UPDATE notification_subs
SET new_endpoint = endpoint;

ALTER TABLE notification_subs
DROP COLUMN endpoint;

ALTER TABLE notification_subs
RENAME COLUMN new_endpoint TO endpoint;

ALTER TABLE notification_subs
ALTER COLUMN endpoint SET NOT NULL;

ALTER TABLE notification_subs
ADD CONSTRAINT unique_endpoint UNIQUE (endpoint);
