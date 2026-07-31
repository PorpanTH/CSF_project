from .test_connection import get_database_connection
from models.portfolio import Portfolio

class Portfolio_Repository:
    
    def get_all_portfolio_items():
        db_conn = get_database_connection()
        cursor = db_conn.cursor()
        query = "select * from portfolio_items"
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        db_conn.close()
        
    


if __name__ == "__main__":
    Portfolio_Repository.get_all_portfolio_items()
