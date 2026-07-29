# Portfolio Manager - Quick Start Guide

Get the entire project running in 5 minutes.

## Prerequisites
- Python 3.8+
- Node.js 18+
- Two terminal windows

## Setup (First Time Only)

### Terminal 1: Backend Setup
```bash
cd portfolio-backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Terminal 2: Frontend Setup
```bash
cd portfolio-frontend

# Install dependencies
npm install
```

---

## Running the Application

### Terminal 1: Start Backend
```bash
cd portfolio-backend
venv\Scripts\activate
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Terminal 2: Start Frontend
```bash
cd portfolio-frontend
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

---

## Access Application

Open browser: **http://localhost:5173**

---

## First Run Checklist

- [x] Backend running on http://localhost:5000
- [x] Frontend running on http://localhost:5173
- [x] `USE_MOCK_DATA = false` in `portfolio-frontend/src/services/api.ts`
- [x] No CORS errors in browser console (F12)
- [x] Health check: http://localhost:5000/api/health returns `{"status":"ok"}`

---

## Common Commands

### Reset Everything
```bash
# Stop both services (Ctrl+C)

# Reset backend database
cd portfolio-backend
rm portfolio.db
python app.py

# Reset frontend
cd portfolio-frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Find Running Services
```bash
# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### Kill Process on Port
```bash
# Windows
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

---

## Test Features

1. **Create Portfolio**
   - Click "New Portfolio"
   - Fill form and submit
   - Portfolio appears in list

2. **Add Items**
   - Click portfolio to view details
   - Click "Add Item"
   - Fill in stock details
   - Verify P&L calculations

3. **View Dashboard**
   - Go to Dashboard
   - See aggregated metrics
   - View charts and allocation

4. **Delete Data**
   - Delete items from portfolio
   - Delete entire portfolios

---

## Documentation

- **Full Setup Guide**: [TESTING_AND_SETUP_GUIDE.md](TESTING_AND_SETUP_GUIDE.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Backend API**: [portfolio-backend/README.md](portfolio-backend/README.md)

---

**Ready to go!** 🚀
