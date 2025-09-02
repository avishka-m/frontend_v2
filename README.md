# WMS Frontend V2

Modern, responsive frontend for the Warehouse Management System built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Role-Based Dashboards** - Specialized interfaces for different user roles
- **Real-Time Updates** - Live data synchronization with backend
- **Interactive Components** - Rich UI components with smooth animations
- **Multi-Role Support** - Manager, Picker, Receiver, Driver, and Packer dashboards
- **Advanced Search & Filtering** - Powerful data exploration tools
- **Mobile Responsive** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode** - Theme switching support
- **Offline Support** - Basic offline functionality for critical operations

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: React Icons / Heroicons
- **Build Tool**: Vite
- **Linting**: ESLint
- **Package Manager**: npm/yarn

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (base_wms_backend)
- Modern web browser

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/frontend_v2.git
cd frontend_v2
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8002
VITE_API_VERSION=v1

# App Configuration
VITE_APP_NAME=WMS Frontend
VITE_APP_VERSION=2.0.0

# Development
VITE_DEBUG_MODE=true
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Network**: Available on your local network

### 5. Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 👥 User Roles & Dashboards

The frontend provides specialized interfaces for different warehouse roles:

### 🏢 Manager Dashboard
- **Overview**: Complete system overview and analytics
- **Order Management**: Create, view, and manage all orders
- **Inventory Control**: Monitor stock levels and locations
- **User Management**: Manage worker assignments and roles
- **Reports**: Generate comprehensive warehouse reports
- **System Settings**: Configure warehouse parameters

**Access**: Login with `manager` / `manager123`

### 📦 Picker Dashboard
- **Picking Jobs**: View assigned picking tasks
- **Order Details**: Access order information and items
- **Location Navigation**: Warehouse location guidance
- **Item Collection**: Mark items as picked
- **Progress Tracking**: Monitor picking completion status

**Access**: Login with `picker` / `picker123`

### 📥 Receiver Dashboard
- **Incoming Shipments**: Process incoming inventory
- **Item Verification**: Verify received items against orders
- **Location Assignment**: Assign items to warehouse locations
- **Inventory Updates**: Update stock levels and quantities
- **Damage Reports**: Report damaged or discrepant items

**Access**: Login with `receiver` / `receiver123`

### 🚚 Driver Dashboard
- **Delivery Routes**: View assigned delivery routes
- **Shipment Status**: Update delivery status
- **Customer Communication**: Contact information and notes
- **Vehicle Management**: Track vehicle assignments
- **Delivery Confirmation**: Mark deliveries as complete

**Access**: Login with `driver` / `driver123`

### 📋 Packer Dashboard
- **Packing Queue**: Orders ready for packing
- **Packing Instructions**: Item-specific packing guidelines
- **Shipping Labels**: Generate shipping labels and documentation
- **Quality Control**: Final order verification
- **Shipment Preparation**: Prepare orders for dispatch

**Access**: Login with `packer` / `packer123`

## 🔐 Authentication & Security

### Login Process
1. Navigate to login page
2. Enter credentials for your role
3. System validates credentials with backend
4. JWT token stored securely
5. Automatic redirection to role-appropriate dashboard

### Security Features
- JWT token-based authentication
- Automatic token refresh
- Role-based access control
- Secure API communication
- Session timeout handling
- CORS protection

## 🎨 UI Components & Design

### Design System
- **Typography**: Inter font family
- **Colors**: Professional blue/gray palette
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle depth with shadows
- **Animations**: Smooth transitions and micro-interactions

### Key Components
- `DashboardLayout` - Common dashboard structure
- `NavigationBar` - Role-based navigation
- `DataTable` - Advanced data display with sorting/filtering
- `FormComponents` - Consistent form inputs and validation
- `StatusBadges` - Visual status indicators
- `LoadingStates` - Skeleton loaders and spinners
- `ModalDialogs` - Overlay dialogs for actions
- `NotificationSystem` - Toast notifications

### Responsive Design
- **Desktop**: Full-featured interface (1200px+)
- **Tablet**: Adapted layout with collapsible sidebar (768px-1199px)
- **Mobile**: Mobile-first approach with touch-optimized UI (<768px)

## 📱 Features by Role

### Common Features (All Roles)
- ✅ Authentication & logout
- ✅ Profile management
- ✅ Notification system
- ✅ Search functionality
- ✅ Dark/light mode toggle
- ✅ Mobile responsive design

### Manager-Specific Features
- ✅ Complete dashboard overview
- ✅ Order creation and management
- ✅ Inventory analytics
- ✅ User role management
- ✅ System reports and exports
- ✅ Warehouse configuration

### Picker-Specific Features
- ✅ Picking job queue
- ✅ Item scanning/collection
- ✅ Location navigation
- ✅ Progress tracking
- ✅ Job completion workflow

### Receiver-Specific Features
- ✅ Receiving workflow
- ✅ Item verification
- ✅ Location assignment
- ✅ Inventory updates
- ✅ Damage reporting

### Driver-Specific Features
- ✅ Delivery route management
- ✅ Shipment tracking
- ✅ Customer communication
- ✅ Delivery confirmation
- ✅ Vehicle assignments

### Packer-Specific Features
- ✅ Packing queue management
- ✅ Order verification
- ✅ Shipping label generation
- ✅ Quality control checks
- ✅ Shipment preparation

## 🔧 Configuration & Customization

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8002` |
| `VITE_API_VERSION` | API version | `v1` |
| `VITE_APP_NAME` | Application name | `WMS Frontend` |
| `VITE_DEBUG_MODE` | Debug mode | `false` |

## 📁 Project Structure

```
frontend_v2/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── assets/           # Images, icons, static files
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Common components
│   │   ├── dashboards/   # Role-specific dashboards
│   │   ├── forms/        # Form components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and utilities
│   ├── styles/           # Global styles and Tailwind
│   ├── utils/            # Utility functions
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Application entry point
├── docs/                 # Documentation files
├── package.json          # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── eslint.config.js     # ESLint configuration
└── README.md            # This file
```

## 🧪 Testing & Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing (when implemented)
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔄 API Integration

### Service Architecture

The frontend uses a service-oriented architecture for API communication:

```javascript
// Example API service
class OrderService {
  async getOrders(filters = {}) {
    return await apiClient.get('/orders', { params: filters });
  }
  
  async createOrder(orderData) {
    return await apiClient.post('/orders', orderData);
  }
  
  // ... other methods
}
```

### Error Handling

- Global error boundary for React errors
- API error interceptors
- User-friendly error messages
- Retry mechanisms for failed requests
- Offline detection and handling

### State Management

- React Context for global state (user, theme, notifications)
- Local component state for UI-specific data
- Custom hooks for complex state logic
- Optimistic updates for better UX

## 📱 Mobile & Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-Specific Features

- Touch-optimized interfaces
- Swipe gestures for navigation
- Simplified forms
- Collapsible navigation
- Thumb-friendly button sizing
- Offline capability indicators

### Environment Configuration

Create environment-specific files:
- `.env.development` - Development settings
- `.env.staging` - Staging environment
- `.env.production` - Production settings

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend is running on correct port
   - Verify VITE_API_BASE_URL in .env
   - Check CORS configuration in backend

2. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Review dependency conflicts

3. **Authentication Issues**
   - Verify user credentials
   - Check JWT token expiration
   - Ensure backend auth endpoints are accessible

4. **Styling Issues**
   - Clear Tailwind build cache
   - Check for conflicting CSS
   - Verify Tailwind configuration

### Debug Mode

Enable debug mode in `.env`:
```env
VITE_DEBUG_MODE=true
```

This enables:
- Detailed console logs
- API request/response logging
- Component render tracking
- Performance monitoring

### Code Standards

- Use TypeScript-style JSDoc comments
- Follow React best practices
- Maintain consistent component structure
- Use semantic HTML elements
- Implement proper error boundaries

## 🎯 Roadmap

- [ ] Advanced testing suite (Jest + React Testing Library)
- [ ] Storybook component documentation
- [ ] PWA capabilities
- [ ] Advanced offline support
- [ ] Real-time WebSocket integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG 2.1 AA)

---

**Version**: 2.0.0  
**Last Updated**: September 2025  
**Backend Dependency**: base_wms_backend v1.0.0+
