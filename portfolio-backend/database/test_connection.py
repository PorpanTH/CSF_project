"""Test database connection."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import app, db

def test_connection():
    print("Testing database connection...")
    try:
        with app.app_context():
            result = db.session.execute(db.text('SELECT 1'))
            print("SUCCESS: Database connection works!")
            return True
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_connection()

