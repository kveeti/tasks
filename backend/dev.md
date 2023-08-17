install bins:

```bash
cargo install cargo-watch sea-orm-cli
```

generate db rust entities:

```bash
sea-orm-cli generate entity -o entity/src --database-url postgres://postgres:postgres@localhost:5432/tasks_notprod_db
```

start backend:

```bash
cargo watch -q -x 'run -p backend'
```
