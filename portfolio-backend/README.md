# Portfolio Manager - Flask Backend

A production-ready Flask REST API for the Portfolio Manager application. Handles user authentication, portfolio management, and asset tracking.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or conda
- Virtual environment manager (recommended)

### Installation

1. **Create and activate virtual environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

4. **Run the application**

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
portfolio-backend/
├── app.py                  # Flask application factory
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (local)
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── README.md              # This file
│
├── models/                # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py           # User model
│   └── portfolio.py       # Portfolio & PortfolioItem models
│
└── routes/                # Flask blueprints (API endpoints)
    ├── __init__.py
    ├── auth.py           # Authentication endpoints
    └── portfolios.py     # Portfolio management endpoints
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. **Register a new user**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-07-23T10:00:00",
    "updatedAt": "2024-07-23T10:00:00"
  }
}
```

2. **Login**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-07-23T10:00:00",
    "updatedAt": "2024-07-23T10:00:00"
  }
}
```

3. **Use token in requests**

Add the token to the `Authorization` header:

```bash
Authorization: Bearer <your_access_token>
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (requires auth)

### Portfolios

- `GET /api/portfolios` - Get all portfolios (requires auth)
- `POST /api/portfolios` - Create new portfolio (requires auth)
- `GET /api/portfolios/{id}` - Get portfolio details (requires auth)
- `PUT /api/portfolios/{id}` - Update portfolio (requires auth)
- `DELETE /api/portfolios/{id}` - Delete portfolio (requires auth)

### Portfolio Items

- `POST /api/portfolios/{id}/items` - Add item to portfolio (requires auth)
- `PUT /api/portfolios/{id}/items/{item_id}` - Update item (requires auth)
- `DELETE /api/portfolios/{id}/items/{item_id}` - Delete item (requires auth)

### Health Check

- `GET /api/health` - Check API status (no auth required)

## 📊 Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00"
}
```

### Portfolio

```json
{
  "id": "1",
  "name": "My Portfolio",
  "description": "Personal investment portfolio",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00",
  "items": [...]
}
```

### Portfolio Item

```json
{
  "id": "1",
  "portfolioId": "1",
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.25,
  "currentPrice": 228.45,
  "purchaseDate": "2023-06-15",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00"
}
```

## 🧪 Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Portfolios

```bash
curl -X GET http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Portfolio

```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Portfolio",
    "description": "My investment portfolio"
  }'
```

### Add Item to Portfolio

```bash
curl -X POST http://localhost:5000/api/portfolios/1/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "stock",
    "ticker": "AAPL",
    "quantity": 50,
    "purchasePrice": 150.25,
    "currentPrice": 228.45,
    "purchaseDate": "2023-06-15"
  }'
```

## 🗄️ Database

### Default: SQLite

The backend uses SQLite by default for development. Database file: `portfolio.db`

### PostgreSQL (Production)

For production, configure PostgreSQL:

1. **Install PostgreSQL driver**

```bash
pip install psycopg2-binary
```

2. **Update `.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db
```

## 🚀 Deployment

### Heroku

1. **Create Procfile**

```bash
echo "web: gunicorn app:app" > Procfile
```

2. **Deploy**

```bash
git push heroku main
```

### Railway

```bash
railway up
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

Build and run:

```bash
docker build -t portfolio-backend .
docker run -p 5000:5000 -e DATABASE_URL=... portfolio-backend
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| FLASK_ENV | development | Flask environment |
| FLASK_DEBUG | True | Enable debug mode |
| DATABASE_URL | sqlite:///portfolio.db | Database connection string |
| JWT_SECRET_KEY | your-super-secret-jwt-key-change-in-production | JWT secret key |
| CORS_ORIGINS | http://localhost:3000,http://localhost:5000 | Allowed CORS origins |
| FLASK_PORT | 5000 | Port to run Flask on |

## ⚠️ Security

Before deploying to production:

1. **Change JWT_SECRET_KEY** in `.env`
2. **Enable HTTPS** on your domain
3. **Set FLASK_DEBUG=False**
4. **Use a strong database password**
5. **Use PostgreSQL instead of SQLite**
6. **Set up CORS properly** for your frontend domain
7. **Enable rate limiting** (optional)
8. **Use environment variables** for sensitive data

## 🤝 Integration with Frontend

See `INTEGRATION_GUIDE.md` in the project root for complete frontend integration instructions.

### Quick Setup

1. **Start backend**

```bash
python app.py
```

2. **Frontend configuration**

In `portfolio-frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5000/api'
const USE_MOCK_DATA = false
```

3. **Start frontend**

```bash
cd portfolio-frontend
npm run dev
```

## 📞 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Issues

```bash
# Delete database and recreate
rm portfolio.db
python -c "from app import create_app; app = create_app()"
```

### Virtual Environment Issues

```bash
# Deactivate current environment
deactivate

# Remove and recreate
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [SQLAlchemy](https://sqlalchemy.org/)

## 📋 Backend Setup Checklist

- [x] Flask application structure created
- [x] Database models defined (User, Portfolio, PortfolioItem)
- [x] Authentication endpoints implemented (register, login, me)
- [x] Portfolio CRUD endpoints implemented
- [x] Portfolio item CRUD endpoints implemented
- [x] CORS enabled for frontend integration
- [x] JWT authentication implemented
- [x] Error handling implemented
- [x] Environment variables configured
- [ ] Database persistence (handled by another team)
- [ ] Testing suite (optional)
- [ ] Logging and monitoring (optional)
- [ ] Rate limiting (optional)

## 🎯 Next Steps

1. **Database Setup** - Configure PostgreSQL for production
2. **Frontend Integration** - Connect React frontend to API
3. **Testing** - Write unit and integration tests
4. **Deployment** - Deploy to Heroku, Railway, or AWS
5. **Monitoring** - Set up error tracking (Sentry)
6. **Enhancement** - Add real stock price API integration

---

**Backend ready for integration!** 🚀
