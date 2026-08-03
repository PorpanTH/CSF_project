import mysql.connector as mysql
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()


def _read_connection_config():
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    database = os.getenv('DB_DATABASE')

    if host and user and database:
        return {
            'host': host,
            'port': int(port) if port else 3306,
            'user': user,
            'password': password,
            'database': database,
        }

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        return None

    parsed = urlparse(database_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 3306,
        'user': parsed.username,
        'password': parsed.password,
        'database': parsed.path.lstrip('/'),
    }

def get_database_connection():
    try:
        config = _read_connection_config()
        if config is None:
            raise ValueError('Database configuration is missing')

        connection = mysql.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database']
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