# Developer Guide - Portfolio Manager Backend

## 🎯 Quick Navigation

### 📖 For Frontend Developers
1. **API_CONSUMPTION_GUIDE.md** - All endpoints with examples
2. **INTEGRATION_GUIDE.md** - Connect frontend to backend
3. **PROJECT_SUMMARY.md** - Project overview

### 📊 For Database Developers  
1. **portfolio-backend/README.md** - Database models and setup
2. **PROJECT_SUMMARY.md** - Project architecture
3. **INTEGRATION_GUIDE.md** - How backend uses database

### 🏗️ For DevOps/Infrastructure
1. **portfolio-backend/README.md** - Deployment options
2. **INTEGRATION_GUIDE.md** - Environment setup

---

## 🚀 Quick Start

### Backend Setup (5 minutes)
```bash
cd portfolio-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://localhost:5000/api`

### Test API
```bash
curl http://localhost:5000/api/health
```

---

## 📋 Essential Information

### API Endpoints (13 Total)
- **No authentication required**
- **Single user system** (user ID = 1)
- All responses include metrics (PnL, asset breakdown, etc.)

### Key Metrics
- `realizedPnL` - Locked-in gains/losses
- `unrealizedPnL` - Current open position gains/losses
- `assetBreakdown` - By asset class (stock, ETF, bond, etc.)

### Required Fields for Items
```json
{
  "assetClass": "stock",      // Required: type of asset
  "itemType": "stock",        // Required
  "ticker": "AAPL",           // Required
  "quantity": 10,             // Required
  "purchasePrice": 150,       // Required
  "currentPrice": 170,        // Required
  "purchaseDate": "2023-06-15" // Required
}
```

---

## 📚 Document Reference

| Document | Purpose | Read When |
|----------|---------|-----------|
| **PROJECT_SUMMARY.md** | Project overview & architecture | Starting out |
| **PORTFOLIO_CHECKLIST.md** | Requirements & features | Understanding scope |
| **API_CONSUMPTION_GUIDE.md** | All API endpoints with examples | Building frontend or integrating |
| **INTEGRATION_GUIDE.md** | Frontend-backend connection | Setting up integration |
| **FRONTEND_SETUP_GUIDE.md** | Frontend setup & deployment | Working on frontend |
| **FLASK_BACKEND_TEMPLATE.md** | Backend reference material | Learning backend structure |
| **portfolio-backend/README.md** | Backend documentation | Deploying or configuring |

---

## ✅ Status

**Backend:** ✅ Complete
- 13 API endpoints implemented
- PnL tracking (realized/unrealized separate)
- Asset class breakdown
- Single user system
- No authentication required

**Documentation:** ✅ Complete
- API reference provided
- Integration guide complete
- All necessary guides in place

---

## 🔗 Starting Points by Role

**Frontend Developer?**
→ Read **API_CONSUMPTION_GUIDE.md**, then **INTEGRATION_GUIDE.md**

**Database Developer?**
→ Read **portfolio-backend/README.md**, then **INTEGRATION_GUIDE.md**

**Project Manager?**
→ Read **PROJECT_SUMMARY.md**, then **PORTFOLIO_CHECKLIST.md**

---

**Everything is ready to go!** 🚀
