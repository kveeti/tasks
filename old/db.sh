#!/bin/bash

docker rm -f tasks_db

docker run --name tasks_db -p 3306:3306  -e MYSQL_ROOT_PASSWORD=root -d mysql:latest

echo "Waiting for database to get ready..."

until docker exec tasks_db mysql --user=root --password=root -e "status" &> /dev/null; do
  sleep 1
done

echo "Database ready!"

echo "Migrating database..."
pnpm prisma db push