# Database Setup Scripts

These standalone scripts let you test and initialize your Railway MySQL database without running the full Flask app.

## Quick Start

### 1. Set up your connection string

Copy `.env.example` to `.env` and paste your Railway MySQL connection string:

```bash
# Copy the example
cp .env.example .env

# Edit .env and replace DATABASE_URL with your Railway connection
# Format: mysql+pymysql://username:password@host:port/database
```

**Important:** Never commit `.env` — it's in `.gitignore` and contains credentials.

### 2. Test the connection

```bash
python database/test_connection.py
```

This runs `SELECT 1` and `SELECT VERSION()` to verify Railway can be reached.

### 3. Create the tables

```bash
python database/init_db.py
```

Creates the `users`, `portfolios`, and `portfolio_items` tables.

### 4. Seed sample data (optional)

```bash
python database/seed.py
```

Inserts one sample user, portfolio, and a few portfolio items so you have real data to work with.

### 5. Run demo queries

```bash
python database/query_demo.py
```

Reads back all users and portfolios with items, prints them formatted, and calculates total portfolio value.

## File Overview

- **config.py** — SQLAlchemy engine and session setup; loads `DATABASE_URL` from `.env`
- **models.py** — SQLAlchemy declarative models: `User`, `Portfolio`, `PortfolioItem`
- **test_connection.py** — Quick connectivity test
- **init_db.py** — Creates tables and prints schema
- **seed.py** — Inserts sample user/portfolio/items
- **query_demo.py** — Reads and displays portfolio data

## Running all at once

```bash
python database/test_connection.py && \
python database/init_db.py && \
python database/seed.py && \
python database/query_demo.py
```

## Schema

Tables created match the frontend's data contracts:

- **users** — email, username, password_hash, created_at, updated_at
- **portfolios** — user_id, name, description, created_at, updated_at
- **portfolio_items** — portfolio_id, item_type (stock/bond/cash), ticker, quantity, purchase_price, purchase_date, current_price, created_at, updated_at

## Troubleshooting

**Connection failed?**
- Double-check `DATABASE_URL` in `.env` — copy/paste it from Railway
- Verify your machine can reach the Railway server (firewall, VPN, etc.)
- Check that `.env` file exists in the project root

**Tables not created?**
- Run `test_connection.py` first to verify connectivity
- Check database user has CREATE TABLE permissions

**No sample data?**
- Run `seed.py` if you want demo data
- The scripts check for existing data and skip if already seeded

## Next Steps

Once these scripts work end-to-end, you're ready to:
1. Wire the actual Flask routes to these models
2. Replace `USE_MOCK_DATA = true` in the frontend's `api.ts` with a real API URL
3. Add authentication (JWT), validation (Marshmallow), and error handling to the Flask app
