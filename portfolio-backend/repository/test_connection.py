import mysql.connector as mysql
import os
from dotenv import load_dotenv

load_dotenv()

def get_database_connection():
    try:
        connection = mysql.connect(
            host = os.getenv("DB_HOST"),
            port = os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_DATABASE")
            )
        
        return connection
    except mysql.Error as err:
        print(f"Error is {err}")
        return None
    
if __name__ == "__main__":
    print(os.getenv("DB_HOST"))
    db = get_database_connection()
    if db:
        print("Database connected successfully")
        print(db)
        db.close()
    else:
        print("Failed to connect")

# cursor = connection.cursor()
# cursor.execute("select * from portfolios;")
# column_names = [desc[0] for desc in cursor.description]
# rows = cursor.fetchall()
# for row in rows:
#     print(row)