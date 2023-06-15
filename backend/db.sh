function check_envs() {
    if [ -z "$DB_URL" ]; then
        echo "DB_URL is not set"
        exit 1
    fi
}

function initialize_db() {
    echo "Initializing database..."

    psql $DB_URL -f ./sql/00-create-user-database-schema.sql
    psql $DB_URL -f ./sql/01-create-tables.sql

    echo "Database initialized!"
}

function purge_db() {
    echo "Purging database..."

    psql $DB_URL -c "DROP DATABASE IF EXISTS tasks_not_prod;"

    echo "Database purged!"
}

function main() {
    check_envs

    if [ "$1" == "purge" ]; then
        purge_db
    else
        initialize_db
    fi
}

main $1
