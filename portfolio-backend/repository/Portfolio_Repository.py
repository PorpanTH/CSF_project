from datetime import datetime

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
            for column_name in ('name', 'sector', 'region', 'created_at', 'updated_at'):
                if column_name in existing_columns:
                    select_columns.append(column_name)

            query = f"SELECT {', '.join(select_columns)} FROM portfolio_items"
            cursor = db_conn.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            return [Portfolio_Repository._row_to_portfolio_item(select_columns, row) for row in results]
        finally:
            db_conn.close()

    @staticmethod
    def create_portfolio_item(data):
        db_conn = get_database_connection()
        if db_conn is None:
            return None

        try:
            existing_columns = Portfolio_Repository._get_existing_columns(db_conn)
            columns = ['portfolio_id', 'asset_class', 'item_type', 'ticker', 'quantity', 'purchase_price', 'purchase_date', 'created_at', 'updated_at']
            values = [
                data.get('portfolioId', 1),
                data.get('assetClass'),
                data.get('itemType', 'investment'),
                data.get('ticker'),
                data.get('quantity'),
                data.get('purchasePrice'),
                data.get('purchaseDate'),
                data.get('createdAt') or data.get('created_at') or datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                data.get('updatedAt') or data.get('updated_at') or datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            ]

            for column_name in ('name', 'sector', 'region'):
                if column_name in existing_columns:
                    columns.append(column_name)
                    values.append(data.get(column_name))

            placeholders = ', '.join(['%s'] * len(columns))
            query = f"INSERT INTO portfolio_items ({', '.join(columns)}) VALUES ({placeholders})"
            cursor = db_conn.cursor()
            cursor.execute(query, values)
            db_conn.commit()
            item_id = cursor.lastrowid
            cursor.close()
            return Portfolio_Repository.get_portfolio_item_by_id(item_id)
        except Exception as exc:
            db_conn.rollback()
            print(f"create_portfolio_item failed: {exc}")
            return None
        finally:
            db_conn.close()

    @staticmethod
    def get_portfolio_item_by_id(item_id):
        db_conn = get_database_connection()
        if db_conn is None:
            return None

        try:
            existing_columns = Portfolio_Repository._get_existing_columns(db_conn)
            select_columns = [
                'id', 'portfolio_id', 'asset_class', 'item_type', 'ticker', 'quantity', 'purchase_price', 'purchase_date'
            ]
            for column_name in ('name', 'sector', 'region', 'created_at', 'updated_at'):
                if column_name in existing_columns:
                    select_columns.append(column_name)

            query = f"SELECT {', '.join(select_columns)} FROM portfolio_items WHERE id = %s"
            cursor = db_conn.cursor()
            cursor.execute(query, (item_id,))
            row = cursor.fetchone()
            cursor.close()
            return Portfolio_Repository._row_to_portfolio_item(select_columns, row) if row else None
        finally:
            db_conn.close()

    @staticmethod
    def _row_to_portfolio_item(columns, row):
        if not row:
            return None

        data = dict(zip(columns, row))
        item = PortfolioItem()
        item.id = data.get('id')
        item.portfolio_id = data.get('portfolio_id')
        item.asset_class = data.get('asset_class')
        item.item_type = data.get('item_type')
        item.ticker = data.get('ticker')
        item.quantity = data.get('quantity')
        item.purchase_price = data.get('purchase_price')
        item.purchase_date = data.get('purchase_date')
        item.name = data.get('name') or ''
        item.sector = data.get('sector') or ''
        item.region = data.get('region') or ''
        item.created_at = data.get('created_at')
        item.updated_at = data.get('updated_at')
        return item

    @staticmethod
    def update_portfolio_item(item_id, data):
        db_conn = get_database_connection()
        if db_conn is None:
            return None

        try:
            existing_columns = Portfolio_Repository._get_existing_columns(db_conn)
            updates = []
            values = []
            field_map = {
                'portfolioId': 'portfolio_id',
                'assetClass': 'asset_class',
                'itemType': 'item_type',
                'ticker': 'ticker',
                'quantity': 'quantity',
                'purchasePrice': 'purchase_price',
                'purchaseDate': 'purchase_date',
            }

            for source_key, target_key in field_map.items():
                if source_key in data:
                    updates.append(f"{target_key} = %s")
                    values.append(data[source_key])

            for column_name in ('name', 'sector', 'region'):
                if column_name in existing_columns and column_name in data:
                    updates.append(f"{column_name} = %s")
                    values.append(data[column_name])

            if not updates:
                return Portfolio_Repository.get_portfolio_item_by_id(item_id)

            values.append(item_id)
            query = f"UPDATE portfolio_items SET {', '.join(updates)} WHERE id = %s"
            cursor = db_conn.cursor()
            cursor.execute(query, tuple(values))
            db_conn.commit()
            cursor.close()
            return Portfolio_Repository.get_portfolio_item_by_id(item_id)
        except Exception:
            db_conn.rollback()
            return None
        finally:
            db_conn.close()

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
