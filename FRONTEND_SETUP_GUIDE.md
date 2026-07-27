# Portfolio Manager Frontend - Setup & Deployment Guide

## 📋 Quick Start Checklist

### Step 1: Prerequisites
- [ ] Node.js 16+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Step 2: Installation

```bash
# Navigate to the frontend directory
cd portfolio-frontend

# Install dependencies
npm install

# Verify installation
npm run type-check
```

### Step 3: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Step 4: Explore the App

**Main Pages:**
1. **Dashboard** (`/`) - Overview of all portfolios with charts
2. **Portfolio List** (`/portfolios`) - View all portfolios
3. **Portfolio Detail** (`/portfolio/:id`) - View specific portfolio details
4. **Add Portfolio** (`/add-portfolio`) - Create new portfolio

**Features to Test:**
- ✅ Add a new portfolio
- ✅ Add items (stocks/bonds/cash) to a portfolio
- ✅ View portfolio metrics and charts
- ✅ Delete items from a portfolio
- ✅ View asset allocation pie chart
- ✅ View performance line chart (30-day history)

---

## 🔧 Configuration

### API Connection

The frontend currently uses **mock data** for development.

**To switch to Flask API:**

1. Open `src/services/api.ts`
2. Change `USE_MOCK_DATA = false`
3. Update `API_BASE_URL` if needed
4. Ensure Flask backend is running on `http://localhost:5000`

### Environment Variables

Create `.env.local` in the project root:

```env
# Flask API URL
VITE_API_URL=http://localhost:5000/api

# App configuration
VITE_APP_NAME=Portfolio Manager
```

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build
npm run preview  # Preview production build locally
```

### Deployment Options

#### **Option 1: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

#### **Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### **Option 3: GitHub Pages**
```bash
# Update vite.config.ts with your repo name
npm run build
# Deploy the `dist` folder to GitHub Pages
```

#### **Option 4: Docker**
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Deploy:
```bash
docker build -t portfolio-manager .
docker run -p 3000:80 portfolio-manager
```

---

## 🔌 Flask Backend Integration

### Required API Endpoints

Your Flask backend needs these endpoints:

**Authentication**
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

**Portfolios**
```
GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/{id}
PUT    /api/portfolios/{id}
DELETE /api/portfolios/{id}
```

**Portfolio Items**
```
GET    /api/portfolios/{id}/items
POST   /api/portfolios/{id}/items
PUT    /api/portfolios/{id}/items/{item_id}
DELETE /api/portfolios/{id}/items/{item_id}
```

### Response Format

Ensure responses match these TypeScript interfaces:

```typescript
interface Portfolio {
  id: string
  name: string
  description: string
  items: PortfolioItem[]
  createdAt: string
  updatedAt: string
}

interface PortfolioItem {
  id: string
  portfolioId: string
  itemType: 'stock' | 'bond' | 'cash'
  ticker: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
  createdAt: string
  updatedAt: string
}
```

### CORS Configuration

Your Flask app needs CORS enabled:

```python
from flask_cors import CORS
from flask import Flask

app = Flask(__name__)
CORS(app)  # This allows requests from localhost:3000

# ... rest of your app
```

---

## 🧪 Testing

### Run Type Checking
```bash
npm run type-check
```

### Manual Testing Checklist

**Dashboard**
- [ ] Portfolio cards display correctly
- [ ] Metrics cards show correct values
- [ ] Charts render properly
- [ ] Can click on portfolio to view details

**Portfolio Detail**
- [ ] Portfolio name and description display
- [ ] Holdings table shows all items
- [ ] Add Item button opens modal
- [ ] Can delete items with confirmation
- [ ] Allocation chart updates on item changes
- [ ] Metrics update correctly

**Add Portfolio**
- [ ] Form validates required fields
- [ ] Can create new portfolio
- [ ] Redirects to dashboard after creation

**Responsive Design**
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Navigation works on all sizes

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
      success: '#YOUR_COLOR',
      danger: '#YOUR_COLOR',
    }
  },
}
```

Then update components that use these colors.

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Header.tsx`

### Add New Components

1. Create in `src/components/YourComponent.tsx`
2. Export from `src/components/index.ts`
3. Import and use where needed

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

### API Calls Not Working
1. Check Flask backend is running on port 5000
2. Check CORS is enabled on Flask
3. Open browser DevTools > Network tab to see requests
4. Look for 404 or CORS errors

### Charts Not Rendering
- Check browser console for errors
- Verify Recharts is installed: `npm ls recharts`
- Clear browser cache and reload

### TypeScript Errors
```bash
npm run type-check
# Fix any reported issues
```

---

## 📊 Performance Optimization

### Build Size
```bash
npm run build
# Check dist folder size
```

### Image Optimization
Currently using Lucide React icons (SVG, lightweight).

### Code Splitting
Vite automatically handles code splitting for better performance.

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Remove mock data (set `USE_MOCK_DATA = false`)
- [ ] Update API URL to production Flask backend
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test responsive design
- [ ] Test all CRUD operations
- [ ] Test error handling
- [ ] Check performance (Lighthouse)
- [ ] Verify HTTPS on production
- [ ] Set up analytics
- [ ] Enable error tracking (Sentry)

---

## 📞 Support & Resources

### Project Files
- Frontend Code: `portfolio-frontend/src/`
- Architecture: `PORTFOLIO_CHECKLIST.md`
- API Reference: `portfolio-frontend/README.md`

### Learning Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)

### Common Issues
Check the Troubleshooting section above or:
1. Look at console errors (F12 > Console)
2. Check Network tab for API issues
3. Review component prop types

---

## ✨ Next Steps

1. **Setup Frontend**: Follow the Quick Start Checklist above
2. **Connect Backend**: Implement Flask API with endpoints listed above
3. **Add Real Data**: Integrate with stock price APIs
4. **Deploy**: Choose a deployment option from above
5. **Monitor**: Set up error tracking and analytics

---

**Your Portfolio Manager is ready to deploy!** 🎉
