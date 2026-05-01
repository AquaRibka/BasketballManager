# Local PostgreSQL

The project includes a small Rust utility that downloads PostgreSQL binaries on demand
and runs a local database without requiring a system-wide PostgreSQL installation.

## Prisma Connection String

```env
DATABASE_URL=postgresql://bm_user:bm_dev_password@localhost:5432/basketball_manager?schema=public
DIRECT_URL=postgresql://bm_user:bm_dev_password@localhost:5432/basketball_manager?schema=public
DATABASE_URL_DOCKER=postgresql://bm_user:bm_dev_password@postgres:5432/basketball_manager?schema=public
```

## Quick Start

1. Copy `.env.example` to `.env`.
2. Start the local database:

```bash
cargo run --manifest-path infra/local-postgres/Cargo.toml -- start
```

3. Keep that process running while developing.

## Defaults

- Host: `localhost`
- Port: `5432`
- Database: `basketball_manager`
- User: `bm_user`
- Password: `bm_dev_password`
- Prisma schema: `public`

## Notes

- PostgreSQL binaries are downloaded automatically on first start.
- Database files are stored in `.local/postgres/data/`.
- Use `Ctrl+C` in the running process to stop the local database cleanly.
- `docker-compose.yml` remains available as an alternative for environments with Docker.
- Use `DATABASE_URL_DOCKER` for services running inside the compose network.
