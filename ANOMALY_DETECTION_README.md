# 🔍 Anomaly Detection System - Frontend Guide

This is a comprehensive anomaly detection system for your warehouse management system, featuring both rule-based and AI/ML detection capabilities.

## 🌟 Features

### 🎯 Detection Capabilities
- **Rule-based Detection**: Threshold violations, business rule violations
- **ML-based Detection**: Isolation Forest for pattern anomalies
- **Multi-category Analysis**: Inventory, Orders, Workflow, Workers
- **Real-time Monitoring**: Auto-refresh and live updates
- **Severity Classification**: Critical, High, Medium, Low

### 📊 Dashboard Features
- **Interactive Dashboard**: Real-time anomaly monitoring
- **Advanced Filtering**: By category, severity, detection method
- **Health Scoring**: Overall system health assessment
- **Visual Charts**: Trends, distributions, and analytics
- **Historical Tracking**: Complete anomaly history and patterns

### ⚡ User Experience
- **Mobile Responsive**: Works on all device sizes
- **Role-based Access**: Different features for different user roles
- **Intuitive Interface**: Easy to understand and navigate
- **Export Capabilities**: CSV export for further analysis

## 🚀 Getting Started

### 1. Backend Setup
The backend APIs are already implemented. Make sure your backend server is running:

```bash
cd base_wms_backend
python run.py
```

### 2. Create Demo Data
Run the demo script to create sample anomalies for testing:

```bash
cd base_wms_backend
python demo_anomaly_detection.py
```

### 3. Frontend Access
Navigate to the anomaly detection system in your frontend:

```
http://localhost:3000/anomaly-detection
```

## 📱 Navigation Structure

```
/anomaly-detection/
├── /                    # Main hub with navigation
├── /dashboard          # Real-time detection dashboard
├── /analysis          # Detailed analysis and reports
├── /history           # Historical anomaly data
└── /settings          # Configuration (Manager only)
```

## 🎮 Usage Guide

### For All Users:
1. **View Dashboard**: Access real-time anomaly monitoring
2. **Filter Results**: Use category and severity filters
3. **Investigate Anomalies**: Click on anomalies for detailed information
4. **Export Data**: Download CSV reports for analysis

### For Managers:
1. **Configure Thresholds**: Adjust detection sensitivity
2. **Manage ML Models**: Retrain and monitor AI models
3. **Access All Features**: Full system access and configuration

## 🔧 API Integration

The frontend integrates with these backend endpoints:

### Core Detection
- `GET /api/v1/anomaly-detection/health` - System health
- `GET /api/v1/anomaly-detection/detect` - Comprehensive detection
- `GET /api/v1/anomaly-detection/detect/inventory` - Inventory anomalies
- `GET /api/v1/anomaly-detection/detect/orders` - Order anomalies
- `GET /api/v1/anomaly-detection/detect/workflow` - Workflow anomalies
- `GET /api/v1/anomaly-detection/detect/workers` - Worker anomalies (Manager only)

### Analysis & Management
- `GET /api/v1/anomaly-detection/analysis/summary` - Analysis summary
- `POST /api/v1/anomaly-detection/models/retrain` - Retrain ML models (Manager only)
- `GET /api/v1/anomaly-detection/models/status` - Model status (Manager only)
- `GET /api/v1/anomaly-detection/thresholds` - Get thresholds (Manager only)
- `PUT /api/v1/anomaly-detection/thresholds` - Update thresholds (Manager only)

## 📊 Components Overview

### Main Components
- **AnomalyDetection.jsx**: Main navigation hub
- **AnomalyDashboard.jsx**: Real-time monitoring dashboard
- **AnomalyAnalysisPage.jsx**: Detailed analysis and reports
- **AnomalyHistoryPage.jsx**: Historical data and trends
- **AnomalySettingsPage.jsx**: Configuration (Manager only)

### UI Components
- **AnomalyCard.jsx**: Individual anomaly display
- **AnomalyList.jsx**: List view with filtering
- **AnomalyChart.jsx**: Charts and visualizations
- **AnomalyHealthScore.jsx**: System health indicator
- **AnomalyCategoryFilters.jsx**: Category filtering
- **AnomalyDetailsModal.jsx**: Detailed anomaly information

### Services & Hooks
- **anomalyDetectionService.js**: API integration
- **useAnomalyDetection.js**: React hook for state management
- **anomalyUtils.js**: Utility functions

## 🎨 Styling & Theming

The system uses Tailwind CSS with a consistent color scheme:
- **Critical**: Red (`text-red-600`, `bg-red-50`)
- **High**: Orange (`text-orange-600`, `bg-orange-50`)
- **Medium**: Yellow (`text-yellow-600`, `bg-yellow-50`)
- **Low**: Green (`text-green-600`, `bg-green-50`)

## 🔍 Detection Categories

### 📦 Inventory Anomalies
- Critical stockouts (zero stock)
- Low stock alerts
- Overstock situations
- Dead stock (no movement)
- Sudden stock drops
- Impossible quantities

### 🛒 Order Anomalies
- High-value orders
- Unusual order timing
- Bulk order patterns
- Processing delays
- Duplicate orders
- Rush orders

### 🔄 Workflow Anomalies
- Stuck orders/processes
- Workflow bottlenecks
- Processing delays
- Stage skipping
- Unusual timing patterns

### 👷 Worker Anomalies (Manager Only)
- Performance issues
- Unusual login patterns
- High error rates
- Productivity drops
- Location anomalies

## 🤖 ML Features

### Isolation Forest Detection
- Unsupervised anomaly detection
- Pattern-based analysis
- Statistical outlier detection
- Confidence scoring
- Model retraining capabilities

### Model Management
- Model status monitoring
- Performance metrics
- Retraining workflows
- Threshold configuration

## 📱 Mobile Support

The system is fully responsive and includes:
- Touch-friendly interface
- Optimized layouts for mobile
- Gesture support
- Offline capabilities
- Progressive Web App features

## 🔐 Security & Permissions

### Role-based Access:
- **All Users**: View anomalies, basic filtering, export
- **Managers**: Full access, configuration, ML management
- **Authentication**: JWT-based security
- **API Protection**: All endpoints require authentication

## 🚨 Error Handling

The system includes comprehensive error handling:
- Network error recovery
- Graceful degradation
- Offline mode support
- User-friendly error messages
- Automatic retry mechanisms

## 📈 Performance Features

- **Lazy Loading**: Components loaded on demand
- **Caching**: Intelligent data caching
- **Pagination**: Large dataset handling
- **Debounced Search**: Optimized search performance
- **Auto-refresh**: Configurable refresh intervals

## 🎯 Customization

The system is designed to be easily customizable:
- **Threshold Configuration**: Adjust detection sensitivity
- **Color Schemes**: Modify severity colors
- **Layout Options**: Grid, list, chart views
- **Filter Options**: Custom filter combinations
- **Export Formats**: Extensible export capabilities

## 🔧 Troubleshooting

### Common Issues:
1. **No Data**: Run `demo_anomaly_detection.py` to create test data
2. **API Errors**: Check backend server is running on port 8002
3. **Permission Issues**: Ensure user has appropriate role
4. **Loading Issues**: Check network connection and API endpoints

### Debug Mode:
Set `NODE_ENV=development` for detailed error information and debug tools.

## 🌟 Future Enhancements

Planned features:
- Real-time WebSocket updates
- Advanced ML models (LSTM, Transformers)
- Anomaly prediction capabilities
- Integration with external systems
- Mobile app version
- Advanced visualization options

---

**Happy Anomaly Hunting! 🔍✨**
