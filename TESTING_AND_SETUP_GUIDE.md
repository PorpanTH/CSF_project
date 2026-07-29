# Portfolio Manager - Complete Testing & Setup Guide

A comprehensive guide to set up and test the Portfolio Manager application (Flask backend + React frontend).

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [API Integration](#api-integration)
6. [Manual Testing](#manual-testing)
7. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Portfolio Manager** is a full-stack application for managing investment portfolios.

### Architecture
- **Backend**: Flask REST API (Python)
- **Frontend**: React with TypeScript (Node.js)
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT-based (optional)
- **Port Configuration**: Backend on 5000, Frontend on 3000

### Key Features
✅ Create and manage multiple portfolios  
✅ Track portfolio items (stocks, bonds, ETFs, etc.)  
✅ Calculate P&L metrics (realized, unrealized)  
✅ Visual dashboards with charts  
✅ CORS-enabled for frontend integration  

---

## Prerequisites

### System Requirements
- **Windows Server 2025** or later (or macOS/Linux equivalents)
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **npm or yarn** (for frontend package management)
- **Git** (for version control)
- **Terminal/PowerShell** (for running commands)

### Install Python
```bash
# Windows: Download from https://www.python.org/downloads/
# Verify installation
python --version  # Should be 3.8+

# macOS/Linux
python3 --version
```

### Install Node.js
```bash
# Download from https://nodejs.org/ (LTS recommended)
# Verify installation
node --version   # Should be 18+
npm --version    # Should be 9+
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd c:\Course\CSF_project\portfolio-backend
# or on macOS/Linux:
cd ~/Course/CSF_project/portfolio-backend
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Verify activation:**
```bash
# You should see (venv) prefix in terminal
which python  # Should point to venv
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

**Expected packages:**
- Flask==3.0.0
- Flask-CORS==4.0.0
- Flask-SQLAlchemy==3.0.5
- python-dotenv==1.0.0
- python-dateutil==2.8.2
- psycopg2-binary>=2.9.0
- gunicorn==21.2.0

### Step 4: Verify Configuration
Check `.env` file:
```bash
cat .env  # Windows: type .env
```

Expected content:
```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///portfolio.db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
FLASK_PORT=5000
```

### Step 5: Start Backend Server
```bash
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**Verify backend is running:**
```bash
# In another terminal/PowerShell
curl http://localhost:5000/api/health
# Response: {"status":"ok","message":"Portfolio API is running"}
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd c:\Course\CSF_project\portfolio-frontend
# or:
cd ~/Course/CSF_project/portfolio-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

**Expected packages:**
- react@^18.2.0
- react-dom@^18.2.0
- react-router-dom@^6.18.0
- axios@^1.6.2
- recharts@^2.10.3
- tailwindcss@^3.3.6
- vite@^5.0.8

### Step 3: Configure API URL
Edit `src/services/api.ts`:

**Find this section:**
```typescript
const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
const API_BASE_URL = viteEnv?.VITE_API_URL || 'http://localhost:5000/api'
const USE_MOCK_DATA = true  // ← Change this to false
```

**Change to:**
```typescript
const USE_MOCK_DATA = false  // Now using real backend API
```

### Step 4: Start Frontend Server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 5: Open in Browser
Navigate to: **http://localhost:5173** or **http://localhost:3000** (depending on Vite config)

---

## API Integration

### Backend Endpoints

#### Health Check (No Auth Required)
```bash
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Portfolio API is running"
}
```

#### Portfolio Endpoints (Full CRUD)

**1. Get All Portfolios**
```bash
GET /api/portfolios
```

**2. Create Portfolio**
```bash
POST /api/portfolios
Content-Type: application/json

{
  "name": "My First Portfolio",
  "description": "Personal investment portfolio"
}
```

**Response:**
```json
{
  "id": "1",
  "name": "My First Portfolio",
  "description": "Personal investment portfolio",
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00",
  "items": [],
  "metrics": { ... }
}
```

**3. Get Portfolio by ID**
```bash
GET /api/portfolios/1
```

**4. Update Portfolio**
```bash
PUT /api/portfolios/1
Content-Type: application/json

{
  "name": "Updated Portfolio Name",
  "description": "Updated description"
}
```

**5. Delete Portfolio**
```bash
DELETE /api/portfolios/1
```

#### Portfolio Item Endpoints

**1. Add Item to Portfolio**
```bash
POST /api/portfolios/1/items
Content-Type: application/json

{
  "assetClass": "Technology",
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.25,
  "currentPrice": 228.45,
  "purchaseDate": "2023-06-15",
  "sector": "Technology",
  "region": "North America",
  "priceHistory": [150.25, 155.00, 160.50, ...],
  "realizedPnL": 0
}
```

**Response:**
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
  "sector": "Technology",
  "region": "North America",
  "priceHistory": [...],
  "unrealizedPnL": 3910,
  "unrealizedPnLPercent": 52.04,
  "realizedPnL": 0,
  "createdAt": "2024-07-23T10:00:00",
  "updatedAt": "2024-07-23T10:00:00"
}
```

**2. Update Item**
```bash
PUT /api/portfolios/1/items/1
Content-Type: application/json

{
  "currentPrice": 235.50,
  "priceHistory": [150.25, 155.00, 160.50, ..., 235.50]
}
```

**3. Delete Item**
```bash
DELETE /api/portfolios/1/items/1
```

---

## Manual Testing

### Test Scenario 1: Create and View Portfolio

#### Steps:
1. **Open frontend**: http://localhost:5173
2. **Click "New Portfolio"** button
3. **Fill form:**
   - Name: "Tech Stocks"
   - Description: "My technology stocks"
4. **Click "Create Portfolio"**
5. **Verify:**
   - Portfolio appears in list
   - Success toast notification shows
   - Portfolio details page loads

#### Backend Verification:
```bash
# Check database
curl http://localhost:5000/api/portfolios

# Should see your new portfolio in response
```

---

### Test Scenario 2: Add Items to Portfolio

#### Steps:
1. **Click on portfolio** to view details
2. **Click "Add Item"** button
3. **Fill form:**
   - Item Type: "Stock"
   - Ticker: "AAPL"
   - Quantity: 50
   - Purchase Price: 150.25
   - Current Price: 228.45
   - Purchase Date: 2023-06-15
   - Sector: "Technology"
   - Region: "North America"
4. **Click "Add Item"**
5. **Verify:**
   - Item appears in portfolio
   - P&L calculations show
   - Metrics update

#### Expected Calculations:
- **Cost**: 50 × 150.25 = $7,512.50
- **Current Value**: 50 × 228.45 = $11,422.50
- **Unrealized P&L**: $11,422.50 - $7,512.50 = **$3,910**
- **Return %**: $3,910 / $7,512.50 × 100 = **52.04%**

---

### Test Scenario 3: Update Portfolio Item

#### Steps:
1. **Navigate to portfolio detail**
2. **Find the item you created**
3. **Click edit button** on the item row
4. **Change Current Price**: 250.00
5. **Save changes**
6. **Verify:**
   - New price is reflected
   - P&L recalculates
   - Updated timestamp changes

#### Backend Check:
```bash
curl http://localhost:5000/api/portfolios/1/items/1
```

---

### Test Scenario 4: Delete Operations

#### Delete Item:
1. **Navigate to portfolio detail**
2. **Click delete** on item row
3. **Confirm deletion**
4. **Verify item is removed**

#### Delete Portfolio:
1. **Go to portfolio list**
2. **Click "..." menu** on portfolio
3. **Select "Delete Portfolio"**
4. **Confirm deletion**
5. **Verify portfolio is removed**

---

### Test Scenario 5: Multiple Portfolios & Aggregated Metrics

#### Steps:
1. **Create 2-3 different portfolios:**
   - "Stocks Portfolio"
   - "Bonds Portfolio"
   - "Diversified Portfolio"
2. **Add different items to each**
3. **View Dashboard**
4. **Verify:**
   - Dashboard shows aggregated totals
   - Charts display all items
   - Allocation breakdown shows all asset types

#### Check Dashboard Metrics:
- Total Portfolio Value = Sum of (quantity × currentPrice) across all items
- Total Invested = Sum of (quantity × purchasePrice) across all items
- Total Gain/Loss = Total Value - Total Invested

---

### Test Scenario 6: Data Persistence

#### Steps:
1. **Create portfolio** with items
2. **Stop frontend** (Ctrl+C)
3. **Refresh browser** - verify page shows loading
4. **Restart frontend** - `npm run dev`
5. **Navigate to portfolio**
6. **Verify all data persists**

#### Database Check:
```bash
# Check SQLite database file exists
dir portfolio-backend\portfolio.db

# Query database (using sqlite3 if installed)
sqlite3 portfolio.db
> SELECT * FROM portfolios;
> SELECT * FROM portfolio_items;
> .quit
```

---

## Testing with cURL (Command Line)

### Create Test Portfolio
```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Portfolio\",
    \"description\": \"Testing via cURL\"
  }"
```

### Add Test Item
```bash
curl -X POST http://localhost:5000/api/portfolios/1/items \
  -H "Content-Type: application/json" \
  -d "{
    \"assetClass\": \"Technology\",
    \"itemType\": \"stock\",
    \"ticker\": \"MSFT\",
    \"quantity\": 25,
    \"purchasePrice\": 300,
    \"currentPrice\": 417.89,
    \"purchaseDate\": \"2023-01-15\",
    \"sector\": \"Technology\",
    \"region\": \"North America\",
    \"priceHistory\": [300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 417.89],
    \"realizedPnL\": 0
  }"
```

### Get All Portfolios
```bash
curl http://localhost:5000/api/portfolios
```

### Get Portfolio Details
```bash
curl http://localhost:5000/api/portfolios/1
```

### Update Item Price
```bash
curl -X PUT http://localhost:5000/api/portfolios/1/items/1 \
  -H "Content-Type: application/json" \
  -d "{
    \"currentPrice\": 425.00,
    \"priceHistory\": [300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 425.00]
  }"
```

### Delete Item
```bash
curl -X DELETE http://localhost:5000/api/portfolios/1/items/1
```

### Delete Portfolio
```bash
curl -X DELETE http://localhost:5000/api/portfolios/1
```

---

## Troubleshooting

### Backend Issues

#### Port 5000 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### Database Error: "portfolio.db locked"
```bash
# Delete and recreate database
cd portfolio-backend
rm portfolio.db  # Windows: del portfolio.db
python app.py
```

#### ModuleNotFoundError: Flask
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Then reinstall requirements
pip install -r requirements.txt
```

#### CORS Error in Browser Console
```
Access-Control-Allow-Origin header is missing
```

**Solution**: Verify `.env` CORS configuration:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

### Frontend Issues

#### Port 3000/5173 Already in Use
```bash
# Kill Node.js process using the port
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

#### "Cannot GET /" Error
- Ensure you're running `npm run dev` from `portfolio-frontend` directory
- Check that Vite dev server started successfully
- Try accessing http://localhost:5173 (not 3000 by default)

#### API Not Responding / 503 Errors
- Verify backend is running on port 5000
- Check `USE_MOCK_DATA` is set to `false` in `src/services/api.ts`
- Open http://localhost:5000/api/health in browser
- Check console logs for CORS errors

#### Module not found errors
```bash
# Delete node_modules and reinstall
rm -r node_modules package-lock.json  # or on Windows: rmdir /s node_modules
npm install
npm run dev
```

---

### Database Issues

#### Reset Database to Fresh State
```bash
# For SQLite
cd portfolio-backend
rm portfolio.db  # Windows: del portfolio.db

# Restart backend (creates fresh database)
python app.py
```

#### Switch to PostgreSQL (Production)
```bash
# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Restart backend
python app.py
```

---

## Verification Checklist

### Backend ✅
- [ ] Virtual environment created and activated
- [ ] All pip packages installed from requirements.txt
- [ ] `.env` file configured with correct values
- [ ] Backend starts without errors on `python app.py`
- [ ] Health check returns 200: `curl http://localhost:5000/api/health`
- [ ] Database file created: `portfolio.db` exists

### Frontend ✅
- [ ] Node.js 18+ installed
- [ ] npm dependencies installed: `npm install` succeeds
- [ ] `USE_MOCK_DATA = false` in `src/services/api.ts`
- [ ] Frontend starts: `npm run dev` runs without errors
- [ ] Application loads in browser without CORS errors

### Integration ✅
- [ ] Backend and frontend both running simultaneously
- [ ] Create portfolio via frontend works
- [ ] Portfolio appears in database
- [ ] Add item to portfolio works
- [ ] All CRUD operations (Create, Read, Update, Delete) function
- [ ] Data persists after browser refresh
- [ ] Charts and metrics display correctly

---

## Quick Start Commands (All-in-One)

### Terminal 1 - Backend
```bash
cd portfolio-backend
python -m venv venv
venv\Scripts\activate  # Windows: use venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Terminal 2 - Frontend
```bash
cd portfolio-frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Support & Debugging

### Enable Verbose Logging
Backend `app.py`:
```python
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)  # Already enabled
```

### Browser Console Errors
Open Developer Tools (F12) → Console tab → Check for:
- CORS errors
- 404 responses
- Network request failures

### Check Network Requests
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Perform an action (create portfolio, add item)
4. Look for failed requests (status 4xx, 5xx)
5. Click request to see request/response details

---

## Performance Tuning

### For Development
- Keep `FLASK_DEBUG=True` for auto-reload
- Use SQLite (sufficient for testing)
- No need for async operations

### For Production
- Set `FLASK_DEBUG=False`
- Use PostgreSQL
- Set `JWT_SECRET_KEY` to strong random string
- Add rate limiting
- Use gunicorn:
  ```bash
  gunicorn -w 4 -b 0.0.0.0:5000 app:app
  ```

---

**Last Updated**: 2024-07-29  
**Project**: Portfolio Manager v1.0  
**Status**: Ready for Testing ✅
