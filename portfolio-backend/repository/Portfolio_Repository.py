from .test_connection import get_database_connection
from models.portfolio import PortfolioItem


class Portfolio_Repository:

    @staticmethod
    def _get_existing_columns(db_conn):
        cursor = db_conn.cursor()
        try:
            cursor.execute("SHOW COLUMNS FROM portfolio_items")
            return {row[0] for row in cursor.fetchall()}
        finally:
            cursor.close()

    @staticmethod
    def migrate_portfolio_items_schema():
        db_conn = get_database_connection()
        if db_conn is None:
            return False

        cursor = db_conn.cursor()
        try:
            existing_columns = {row[0] for row in cursor.execute("SHOW COLUMNS FROM portfolio_items") or []}
            for column_name in ('current_price', 'realized_pnl', 'price_history'):
                if column_name in existing_columns:
                    cursor.execute(f"ALTER TABLE portfolio_items DROP COLUMN {column_name}")
            db_conn.commit()
            return True
        except Exception:
            db_conn.rollback()
            return False
        finally:
            cursor.close()
            db_conn.close()

    @staticmethod
    def get_all_portfolio_items():
        db_conn = get_database_connection()
        if db_conn is None:
            return []

        try:
            existing_columns = Portfolio_Repository._get_existing_columns(db_conn)
            select_columns = [
                'id', 'portfolio_id', 'asset_class', 'item_type', 'ticker', 'quantity', 'purchase_price', 'purchase_date'
            ]
            for column_name in ('sector', 'region', 'created_at', 'updated_at'):
                if column_name in existing_columns:
                    select_columns.append(column_name)

            query = f"SELECT {', '.join(select_columns)} FROM portfolio_items"
            cursor = db_conn.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            return [PortfolioItem(*row) for row in results]
        finally:
            db_conn.close()
        
    


if __name__ == "__main__":
    Portfolio_Repository.get_all_portfolio_items()
