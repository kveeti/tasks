#!/bin/sh
set -eu

envsubst '${PUBLIC_API_URL} ${PUBLIC_VAPID_PUBLIC_KEY}' \
  < /usr/share/nginx/html/index.html \
  > /tmp/tasks-index.html
