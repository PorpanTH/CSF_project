# Portfolio Manager - Frontend

A modern, professional financial portfolio management dashboard built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

### ✅ Current Implementation
- **Dashboard**: Comprehensive overview of all portfolios with metrics and charts
- **Portfolio Management**: Create, view, and manage multiple investment portfolios
- **Holdings Tracking**: Add, edit, and remove individual stocks, bonds, and cash
- **Performance Visualization**: 
  - Pie chart for asset allocation breakdown
  - Line chart for portfolio value trends (30-day history)
  - Real-time gain/loss calculations
- **Responsive Design**: Mobile-friendly interface with professional styling
- **Mock Data**: Fully functional with sample data (ready for Flask API integration)

### 📊 Dashboard Metrics
- Total portfolio value across all portfolios
- Total invested amount and gain/loss
- Daily market changes
- Asset allocation by type
- Individual holding performance tracking

### 🎨 User Interface Components
- Interactive navigation header
- Metric cards with trend indicators
- Portfolio cards with quick stats
- Holdings table with detailed information
- Asset allocation pie chart
- Performance line chart
- Add/Edit item modal forms
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

```bash
# Navigate to the project directory
cd portfolio-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

## 📁 Project Structure

```
portfolio-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.tsx
│   │   ├── MetricCard.tsx
│   │   ├── PortfolioItemRow.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── AddItemForm.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── PortfolioDetail.tsx
│   │   ├── PortfolioList.tsx
│   │   └── AddPortfolio.tsx
│   ├── services/           # API and data services
│   │   ├── api.ts          # API client for Flask backend
│   │   └── mockData.ts     # Mock data for development
│   ├── types.ts            # TypeScript interfaces
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles with Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🔌 API Integration

### Connecting to Flask Backend

The frontend is configured to connect to a Flask API at `http://localhost:5000/api`.

**To enable real API calls:**

1. Open `src/services/api.ts`
2. Set `USE_MOCK_DATA = false`
3. Ensure your Flask backend is running on port 5000
4. The API client will automatically attach JWT tokens to requests

### Expected API Endpoints

**Portfolios**
- `GET /api/portfolios` - Get all portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/{id}` - Get portfolio details
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio

**Portfolio Items**
- `GET /api/portfolios/{id}/items` - Get portfolio items
- `POST /api/portfolios/{id}/items` - Add item
- `PUT /api/portfolios/{id}/items/{item_id}` - Update item
- `DELETE /api/portfolios/{id}/items/{item_id}` - Delete item

### Data Models

```typescript
// Portfolio
{
  id: string
  name: string
  description: string
  items: PortfolioItem[]
  createdAt: string
  updatedAt: string
}

// PortfolioItem
{
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

## 🎨 Styling

The project uses **Tailwind CSS** for all styling with:
- Custom configuration in `tailwind.config.js`
- Responsive design utilities
- Custom component classes (`.card`, `.btn`, `.input-field`)
- Color scheme: Blue-based professional palette
- Dark-mode ready

### Color Palette
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- Warning: Orange (#F59E0B)
- Neutral: Gray scales

## 📊 Charts & Visualizations

Uses **Recharts** for data visualization:
- Pie charts for asset allocation
- Line charts for performance trends
- Responsive and interactive
- Custom tooltips and legends

## 🧪 Testing

The application includes:
- Validation on all forms
- Error handling and user feedback
- Toast notifications for actions
- Confirmation dialogs for destructive operations

## 🔒 Security Considerations

- Input validation on all forms
- XSS protection (built into React)
- CSRF-ready (tokens in API calls)
- Secure token storage ready (httpOnly cookies)
- Environment variables for sensitive config

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages are fully responsive and tested across devices.

## 🚀 Future Enhancements

- [ ] Real stock price data integration (Alpha Vantage API)
- [ ] User authentication (JWT)
- [ ] Dark mode toggle
- [ ] Portfolio performance analytics
- [ ] Advanced filtering and sorting
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications
- [ ] Mobile app (React Native)

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Vite | Build tool |
| React Router | Navigation |
| Axios | HTTP client |
| Recharts | Data visualization |
| Lucide React | Icons |

## 📝 Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Portfolio Manager
```

## 🤝 Integration Notes

### For Your Flask Backend Team:

1. **CORS Setup**: Ensure Flask has CORS enabled:
   ```python
   from flask_cors import CORS
   CORS(app)
   ```

2. **Response Format**: Return JSON with the structure defined in `types.ts`

3. **Error Handling**: Return appropriate HTTP status codes:
   - 200: Success
   - 400: Bad request
   - 401: Unauthorized
   - 404: Not found
   - 500: Server error

4. **Authentication**: Implement JWT token system
   - Frontend will send token in `Authorization: Bearer <token>` header
   - Return token on login

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Recharts](https://recharts.org)

## 📞 Support

For questions or issues:
1. Check the documentation above
2. Review the code comments
3. Check component prop interfaces in TypeScript

## 📄 License

This project is part of a training course.

---

**Ready to integrate with Flask backend!** 🚀
