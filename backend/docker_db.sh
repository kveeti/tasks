#!/bin/zsh

DB_CONTAINER_NAME="tasks-dev-db"

function check_if_container_exists() {
    if docker ps -a | grep -q $DB_CONTAINER_NAME; then
        return 0
    else
        return 1
    fi
}

function start_db_container() {
    echo "Starting database container..."

    docker run -d --name $DB_CONTAINER_NAME -v ./DB_DATA:/var/lib/postgresql/data -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
    
    echo "Database container started!"
}

function wait_for_db() {
    echo "Waiting for database to get ready..."
    
    until docker exec $DB_CONTAINER_NAME pg_isready &> /dev/null; do
        sleep 1
    done

    echo "Database ready!"
}

function initialize_db() {
    echo "Initializing database..."
    
    PGPASSWORD=postgres psql -h localhost -U postgres -f ./sql/00-create-user-database-schema.sql
    PGPASSWORD=tasks_user psql -h localhost -U tasks_user -d tasks_not_prod -f ./sql/01-create-tables.sql

    echo "Database initialized!"
}

function purge_db() {
    echo "Purging database..."
    
    docker kill $DB_CONTAINER_NAME
    docker rm $DB_CONTAINER_NAME
    rm -rf ./DB_DATA

    echo "Database purged!"
}

function main() {
    if [[ $1 == "start" ]]; then
        if check_if_container_exists; then
            echo "Database container already exists!"
        else
            start_db_container
        fi
    
        wait_for_db
        initialize_db
    elif [[ $1 == "purge" ]]; then
        purge_db
        start_db_container
        wait_for_db
        initialize_db
    else
        echo "Invalid argument!"
    fi
}

main $1