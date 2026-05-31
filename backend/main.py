from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import get_connection
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="QuickBite API", version="1.0.0")

# Security configuration
security_scheme = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required for JWT signing")
JWT_ALGORITHM = "HS256"

# Allow React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Password Hashing & JWT Helpers ──────────────────────────────────────────

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_jwt(user_id: int, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── Pydantic models ─────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: str  # "customer" or "restaurant"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    role: str
    email: str
    full_name: str

class Restaurant(BaseModel):
    id: int
    name: str
    cuisine: str
    rating: float
    delivery_time: str
    image_url: Optional[str] = None
    is_active: bool = True

class MenuItem(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_active: bool = True

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_active: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int
    price: float

class OrderRequest(BaseModel):
    items: List[OrderItemRequest]
    total_amount: float

class OrderStatusUpdate(BaseModel):
    status: str


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"message": "QuickBite API is running 🚀"}


@app.post("/api/auth/register", response_model=TokenResponse, tags=["Authentication"])
def register(user: UserRegister):
    """Register a new user (customer or restaurant)."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # Hash password
        pw_hash = hash_password(user.password)
        
        # Insert user
        cursor.execute(
            "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
            (user.full_name, user.email, pw_hash, user.role)
        )
        user_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        
        # Generate token
        token = create_jwt(user_id, user.email, user.role)
        return {
            "token": token,
            "role": user.role,
            "email": user.email,
            "full_name": user.full_name
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login(user: UserLogin):
    """Authenticate user and return a JWT token."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fetch user
        cursor.execute("SELECT id, full_name, email, password_hash, role FROM users WHERE email = %s", (user.email,))
        db_user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not db_user or not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(status_code=400, detail="Invalid email or password")
            
        token = create_jwt(db_user['id'], db_user['email'], db_user['role'])
        return {
            "token": token,
            "role": db_user['role'],
            "email": db_user['email'],
            "full_name": db_user['full_name']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/restaurants", response_model=List[Restaurant], tags=["Restaurants"])
def get_restaurants():
    """Return a list of all active restaurants from the database."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, cuisine, rating, delivery_time, image_url, is_active "
            "FROM restaurants WHERE is_active = TRUE ORDER BY rating DESC"
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/restaurants/{restaurant_id}", response_model=Restaurant, tags=["Restaurants"])
def get_restaurant(restaurant_id: int):
    """Return a single restaurant by ID."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, cuisine, rating, delivery_time, image_url, is_active "
            "FROM restaurants WHERE id = %s",
            (restaurant_id,),
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/restaurants/{restaurant_id}/menu", response_model=List[MenuItem], tags=["Restaurants"])
def get_restaurant_menu(restaurant_id: int):
    """Return a list of menu items for a specific restaurant."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, restaurant_id, name, description, category, price, image_url, is_active "
            "FROM menu_items WHERE restaurant_id = %s AND is_active = TRUE",
            (restaurant_id,),
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders", tags=["Orders"])
def create_order(order: OrderRequest, current_user: dict = Depends(get_current_user)):
    """Create a new order and its associated items."""
    if current_user['role'] != 'customer':
        raise HTTPException(status_code=403, detail="Only customers can place orders")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Insert into orders with user_id
        cursor.execute(
            "INSERT INTO orders (user_id, total_amount) VALUES (%s, %s)",
            (current_user['user_id'], order.total_amount)
        )
        order_id = cursor.lastrowid
        
        # Insert into order_items
        order_items_data = [
            (order_id, item.menu_item_id, item.quantity, item.price)
            for item in order.items
        ]
        cursor.executemany(
            "INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (%s, %s, %s, %s)",
            order_items_data
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Order created successfully", "order_id": order_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/restaurants/{restaurant_id}/menu", response_model=MenuItem, tags=["Restaurant Management"])
def add_menu_item(restaurant_id: int, item: MenuItemCreate, current_user: dict = Depends(get_current_user)):
    """Add a new menu item to a restaurant."""
    if current_user['role'] != 'restaurant':
        raise HTTPException(status_code=403, detail="Only restaurants can add menu items")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_active) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (restaurant_id, item.name, item.description, item.category, item.price, item.image_url, item.is_active)
        )
        item_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "id": item_id,
            "restaurant_id": restaurant_id,
            "name": item.name,
            "description": item.description,
            "category": item.category,
            "price": item.price,
            "image_url": item.image_url,
            "is_active": item.is_active
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/restaurants/{restaurant_id}/menu/{item_id}", response_model=dict, tags=["Restaurant Management"])
def update_menu_item(restaurant_id: int, item_id: int, item: MenuItemUpdate, current_user: dict = Depends(get_current_user)):
    """Update an existing menu item."""
    if current_user['role'] != 'restaurant':
        raise HTTPException(status_code=403, detail="Only restaurants can update menu items")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        update_fields = []
        params = []
        if item.name != None:
            update_fields.append("name = %s")
            params.append(item.name)
        if item.description != None:
            update_fields.append("description = %s")
            params.append(item.description)
        if item.category != None:
            update_fields.append("category = %s")
            params.append(item.category)
        if item.price != None:
            update_fields.append("price = %s")
            params.append(item.price)
        if item.image_url != None:
            update_fields.append("image_url = %s")
            params.append(item.image_url)
        if item.is_active != None:
            update_fields.append("is_active = %s")
            params.append(item.is_active)
            
        if not update_fields:
            return {"message": "No fields to update"}
            
        params.extend([item_id, restaurant_id])
        query = f"UPDATE menu_items SET {', '.join(update_fields)} WHERE id = %s AND restaurant_id = %s"
        
        cursor.execute(query, tuple(params))
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Item not found or belongs to another restaurant")
            
        cursor.close()
        conn.close()
        
        return {"message": "Item updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/restaurants/{restaurant_id}/menu/{item_id}", tags=["Restaurant Management"])
def delete_menu_item(restaurant_id: int, item_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a menu item."""
    if current_user['role'] != 'restaurant':
        raise HTTPException(status_code=403, detail="Only restaurants can delete menu items")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM menu_items WHERE id = %s AND restaurant_id = %s", (item_id, restaurant_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Item not found")
            
        cursor.close()
        conn.close()
        return {"message": "Item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/restaurant/orders", tags=["Restaurant Management"])
def get_restaurant_orders(restaurant_id: int = 1, current_user: dict = Depends(get_current_user)):
    """Retrieve all orders containing items from a specific restaurant, with their itemized details."""
    if current_user['role'] != 'restaurant':
        raise HTTPException(status_code=403, detail="Only restaurants can fetch dashboard orders")
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query to fetch orders and their item details
        query = """
            SELECT 
                o.id AS order_id, 
                o.total_amount, 
                o.status, 
                o.created_at,
                oi.id AS order_item_id,
                oi.quantity,
                oi.price_at_time,
                mi.id AS menu_item_id,
                mi.name AS item_name,
                mi.image_url AS item_image_url
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE mi.restaurant_id = %s
            ORDER BY o.created_at DESC
        """
        cursor.execute(query, (restaurant_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Group rows by order_id
        orders_dict = {}
        for row in rows:
            order_id = row['order_id']
            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    "id": order_id,
                    "total_amount": float(row['total_amount']),
                    "status": row['status'],
                    "created_at": row['created_at'].isoformat() if hasattr(row['created_at'], 'isoformat') else str(row['created_at']),
                    "items": []
                }
            
            orders_dict[order_id]["items"].append({
                "id": row['order_item_id'],
                "menu_item_id": row['menu_item_id'],
                "name": row['item_name'],
                "quantity": row['quantity'],
                "price": float(row['price_at_time']),
                "image_url": row['item_image_url']
            })
            
        return list(orders_dict.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/orders/{order_id}/status", tags=["Orders"])
def update_order_status(order_id: int, status_update: OrderStatusUpdate, current_user: dict = Depends(get_current_user)):
    """Update status of a specific order (e.g. accept/reject)."""
    if current_user['role'] != 'restaurant':
        raise HTTPException(status_code=403, detail="Only restaurants can update order status")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE orders SET status = %s WHERE id = %s",
            (status_update.status, order_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Order not found")
            
        cursor.close()
        conn.close()
        return {"message": "Order status updated successfully", "order_id": order_id, "status": status_update.status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders/{order_id}", tags=["Orders"])
def get_order(order_id: int, current_user: dict = Depends(get_current_user)):
    """Retrieve details for a specific order, including its items and status."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query order details and joined items, including user_id
        query = """
            SELECT 
                o.id AS order_id, 
                o.user_id,
                o.total_amount, 
                o.status, 
                o.created_at,
                oi.id AS order_item_id,
                oi.quantity,
                oi.price_at_time,
                mi.name AS item_name,
                mi.image_url AS item_image_url
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.id = %s
        """
        cursor.execute(query, (order_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not rows:
            raise HTTPException(status_code=404, detail="Order not found")
            
        # Structure the response
        first_row = rows[0]
        if first_row['order_id'] is None:
            raise HTTPException(status_code=404, detail="Order not found")
            
        # Check ownership: must be the customer who placed it or a restaurant user
        if current_user['role'] == 'customer' and first_row['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied to this order")
            
        order_details = {
            "id": first_row['order_id'],
            "total_amount": float(first_row['total_amount']),
            "status": first_row['status'],
            "created_at": first_row['created_at'].isoformat() if hasattr(first_row['created_at'], 'isoformat') else str(first_row['created_at']),
            "items": []
        }
        
        for row in rows:
            if row['order_item_id'] is not None:
                order_details["items"].append({
                    "id": row['order_item_id'],
                    "name": row['item_name'],
                    "quantity": row['quantity'],
                    "price": float(row['price_at_time']),
                    "image_url": row['item_image_url']
                })
                
        return order_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

