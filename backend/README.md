# QuickBite Backend API

## Setup Instructions

### 1. Set up MySQL

Install MySQL if not already installed. Then run the schema:

```bash
mysql -u root -p < schema.sql
```

Or paste the contents of `schema.sql` directly into your MySQL client.

---

### 2. Configure Environment Variables

Edit `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=quickbite
```

---

### 3. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

### 4. Start the FastAPI Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at:
- Swagger UI: http://localhost:8000/docs
- GET Restaurants: http://localhost:8000/api/restaurants

---

### 5. Start the React Frontend

In a separate terminal:

```bash
npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/restaurants` | List all active restaurants |
| GET | `/api/restaurants/{id}` | Get restaurant by ID |
