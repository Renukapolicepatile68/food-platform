import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    """Create and return a MySQL database connection."""
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "quickbite"),
        )
        return conn
    except Error as e:
        raise Exception(f"Could not connect to MySQL: {e}")
