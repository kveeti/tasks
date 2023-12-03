install watcher:

```bash
cargo install cargo-watch
cargo install sqlx-cli
```

create database:

```bash
psql --host localhost --port 5432 --user postgres postgres
```

start backend:

```bash
cargo watch -q -x 'run -p backend'
```
