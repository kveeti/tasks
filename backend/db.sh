function check_envs() {
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL is not set"
        exit 1
    fi
}

function initialize_db() {
    echo "Initializing database..."

    # psql $DATABASE_URL -f ./sql/00-create-user-database-schema.sql #: railway does a db and a user for you
    psql $DATABASE_URL -f ./sql/01-create-tables.sql

    echo "Database initialized!"
}

function purge_db() {
    echo "Purging database..."

    psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

    echo "Database purged!"
}

function generate_rust_code_with_sea_orm_cli() {
    echo "Generating Rust db entities with sea-orm-cli..."

    sea-orm-cli generate entity -o entity/src

    echo "Rust db entities generated!"
}

function main() {
    check_envs

    if [ "$1" == "purge" ]; then
        purge_db 
    else if [ "$1" == "init" ]; then
        initialize_db
    else if [ "$1" == "gen" ]; then
        generate_rust_code_with_sea_orm_cli
    else
        echo "Invalid argument"
        exit 1
    fi
    fi
    fi
}

main $1
