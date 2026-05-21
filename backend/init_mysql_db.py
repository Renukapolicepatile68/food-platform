import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    print("Connecting to MySQL...")
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root")
    )
    cursor = conn.cursor()

    print("Executing schema.sql...")
    with open("schema.sql", "r") as f:
        sql = f.read()

    # Split and execute statements
    for statement in sql.split(";"):
        statement = statement.strip()
        if statement:
            cursor.execute(statement)

    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
