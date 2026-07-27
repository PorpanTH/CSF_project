# Frontend-Backend Integration Guide

A comprehensive guide for connecting the React frontend to the Flask backend API.

## 🔗 Integration Overview

```
┌─────────────────────┐
│   React Frontend    │
│   (Port 3000)       │
└──────────┬──────────┘
           │ (HTTP/JSON)
           │
┌──────────▼──────────┐
│   Flask Backend     │
│   (Port 5000)       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   PostgreSQL/SQLite │
│   Database          │
└─────────────────────┘
```

---

## 📋 Pre-Integration Checklist

### Frontend Ready ✅
- [ ] `npm install` completed
- [ ] Development server runs on port 3000
- [ ] Mock data displays correctly
- [ ] All components render without errors

### Backend Ready ✅
- [ ] Flask app created
- [ ] Database models defined
- [ ] API endpoints implemented
- [ ] CORS enabled
- [ ] Development server runs on port 5000

---

## 🔌 Enabling API Calls

### Step 1: Update API Service

Edit `portfolio-frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
const USE_MOCK_DATA = false  // ← Change this to false
```

### Step 2: Set Environment Variables

Create `portfolio-frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Restart Frontend

```bash
# Stop the dev server (Ctrl+C)
# Restart it
npm run dev
```

---

## ✅ Integration Testing

### Test 1: API Connection

1. Open browser DevTools (F12)
2. Go to Network tab
3. Go to `http://localhost:3000/`
4. Create a new portfolio
5. Check Network tab - you should see:
   - `POST /api/portfolios` request
   - Response with portfolio data

### Test 2: CRUD Operations

**Create**
- [ ] Create new portfolio - success notification
- [ ] Check Network: `POST /api/portfolios`
- [ ] Portfolio appears on dashboard

**Read**
- [ ] Click on portfolio - loads portfolio detail
- [ ] Check Network: `GET /api/portfolios/{id}`
- [ ] Items display correctly

**Update**
- [ ] Add item to portfolio
- [ ] Check Network: `POST /api/portfolios/{id}/items`
- [ ] Item appears in table

**Delete**
- [ ] Delete item from portfolio
- [ ] Check Network: `DELETE /api/portfolios/{id}/items/{item_id}`
- [ ] Item removed from table

### Test 3: Error Handling

**Simulate Backend Down**
1. Stop Flask server
2. Try creating portfolio on frontend
3. Should show error toast: "Failed to create portfolio"
4. No console errors

**Simulate Invalid Data**
1. Try adding item with negative quantity
2. Frontend should show validation error
3. Request should not be sent to backend

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error in Console

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/portfolios' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
Ensure Flask has CORS enabled:

```python
from flask_cors import CORS
from flask import Flask

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
```

### Issue: 404 Not Found

**Error:**
```
GET /api/portfolios 404 (Not Found)
```

**Solution:**
1. Check Flask backend is running: `http://localhost:5000/api/portfolios`
2. Verify route exists in Flask app
3. Check URL matches exactly (case-sensitive)

### Issue: Authentication Required

**Error:**
```
POST /api/portfolios 401 (Unauthorized)
```

**Solution:**
If JWT is required, ensure token is:
1. Stored in localStorage after login
2. Sent in Authorization header: `Authorization: Bearer <token>`

Current API client handles this automatically:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Issue: JSON Format Mismatch

**Frontend expects:**
```typescript
{
  id: string
  name: string
  description: string
  items: PortfolioItem[]
  createdAt: string
  updatedAt: string
}
```

**Check backend response format matches exactly**

---

## 📊 Response Format Specification

### GET /api/portfolios

**Frontend expects:**
```json
[
  {
    "id": "1",
    "name": "Primary Portfolio",
    "description": "Main investment portfolio",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-07-23T10:00:00Z",
    "items": []
  }
]
```

**Backend must return:**
```python
@app.route('/api/portfolios', methods=['GET'])
@jwt_required()
def get_portfolios():
    portfolios = Portfolio.query.filter_by(user_id=get_jwt_identity()).all()
    return jsonify([{
        'id': str(p.id),
        'name': p.name,
        'description': p.description,
        'createdAt': p.created_at.isoformat(),
        'updatedAt': p.updated_at.isoformat(),
        'items': [...]
    }])
```

### POST /api/portfolios

**Frontend sends:**
```json
{
  "name": "New Portfolio",
  "description": "Portfolio description"
}
```

**Backend must return (201 Created):**
```json
{
  "id": "123",
  "name": "New Portfolio",
  "description": "Portfolio description",
  "createdAt": "2024-07-23T10:00:00Z",
  "updatedAt": "2024-07-23T10:00:00Z",
  "items": []
}
```

### POST /api/portfolios/{id}/items

**Frontend sends:**
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

**Backend must return (201 Created):**
```json
{
  "id": "item-123",
  "portfolioId": "123",
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.25,
  "currentPrice": 228.45,
  "purchaseDate": "2023-06-15",
  "createdAt": "2024-07-23T10:00:00Z",
  "updatedAt": "2024-07-23T10:00:00Z"
}
```

### Error Responses

**All errors must follow format:**
```json
{
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

---

## 🔐 Authentication Flow

### Setup JWT

**Frontend:**
```typescript
// After successful login
localStorage.setItem('token', response.data.access_token)

// Token automatically added to all requests via interceptor
```

**Backend:**
```python
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@app.route('/api/auth/login', methods=['POST'])
def login():
    # Validate credentials...
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token})

@app.route('/api/portfolios', methods=['GET'])
@jwt_required()
def get_portfolios():
    user_id = get_jwt_identity()  # Get user ID from token
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    return jsonify([...])
```

---

## 🧪 Integration Test Scenarios

### Scenario 1: User Creates Portfolio

**Step 1:** User clicks "New Portfolio" button
- Frontend: Shows AddPortfolio page
- Network: No API call yet

**Step 2:** User fills form and clicks "Create Portfolio"
- Frontend: Validates form locally
- Network: `POST /api/portfolios` with data

**Step 3:** Backend creates portfolio in database
- Database: New row in `portfolios` table
- Network Response: 201 Created with portfolio data

**Step 4:** Frontend receives response
- Frontend: Shows success toast
- Frontend: Adds portfolio to state
- Frontend: Navigates to dashboard
- Dashboard: Shows new portfolio

### Scenario 2: User Adds Item to Portfolio

**Step 1:** User opens portfolio and clicks "Add Item"
- Frontend: Shows AddItemForm modal
- Network: No API call yet

**Step 2:** User fills form and clicks "Add Item"
- Frontend: Validates form locally
- Network: `POST /api/portfolios/{id}/items` with data

**Step 3:** Backend creates item in database
- Database: New row in `portfolio_items` table
- Network Response: 201 Created with item data

**Step 4:** Frontend receives response
- Frontend: Shows success toast
- Frontend: Adds item to portfolio.items array
- Frontend: Closes modal
- Frontend: Table updates with new item
- Frontend: Charts update automatically

---

## 📈 Performance Optimization

### Reduce API Calls

**Don't:**
```typescript
// Bad - makes separate API call for each portfolio
const portfolios = await portfolioAPI.getAll()
for (const portfolio of portfolios) {
  const details = await portfolioAPI.getById(portfolio.id)
}
```

**Do:**
```typescript
// Good - single API call, includes items
const portfolios = await portfolioAPI.getAll()
// Response already includes items
```

### Cache Responses

Consider caching portfolio data:

```typescript
const [cache, setCache] = useState<Record<string, Portfolio>>({})

const getPortfolio = async (id: string) => {
  if (cache[id]) return cache[id]  // Return cached
  
  const portfolio = await portfolioAPI.getById(id)
  setCache(prev => ({ ...prev, [id]: portfolio }))
  return portfolio
}
```

### Use Pagination for Large Datasets

**Backend:**
```python
@app.route('/api/portfolios', methods=['GET'])
def get_portfolios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    portfolios = Portfolio.query.paginate(page, per_page)
    return jsonify({
        'items': [...],
        'total': portfolios.total,
        'pages': portfolios.pages,
        'current_page': page
    })
```

---

## 🚀 Deployment Integration

### Staging Environment

**Update `.env.staging`:**
```env
VITE_API_URL=https://api-staging.example.com/api
```

**Build for staging:**
```bash
npm run build  # Uses .env.local
npm run build -- --mode staging  # Uses .env.staging (if configured)
```

### Production Environment

**Update `.env.production`:**
```env
VITE_API_URL=https://api.example.com/api
```

**Build for production:**
```bash
npm run build
```

---

## 📝 Integration Checklist

### Backend Setup
- [ ] Flask app created and runs on port 5000
- [ ] Database models defined (User, Portfolio, PortfolioItem)
- [ ] CORS enabled: `CORS(app)`
- [ ] JWT authentication implemented
- [ ] All API endpoints implemented and tested with Postman
- [ ] Error handling in place
- [ ] Response format matches specification above

### Frontend Setup
- [ ] `npm install` completed
- [ ] Dev server runs on port 3000
- [ ] `USE_MOCK_DATA = false` in `api.ts`
- [ ] Environment variables set: `VITE_API_URL=http://localhost:5000/api`
- [ ] All imports and types correct

### Testing
- [ ] Create portfolio: works end-to-end
- [ ] View portfolio list: shows data from backend
- [ ] View portfolio details: loads items from backend
- [ ] Add item: creates in database and updates frontend
- [ ] Delete item: removes from database and frontend
- [ ] Error handling: shows error messages when API fails
- [ ] Network requests show correct endpoints and methods
- [ ] Response times acceptable (< 2 seconds)

### Deployment
- [ ] API URL set correctly for production
- [ ] Frontend and backend deployed to same domain (or CORS configured)
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] Monitoring set up

---

## 🔗 API Endpoints Reference

### Authentication
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login user
POST   /api/auth/logout           - Logout user
POST   /api/auth/refresh          - Refresh token
```

### Portfolios
```
GET    /api/portfolios            - Get all user portfolios
POST   /api/portfolios            - Create new portfolio
GET    /api/portfolios/{id}       - Get portfolio details
PUT    /api/portfolios/{id}       - Update portfolio
DELETE /api/portfolios/{id}       - Delete portfolio
```

### Portfolio Items
```
GET    /api/portfolios/{id}/items        - Get portfolio items
POST   /api/portfolios/{id}/items        - Add item to portfolio
PUT    /api/portfolios/{id}/items/{item_id}  - Update item
DELETE /api/portfolios/{id}/items/{item_id}  - Delete item
```

### Analytics (Optional Phase 2)
```
GET    /api/portfolios/{id}/performance  - Get performance metrics
GET    /api/portfolios/{id}/allocation   - Get asset allocation
GET    /api/portfolios/{id}/history      - Get historical data
```

---

## 💡 Troubleshooting Commands

```bash
# Test if Flask backend is running
curl http://localhost:5000/

# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/portfolios

# Check frontend environment variables
# Add to App.tsx for debugging:
console.log('API URL:', process.env.VITE_API_URL)

# Clear browser cache
# DevTools > Application > Clear site data

# Reset mock data
# Edit mockData.ts and re-save

# Check network timing
# DevTools > Network tab > look at "Time" column
```

---

**Integration complete! 🎉**

Your Portfolio Manager is now ready to connect frontend and backend!
