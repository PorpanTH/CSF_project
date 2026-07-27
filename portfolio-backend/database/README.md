# Database Setup & Test Scripts

Standalone Python scripts to test connectivity, initialize schema, seed sample data, and verify read/write against Railway MySQL or any SQLAlchemy-supported database.

These scripts run inside the Flask app context using `portfolio-backend`'s actual `create_app()`, `db` object, and models (User, Portfolio, PortfolioItem from `models/`), ensuring they exercise the real codebase.

## Quick Start

### 1. Set up your connection string

Rename/copy `.env.example` to `.env` (root level, in `portfolio-backend/`):

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`:
- **Railway MySQL:** paste your Railway connection string (format: `mysql://...`; the app normalizes it to `mysql+pymysql://`)
- **Local SQLite:** use `sqlite:///portfolio.db` or similar
- **PostgreSQL:** use `postgresql://...` (install `psycopg2-binary` separately if using Postgres)

**Important:** `.env` is in `.gitignore` and contains credentials — never commit it.

### 2. Install dependencies

From the `portfolio-backend/` directory:

```bash
pip install -r requirements.txt
```

Ensure `PyMySQL==1.1.0` and `cryptography==41.0.7` are included for Railway MySQL.

### 3. Test the connection

```bash
cd portfolio-backend
python database/test_connection.py
```

Runs `SELECT 1` and `SELECT VERSION()` to verify database reachability. If using SQLite, this confirms the file can be created; if Railway MySQL, confirms network access.

### 4. Create tables

```bash
python database/init_db.py
```

Calls `db.create_all()` inside the Flask app context to create `users`, `portfolios`, and `portfolio_items` tables. Safe to re-run — skips existing tables.

### 5. Seed sample data (optional)

```bash
python database/seed.py
```

Inserts one default user (id=1, "Portfolio Manager") with a sample portfolio containing 4 items (AAPL stock, GOOGL stock, BOND, USD cash). Checks for existing data and skips if already seeded.

### 6. Run demo queries

```bash
python database/query_demo.py
```

Reads all portfolios and items, prints them with calculated metrics (total value, cost, unrealized P&L), and verifies the schema round-trips correctly.

### Run all at once

```bash
python database/test_connection.py && \
python database/init_db.py && \
python database/seed.py && \
python database/query_demo.py
```

## File Overview

- **config.py** — Imports `create_app()`, `db`, and models; exposes them for other scripts to use inside `app.app_context()`.
- **test_connection.py** — Lightweight connectivity test; doesn't depend on models.
- **init_db.py** — Creates schema (mirrors what `create_app()` already does on startup; useful as standalone step).
- **seed.py** — Inserts sample User (id=1), Portfolio, and PortfolioItem rows matching the real schema (includes `asset_class`, `realized_pnl`).
- **query_demo.py** — Reads back all data, uses `to_dict()` and `calculate_metrics()` to display it, verifies schema round-trips.

## Schema

Uses the live models from `portfolio-backend/models/`:

- **users** — id (PK), name, created_at, updated_at
- **portfolios** — id (PK), user_id (FK), name, description, created_at, updated_at
- **portfolio_items** — id (PK), portfolio_id (FK), asset_class, item_type, ticker, quantity, purchase_price, purchase_date (string), current_price, realized_pnl, created_at, updated_at

## Troubleshooting

**Connection failed?**
- Check `.env` exists in `portfolio-backend/` with `DATABASE_URL` set.
- For Railway: verify the connection string was copy/pasted correctly (watch for trailing spaces).
- For local SQLite: the file will be created automatically; no setup needed.
- Network firewall or VPN may block Railway — check your connection.

**Import errors (ModuleNotFoundError)?**
- Run scripts from within the `portfolio-backend/` directory: `cd portfolio-backend && python database/test_connection.py`
- Ensure `pip install -r requirements.txt` was run.

**Tables not created?**
- Check database user has CREATE TABLE permissions (usually automatic for local SQLite or Railway).
- Run `test_connection.py` first to confirm connectivity.

**No sample data after running seed.py?**
- The script checks if user id=1 already exists and skips if found. Delete that user if you want to re-seed.
- Check query_demo.py output to see what's actually in the database.

## Testing with Flask app

Once scripts pass, start the Flask dev server to verify end-to-end:

```bash
python app.py
```

Visit `/api/health` (returns `{'status': 'ok'}`) and `/api/portfolios` (returns portfolios for the hardcoded default user, id=1) to confirm the live app uses the same database and schema.
