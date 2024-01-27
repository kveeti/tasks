install watcher:
a

```bash
cargo install cargo-watch
cargo install sqlx-cli
```

psql:

```bash
psql --host localhost --port 5432 --user postgres tasks_dev
```

start backend:

```bash
cargo watch -q -x 'run -p backend'
```
