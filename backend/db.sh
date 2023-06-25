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

    echo "--host $host --port $port --user $user --password=$pass $dbname --protocol=TCP"
}

function db_type() {
    local url=$1
    local proto="$(echo $url | grep :// | sed -e's,^\(.*://\).*,\1,g')"

    if [ $proto == "mysql://" ]; then
        echo "mysql"
    else if [ $proto == "postgresql://" ]; then
        echo "postgres"
    else
        echo "Invalid db type"
        exit 1
    fi
    fi
}

function get_db_from_url() {
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

    echo "$dbname"
}

function initialize_db() {
    echo "Initializing database..."

    if [ $1 == "mysql" ]; then
        mysql $(parse_url $DATABASE_URL) < ./sql/mysql/01-create-tables.sql
    else if [ $1 == "postgres" ]; then
        psql $DATABASE_URL -f ./sql/postgresql/01-create-tables.sql
    else
        echo "Invalid db type"
        exit 1
    fi
    fi

    # psql $DATABASE_URL -f ./sql/00-create-user-database-schema.sql #: railway does a db and a user for you
    # mysql $(parse_url $DATABASE_URL) < ./sql/01-create-tables.sql

    echo "Database initialized!"
}

function purge_db() {
    echo "Purging database..."

    local db=$(get_db_from_url $DATABASE_URL)

    if [ $1 == "mysql" ]; then
        mysql $(parse_url $DATABASE_URL) -e "DROP DATABASE IF EXISTS $db; CREATE DATABASE $db;"
    else if [ $1 == "postgres" ]; then
        psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    else
        echo "Invalid db type"
        exit 1
    fi
    fi

    # psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    # mysql $(parse_url $DATABASE_URL) -e "DROP DATABASE IF EXISTS railway; CREATE DATABASE railway;"

    echo "Database purged!"
}

function generate_rust_code_with_sea_orm_cli() {
    echo "Generating Rust db entities with sea-orm-cli..."

    sea-orm-cli generate entity -o entity/src

    echo "Rust db entities generated!"
}

function dump_db() {
    echo "Dumping database..."

    if [ $1 == "mysql" ]; then
        mysqldump $(parse_url $DATABASE_URL) > ./sql/dump.sql
    else if [ $1 == "postgres" ]; then
        pg_dump $DATABASE_URL > ./sql/dump.sql
    else
        echo "Invalid db type"
        exit 1
    fi
    fi

    # pg_dump $DATABASE_URL > ./sql/dump.sql
    # mysqldump $(parse_url $DATABASE_URL) > ./sql/dump.sql

    echo "Database dumped!"
}

function restore_db() {
    echo "Restoring database..."

    if [ $1 == "mysql" ]; then
        mysql $(parse_url $DATABASE_URL) < ./sql/dump.sql
    else if [ $1 == "postgres" ]; then
        psql $DATABASE_URL < ./sql/dump.sql
    else
        echo "Invalid db type"
        exit 1
    fi
    fi

    # psql $DATABASE_URL < ./sql/dump.sql
    # mysql $(parse_url $DATABASE_URL) < ./sql/dump.sql

    echo "Database restored!"
}

function main() {
    check_envs

    parse_url $DATABASE_URL
    local db_type=$(db_type $DATABASE_URL)

    if [ "$1" == "purge" ]; then
        purge_db $db_type
    else if [ "$1" == "init" ]; then
        initialize_db $db_type
    else if [ "$1" == "gen" ]; then
        generate_rust_code_with_sea_orm_cli
    else if [ "$1" == "dump" ]; then
        dump_db $db_type
    else if [ "$1" == "restore" ]; then
        restore_db $db_type
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
