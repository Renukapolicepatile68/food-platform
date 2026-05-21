import sqlite3

def init_db():
    conn = sqlite3.connect('quickbite.db')
    cursor = conn.cursor()

    # Create table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        rating REAL NOT NULL DEFAULT 0.0,
        delivery_time TEXT NOT NULL,
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Check if we need to seed
    cursor.execute('SELECT COUNT(*) FROM restaurants')
    count = cursor.fetchone()[0]

    if count == 0:
        seed_data = [
            ('Burger Joint', 'American', 4.8, '20-30 min', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'),
            ('Sushi Master', 'Japanese', 4.9, '30-45 min', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=800'),
            ('Pasta Paradise', 'Italian', 4.6, '25-40 min', 'https://images.unsplash.com/photo-1621996311210-2a132bc20756?auto=format&fit=crop&q=80&w=800'),
            ('Spice Garden', 'Indian', 4.7, '35-50 min', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800'),
            ('Green Bowl', 'Healthy', 4.5, '15-25 min', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'),
            ('Taco Fiesta', 'Mexican', 4.8, '20-35 min', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800')
        ]
        
        cursor.executemany('''
            INSERT INTO restaurants (name, cuisine, rating, delivery_time, image_url)
            VALUES (?, ?, ?, ?, ?)
        ''', seed_data)
        
        print(f"Database seeded with {len(seed_data)} restaurants.")
    else:
        print("Database already contains data, skipping seed.")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialization complete.")
