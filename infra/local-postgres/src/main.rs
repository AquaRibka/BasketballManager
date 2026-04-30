use pg_embed::pg_enums::PgAuthMethod;
use pg_embed::pg_errors::Result;
use pg_embed::pg_fetch::{PgFetchSettings, PG_V17};
use pg_embed::postgres::{PgEmbed, PgSettings};
use std::path::PathBuf;
use std::time::Duration;

const DB_NAME: &str = "basketball_manager";
const DB_USER: &str = "bm_user";
const DB_PASSWORD: &str = "bm_dev_password";
const DB_PORT: u16 = 5432;

#[tokio::main]
async fn main() -> Result<()> {
    let command = std::env::args().nth(1).unwrap_or_else(|| "start".to_string());

    match command.as_str() {
        "start" => start().await,
        "print-url" => {
            println!("{}", database_url());
            Ok(())
        }
        other => {
            eprintln!("Unknown command: {other}");
            eprintln!("Available commands: start, print-url");
            std::process::exit(2);
        }
    }
}

async fn start() -> Result<()> {
    let base_dir = project_root().join(".local/postgres");
    let database_dir = base_dir.join("data");

    let pg_settings = PgSettings {
        database_dir,
        port: DB_PORT,
        user: DB_USER.to_string(),
        password: DB_PASSWORD.to_string(),
        auth_method: PgAuthMethod::Plain,
        persistent: true,
        timeout: Some(Duration::from_secs(30)),
        migration_dir: None,
    };

    let fetch_settings = PgFetchSettings {
        version: PG_V17,
        ..Default::default()
    };

    let mut pg = PgEmbed::new(pg_settings, fetch_settings).await?;
    pg.setup().await?;
    pg.start_db().await?;

    if !pg.database_exists(DB_NAME).await? {
        pg.create_database(DB_NAME).await?;
    }

    println!("Local PostgreSQL is running.");
    println!("Database: {DB_NAME}");
    println!("User: {DB_USER}");
    println!("Port: {DB_PORT}");
    println!("DATABASE_URL={}", database_url());
    println!("Press Ctrl+C to stop.");

    tokio::signal::ctrl_c()
        .await
        .expect("failed to listen for Ctrl+C");

    pg.stop_db().await?;
    Ok(())
}

fn database_url() -> String {
    format!(
        "postgresql://{DB_USER}:{DB_PASSWORD}@localhost:{DB_PORT}/{DB_NAME}?schema=public"
    )
}

fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(|path| path.parent())
        .expect("project root should exist")
        .to_path_buf()
}
