# Seasonal Inventory Forecasting Frontend

A comprehensive React-based frontend for AI-powered seasonal inventory forecasting, designed exclusively for Managers in the warehouse management system.

## 🎯 Features

### **Demand Forecasting**
- **Prophet ML Integration**: Facebook Prophet-based time series forecasting
- **Interactive Charts**: Real-time forecast visualization with confidence intervals
- **Multiple Horizons**: 7, 30, 60, and 90-day prediction windows
- **Historical Analysis**: Trend analysis with historical data overlay

### **Seasonal Pattern Analysis**
- **Weekly Patterns**: Day-of-week demand variations
- **Monthly Patterns**: Seasonal monthly demand trends
- **Visual Insights**: Bar charts with above/below average indicators
- **Smart Recommendations**: AI-driven seasonal adjustment suggestions

### **Inventory Recommendations**
- **Reorder Points**: AI-calculated optimal reorder thresholds
- **Order Quantities**: Recommended purchase quantities
- **Peak Preparation**: Alerts for seasonal demand spikes
- **Confidence Scoring**: High/Medium/Low confidence levels for each recommendation

### **Real-time System Monitoring**
- **Health Checks**: System status monitoring
- **Model Performance**: Accuracy metrics and MAPE tracking
- **Data Quality**: Records processed and product coverage stats

## 🔒 Access Control

**Manager-Only Access**: All seasonal inventory features are restricted to users with Manager role:
- Routes protected with `RoleBasedRoute` component
- Navigation items only visible to Managers
- API calls include proper authentication headers

## 📱 Components Architecture

```
components/SeasonalInventory/
├── ForecastChart.jsx           # Prophet forecast visualization
├── SeasonalPatternsChart.jsx   # Weekly/monthly pattern analysis
└── InventoryRecommendations.jsx # AI recommendations display

pages/
├── SeasonalInventoryDashboard.jsx # Main live dashboard
└── SeasonalInventoryDemo.jsx      # Demo with mock data

services/
└── seasonalInventoryService.js    # API integration service
```

## 🛠 Technical Implementation

### **Frontend Stack**
- **React 19.1.0** with hooks and functional components
- **Chart.js** for interactive forecasting charts
- **Tailwind CSS** for responsive styling
- **React Router v7** for navigation
- **Axios** for API communication

### **API Integration**
```javascript
// Main API endpoints
const seasonalInventoryService = {
  healthCheck(),                    // System health
  getSystemStatus(),               // Model performance
  getProductForecast(id, days),    // Individual forecasts
  getBatchForecast(ids, days),     // Multiple products
  getItemAnalysis(id),             // Seasonal patterns
  getInventoryRecommendations(),   // AI suggestions
  retrainModels(ids)               // Model updates
}
```

### **Data Flow**
1. **Initialization**: Health check → System status → Load products
2. **Forecasting**: Select product → Generate forecast → Display charts
3. **Analysis**: Seasonal patterns → Recommendations → Action items
4. **Monitoring**: Real-time status → Performance metrics → Alerts

## 🎨 User Interface

### **Dashboard Layout**
- **Header**: Title, system status, action buttons
- **Controls**: Product selector, forecast horizon, generate button
- **Main Grid**: Forecast chart (2/3) + Seasonal patterns (1/3)
- **Recommendations**: Full-width AI suggestions panel

### **Visual Design**
- **Color Coding**: Green (good), Yellow (caution), Red (urgent)
- **Interactive Charts**: Hover tooltips, zoom capabilities
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Spinners and skeleton screens

## 🚀 Usage Instructions

### **For Managers**
1. **Navigate**: Sidebar → "Seasonal Forecasting"
2. **Select Product**: Choose from available inventory items
3. **Set Horizon**: Pick forecast period (7-90 days)
4. **Generate**: Click "Generate Forecast" button
5. **Analyze**: Review charts, patterns, and recommendations
6. **Act**: Use recommendations for inventory planning

### **Demo Mode**
- Access via `/seasonal-inventory/demo`
- Uses mock data for testing/training
- Full UI functionality without backend dependency

## 📊 Data Visualization

### **Forecast Chart**
- **Blue Line**: Historical demand data
- **Green Dashed**: Prophet forecast predictions
- **Gray Bands**: Confidence intervals (upper/lower bounds)
- **Interactive**: Hover for exact values and dates

### **Seasonal Patterns**
- **Weekly Bars**: % above/below average by day
- **Monthly Bars**: Seasonal variation by month
- **Color Coding**: Green (high), Gray (low) demand periods
- **Insights Panel**: Peak/low periods with recommendations

### **Recommendations Cards**
- **Urgency Levels**: High (red), Medium (yellow), Low (green)
- **Type Icons**: Reorder, quantity, peak preparation
- **Action Buttons**: Take action, dismiss, view details
- **Confidence**: AI certainty level for each suggestion

## 🔧 Configuration

### **Environment Variables**
```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# For seasonal inventory endpoints
# Uses /api/v1/predictions/* routes
```

### **Navigation Setup**
```javascript
// Sidebar.jsx - Manager navigation
{ 
  path: '/seasonal-inventory', 
  name: 'Seasonal Forecasting', 
  icon: BarChart3 
}
```

### **Route Protection**
```jsx
// App.jsx - Manager-only access
<Route 
  path="/seasonal-inventory" 
  element={
    <RoleBasedRoute allowedRoles={['Manager']}>
      <SeasonalInventoryDashboard />
    </RoleBasedRoute>
  } 
/>
```

## 🐛 Error Handling

### **Connection Issues**
- **Health Check Failures**: Retry mechanism with user feedback
- **API Timeouts**: 30-second timeout with error messages
- **Network Errors**: Graceful fallback to cached data

### **Data Validation**
- **Product Selection**: Required field validation
- **Forecast Horizons**: 1-365 day range enforcement
- **Empty Responses**: Friendly "no data" messages

### **User Feedback**
- **Toast Notifications**: Success/error messages
- **Loading States**: Progress indicators
- **Status Alerts**: System health notifications

## 🔄 Integration Points

### **Backend APIs**
- **Prophet Service**: `/api/v1/predictions/*` endpoints
- **Inventory Service**: Product list and details
- **Authentication**: JWT token-based access control

### **Existing Features**
- **Inventory Management**: Product selection integration
- **Analytics Dashboard**: Shared chart components
- **User Management**: Role-based access control

## 📈 Performance

### **Optimization**
- **Lazy Loading**: Route-based code splitting
- **Chart Rendering**: Canvas-based Chart.js for performance
- **API Caching**: React Query for efficient data fetching
- **Component Memoization**: Prevent unnecessary re-renders

### **Monitoring**
- **Load Times**: Chart rendering performance
- **API Response**: Backend service availability
- **User Actions**: Forecast generation success rates

## 🚧 Future Enhancements

### **Planned Features**
- **Batch Processing**: Multiple product forecasting
- **Export Capabilities**: PDF/Excel report generation
- **Advanced Filters**: Category, supplier, location-based filtering
- **Collaboration**: Share forecasts with team members

### **Technical Improvements**
- **WebSocket Updates**: Real-time forecast updates
- **Offline Support**: Cached data for disconnected use
- **Mobile App**: React Native implementation
- **Advanced Charts**: 3D visualizations and heatmaps

---

This seasonal inventory forecasting frontend provides Managers with powerful AI-driven insights for optimal inventory planning and demand prediction.
