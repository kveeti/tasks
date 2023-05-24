CREATE USER "tasks_user"
    WITH
        PASSWORD 'tasks_user'
        NOCREATEDB
        NOCREATEROLE
        NOINHERIT;

CREATE DATABASE "tasks_not_prod"
    WITH
        OWNER = "tasks_user"
        ENCODING = 'UTF8';

GRANT ALL PRIVILEGES ON DATABASE "tasks_not_prod" TO "tasks_user";

\connect "tasks_not_prod";

GRANT ALL ON SCHEMA "public" TO "tasks_user";
