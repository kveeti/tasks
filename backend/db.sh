function check_envs() {
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL is not set"
        exit 1
    fi
}

# return --host <host> --port <port> --user <username> --password=<password> <dbname>
function parse_url() {
    local url=$1
    local proto="$(echo $url | grep :// | sed -e's,^\(.*://\).*,\1,g')"
    local url_no_proto="$(echo ${url/$proto/})"
    local userpass="$(echo $url_no_proto | grep @ | cut -d@ -f1)"
    local pass="$(echo $userpass | grep : | cut -d: -f2)"
    if [ -n "$pass" ]; then
        local user="$(echo $userpass | grep : | cut -d: -f1)"
    else
        local user=$userpass
    fi
    local hostport="$(echo ${url_no_proto/$userpass@/} | cut -d/ -f1)"
    local port="$(echo $hostport | grep : | cut -d: -f2)"
    if [ -n "$port" ]; then
        local host="$(echo $hostport | grep : | cut -d: -f1)"
    else
        local host=$hostport
    fi
    local path="$(echo $url_no_proto | grep / | cut -d/ -f2-)"
    local dbname="$(echo $path | cut -d/ -f2)"

    echo "--host $host --port $port --user $user --password=$pass $dbname"
}

function initialize_db() {
    echo "Initializing database..."

    # psql $DATABASE_URL -f ./sql/00-create-user-database-schema.sql #: railway does a db and a user for you
    # psql $DATABASE_URL -f ./sql/01-create-tables.sql
    mysql $(parse_url $DATABASE_URL) < ./sql/01-create-tables.sql

    echo "Database initialized!"
}

function purge_db() {
    echo "Purging database..."

    # psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    mysql $(parse_url $DATABASE_URL) -e "DROP DATABASE IF EXISTS railway; CREATE DATABASE railway;"

    echo "Database purged!"
}

function generate_rust_code_with_sea_orm_cli() {
    echo "Generating Rust db entities with sea-orm-cli..."

    sea-orm-cli generate entity -o entity_old/src

    echo "Rust db entities generated!"
}

function dump_db() {
    echo "Dumping database..."

    # pg_dump $DATABASE_URL > ./sql/dump.sql
    mysqldump $(parse_url $DATABASE_URL) > ./sql/dump.sql

    echo "Database dumped!"
}

function restore_db() {
    echo "Restoring database..."

    # psql $DATABASE_URL < ./sql/dump.sql
    mysql $(parse_url $DATABASE_URL) < ./sql/dump.sql

    echo "Database restored!"
}

function main() {
    check_envs

    if [ "$1" == "purge" ]; then
        purge_db 
    else if [ "$1" == "init" ]; then
        initialize_db
    else if [ "$1" == "gen" ]; then
        generate_rust_code_with_sea_orm_cli
    else if [ "$1" == "dump" ]; then
        dump_db
    else if [ "$1" == "restore" ]; then
        restore_db
    else
        echo "Invalid argument"
        exit 1
    fi
    fi
    fi
    fi
    fi
}

main $1
