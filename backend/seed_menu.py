import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def seed_menu():
    print("Connecting to MySQL...")
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "quickbite")
    )
    cursor = conn.cursor()

    print("Creating menu_items table...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS menu_items (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        name          VARCHAR(100) NOT NULL,
        description   TEXT,
        price         DECIMAL(10, 2) NOT NULL,
        image_url     TEXT,
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
    )
    """)

    # Check if we need to seed
    cursor.execute("SELECT COUNT(*) FROM menu_items")
    count = cursor.fetchone()[0]

    if count == 0:
        print("Seeding menu items...")
        seed_data = [
            (1, 'Classic Cheeseburger', 'Juicy beef patty with melted cheddar, lettuce, tomato, and our secret sauce.', 8.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'),
            (1, 'Double Bacon Burger', 'Two beef patties, crispy bacon, american cheese, and BBQ sauce.', 12.99, 'https://images.unsplash.com/photo-1594212202875-86ac519fece5?auto=format&fit=crop&q=80&w=800'),
            (1, 'Crispy Fries', 'Golden and crispy french fries tossed in sea salt.', 3.99, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=800'),
            (2, 'Spicy Tuna Roll', 'Fresh tuna mixed with spicy mayo and cucumber.', 10.99, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800'),
            (2, 'Dragon Roll', 'Eel and cucumber inside, topped with avocado and unagi sauce.', 14.99, 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800'),
            (3, 'Spaghetti Carbonara', 'Classic Italian pasta with pancetta, egg yolk, and pecorino cheese.', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800'),
            (4, 'Chicken Tikka Masala', 'Roasted marinated chicken chunks in spiced curry sauce.', 15.99, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800'),
            (5, 'Quinoa Avocado Salad', 'Fresh greens, quinoa, sliced avocado, cherry tomatoes with lemon vinaigrette.', 11.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'),
            (6, 'Beef Tacos', 'Three soft shell tacos filled with seasoned ground beef, cheese, and pico de gallo.', 9.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800')
        ]
        
        cursor.executemany("""
            INSERT INTO menu_items (restaurant_id, name, description, price, image_url)
            VALUES (%s, %s, %s, %s, %s)
        """, seed_data)
        print(f"Database seeded with {len(seed_data)} menu items.")
    else:
        print("Menu items already exist. Skipping seed.")

    conn.commit()
    cursor.close()
    conn.close()
    print("Menu setup complete.")

if __name__ == '__main__':
    seed_menu()
