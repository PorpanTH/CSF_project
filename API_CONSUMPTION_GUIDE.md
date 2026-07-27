# API Consumption Guide

Complete guide for consuming the Portfolio Manager API from the frontend and external services.

## 🎯 Overview

The Portfolio Manager API provides RESTful endpoints for:
- User authentication (registration, login)
- Portfolio management (CRUD operations)
- Portfolio item management (CRUD operations)

---

## 📡 Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-domain.com/api
```

---

## 🔐 Authentication

### 1. User Registration

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response (201 Created):**
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

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

---

### 2. User Login

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
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

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Missing Authorization Header"
}
```

---

## 📊 Portfolios API

### 1. Get All Portfolios

**Endpoint:** `GET /portfolios`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
[
  {
    "id": "1",
    "name": "Primary Portfolio",
    "description": "My main investment portfolio",
    "createdAt": "2024-07-23T10:00:00",
    "updatedAt": "2024-07-23T10:00:00",
    "items": [
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
    ]
  }
]
```

---

### 2. Create Portfolio

**Endpoint:** `POST /portfolios`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Portfolio",
  "description": "Description of my portfolio"
}
```

**Response (201 Created):**
```json
{
  "id": "1",
  "name": "New Portfolio",
  "description": "Description of my portfolio",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00",
  "items": []
}
```

---

### 3. Get Portfolio by ID

**Endpoint:** `GET /portfolios/{portfolio_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
{
  "id": "1",
  "name": "Primary Portfolio",
  "description": "My main investment portfolio",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00",
  "items": [...]
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Portfolio not found"
}
```

---

### 4. Update Portfolio

**Endpoint:** `PUT /portfolios/{portfolio_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Portfolio Name",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "name": "Updated Portfolio Name",
  "description": "Updated description",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T11:00:00",
  "items": [...]
}
```

---

### 5. Delete Portfolio

**Endpoint:** `DELETE /portfolios/{portfolio_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
{
  "message": "Portfolio deleted successfully"
}
```

---

## 🎯 Portfolio Items API

### 1. Add Item to Portfolio

**Endpoint:** `POST /portfolios/{portfolio_id}/items`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.25,
  "currentPrice": 228.45,
  "purchaseDate": "2023-06-15"
}
```

**Item Types:**
- `"stock"` - Stock holdings
- `"bond"` - Bond holdings
- `"cash"` - Cash equivalents

**Response (201 Created):**
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

---

### 2. Update Portfolio Item

**Endpoint:** `PUT /portfolios/{portfolio_id}/items/{item_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 75,
  "currentPrice": 250.00
}
```

**Response (200 OK):**
```json
{
  "id": "1",
  "portfolioId": "1",
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 75,
  "purchasePrice": 150.25,
  "currentPrice": 250.00,
  "purchaseDate": "2023-06-15",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T11:00:00"
}
```

---

### 3. Delete Portfolio Item

**Endpoint:** `DELETE /portfolios/{portfolio_id}/items/{item_id}`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
{
  "message": "Item deleted successfully"
}
```

---

## 🏥 Health Check

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Portfolio API is running"
}
```

---

## 🔄 Frontend Integration Examples

### React Hook Example

```typescript
// hooks/usePortfolioAPI.ts
import { useState } from 'react'

const API_BASE = 'http://localhost:5000/api'

export function usePortfolioAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('token')

  const makeRequest = async (
    method: string,
    endpoint: string,
    data?: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const token = getToken()
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        }
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${API_BASE}${endpoint}`, options)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    // Portfolios
    getPortfolios: () => makeRequest('GET', '/portfolios'),
    createPortfolio: (data) => makeRequest('POST', '/portfolios', data),
    getPortfolio: (id) => makeRequest('GET', `/portfolios/${id}`),
    updatePortfolio: (id, data) => makeRequest('PUT', `/portfolios/${id}`, data),
    deletePortfolio: (id) => makeRequest('DELETE', `/portfolios/${id}`),
    // Items
    addItem: (portfolioId, data) =>
      makeRequest('POST', `/portfolios/${portfolioId}/items`, data),
    updateItem: (portfolioId, itemId, data) =>
      makeRequest('PUT', `/portfolios/${portfolioId}/items/${itemId}`, data),
    deleteItem: (portfolioId, itemId) =>
      makeRequest('DELETE', `/portfolios/${portfolioId}/items/${itemId}`),
    // Auth
    register: (data) => makeRequest('POST', '/auth/register', data),
    login: (data) => makeRequest('POST', '/auth/login', data),
    getCurrentUser: () => makeRequest('GET', '/auth/me'),
  }
}
```

### Usage in Component

```typescript
function Dashboard() {
  const { getPortfolios, error, loading } = usePortfolioAPI()
  const [portfolios, setPortfolios] = useState([])

  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const data = await getPortfolios()
        setPortfolios(data)
      } catch (err) {
        console.error('Failed to load portfolios')
      }
    }
    loadPortfolios()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {portfolios.map((portfolio) => (
        <div key={portfolio.id}>{portfolio.name}</div>
      ))}
    </div>
  )
}
```

---

## 🧪 API Testing Tools

### cURL

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Get portfolios
curl -X GET http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer $TOKEN"
```

### Postman

1. Create new request
2. Set method to GET
3. Enter URL: `http://localhost:5000/api/portfolios`
4. Go to Headers tab
5. Add header: `Authorization: Bearer YOUR_TOKEN`
6. Click Send

### VS Code REST Client

Create `requests.http`:

```http
### Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Get Portfolios
@token = YOUR_TOKEN_HERE
GET http://localhost:5000/api/portfolios
Authorization: Bearer @token
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Portfolio fetched successfully |
| 201 | Created | Portfolio created successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid token or credentials |
| 404 | Not Found | Portfolio doesn't exist |
| 500 | Server Error | Unexpected server error |

### Error Response Format

All errors return JSON with error message:

```json
{
  "error": "Portfolio not found"
}
```

### Frontend Error Handling

```typescript
try {
  const portfolio = await api.getPortfolio(id)
} catch (error) {
  if (error.message.includes('not found')) {
    // Show 404 error
  } else if (error.message.includes('Unauthorized')) {
    // Redirect to login
  } else {
    // Show generic error
  }
}
```

---

## 🔒 Security Considerations

### Token Management

1. **Store token securely**
   ```typescript
   // Good: localStorage (for single-page apps)
   localStorage.setItem('token', accessToken)
   
   // Better: httpOnly cookies (requires backend support)
   ```

2. **Include in all requests**
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. **Handle expiration**
   ```typescript
   if (response.status === 401) {
     // Token expired, redirect to login
     window.location.href = '/login'
   }
   ```

### API Security

- All endpoints except `/auth/register`, `/auth/login`, and `/health` require authentication
- CORS is enabled for all origins in development (restrict in production)
- Use HTTPS in production
- Validate all input on backend
- Never expose sensitive data in responses

---

## 🚀 Deployment Integration

### Environment-specific Endpoints

```typescript
// Development
const API_URL = 'http://localhost:5000/api'

// Production
const API_URL = 'https://api.yourdomain.com/api'

// Use environment variable
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api'
```

### Request Interceptors

```typescript
// Add base URL automatically
axios.defaults.baseURL = API_URL

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)
```

---

## 📈 Performance Tips

1. **Cache responses** - Cache portfolio list when possible
2. **Minimize requests** - Fetch all data in one request
3. **Pagination** - Use pagination for large datasets (future)
4. **Compression** - Enable gzip compression on backend
5. **CDN** - Host API on CDN for faster response times

---

## 🔗 Database Integration

While the API is database-agnostic, the database layer handles:

- **Data persistence** - All changes are saved to database
- **Relationships** - Portfolio → Items relationships maintained
- **Integrity** - Cascade deletes prevent orphaned data
- **Transactions** - Database ensures data consistency

Database configuration is managed by the database team.

---

## 📚 Related Documentation

- **Backend Guide**: `BACKEND_IMPLEMENTATION_GUIDE.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Frontend Setup**: `FRONTEND_SETUP_GUIDE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`

---

**API ready for consumption!** 🎉
