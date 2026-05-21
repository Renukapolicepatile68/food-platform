# MySQL Database Schema for QuickBite Food Platform
# Run this script once to set up your database

CREATE DATABASE IF NOT EXISTS quickbite;
USE quickbite;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS restaurants (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    cuisine     VARCHAR(50) NOT NULL,
    rating      DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    delivery_time VARCHAR(30) NOT NULL,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data (6 mock restaurants)
INSERT INTO restaurants (name, cuisine, rating, delivery_time, image_url) VALUES
('Burger Joint',    'American', 4.8, '20-30 min', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'),
('Sushi Master',   'Japanese', 4.9, '30-45 min', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=800'),
('Pasta Paradise', 'Italian',  4.6, '25-40 min', 'https://images.unsplash.com/photo-1621996311210-2a132bc20756?auto=format&fit=crop&q=80&w=800'),
('Spice Garden',   'Indian',   4.7, '35-50 min', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800'),
('Green Bowl',     'Healthy',  4.5, '15-25 min', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'),
('Taco Fiesta',    'Mexican',  4.8, '20-35 min', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800');

CREATE TABLE IF NOT EXISTS menu_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    category      VARCHAR(50),
    price         DECIMAL(10, 2) NOT NULL,
    image_url     TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Seed data for menu items
INSERT INTO menu_items (restaurant_id, name, description, price, image_url) VALUES
(1, 'Classic Cheeseburger', 'Juicy beef patty with melted cheddar, lettuce, tomato, and our secret sauce.', 8.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800'),
(1, 'Double Bacon Burger', 'Two beef patties, crispy bacon, american cheese, and BBQ sauce.', 12.99, 'https://images.unsplash.com/photo-1594212202875-86ac519fece5?auto=format&fit=crop&q=80&w=800'),
(1, 'Crispy Fries', 'Golden and crispy french fries tossed in sea salt.', 3.99, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=800'),
(2, 'Spicy Tuna Roll', 'Fresh tuna mixed with spicy mayo and cucumber.', 10.99, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800'),
(2, 'Dragon Roll', 'Eel and cucumber inside, topped with avocado and unagi sauce.', 14.99, 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800'),
(3, 'Spaghetti Carbonara', 'Classic Italian pasta with pancetta, egg yolk, and pecorino cheese.', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800'),
(4, 'Chicken Tikka Masala', 'Roasted marinated chicken chunks in spiced curry sauce.', 15.99, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800'),
(5, 'Quinoa Avocado Salad', 'Fresh greens, quinoa, sliced avocado, cherry tomatoes with lemon vinaigrette.', 11.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'),
(6, 'Beef Tacos', 'Three soft shell tacos filled with seasoned ground beef, cheese, and pico de gallo.', 9.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800');

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status       VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity     INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

