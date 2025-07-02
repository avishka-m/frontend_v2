# API Services Documentation

This directory contains modular API services for the Warehouse Management System frontend.

## Structure

### Core Configuration
- **`apiConfig.js`** - Base API configuration, axios instances, and BaseService class
- **`index.js`** - Main export file for all services

### Individual Services

#### Authentication
- **`authService.js`** - User authentication and session management

#### Core Business Services
- **`inventoryService.js`** - Inventory management operations
- **`orderService.js`** - Order processing and management
- **`workerService.js`** - Employee and workforce management
- **`customerService.js`** - Customer relationship management
- **`locationService.js`** - Warehouse location management
- **`vehicleService.js`** - Fleet and vehicle management

#### Operations
- **`warehouseService.js`** - Warehouse operations (receiving, picking, packing, shipping, returns)

#### Analytics & Reporting
- **`analyticsService.js`** - Data analytics and performance metrics
- **`dashboardService.js`** - Dashboard data aggregation

#### AI Services
- **`chatbotService.js`** - AI chatbot interactions
- **`seasonalInventoryApi.js`** - Seasonal inventory prediction service

#### Legacy
- **`api.js`** - Legacy file maintained for backward compatibility

## Usage

### New Modular Approach (Recommended)

```javascript
// Import specific services
import { inventoryService, orderService } from '@/services';

// Use the service
const inventory = await inventoryService.getAll();
const lowStock = await inventoryService.getLowStock(10);
```

### Individual Service Import

```javascript
// Import individual service files
import { inventoryService } from '@/services/inventoryService';
import { authService } from '@/services/authService';

// Use services
const user = await authService.getCurrentUser();
const items = await inventoryService.getAll({ category: 'Electronics' });
```

### BaseService Extension

```javascript
// Extend BaseService for custom services
import { BaseService, wmsApi } from '@/services/apiConfig';

class CustomService extends BaseService {
  constructor() {
    super(wmsApi, '/custom-endpoint');
  }

  // Add custom methods
  customMethod(id, data) {
    return this.api.post(`${this.endpoint}/${id}/custom`, data);
  }
}
```

## API Instances

### WMS API (`wmsApi`)
- **Base URL**: `http://localhost:8000/api/v1`
- **Purpose**: Main warehouse management system API
- **Authentication**: JWT Bearer token

### Chatbot API (`chatbotApi`)
- **Base URL**: `http://localhost:8001/`
- **Purpose**: AI chatbot service
- **Authentication**: JWT Bearer token

## Service Features

### Common CRUD Operations
All services extending `BaseService` include:
- `getAll(params)` - Get all records with optional filtering
- `getById(id)` - Get single record by ID
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record

### Service-Specific Methods
Each service includes additional methods specific to its domain:

#### InventoryService
- `getLowStock(limit)` - Get low stock items
- `updateStock(id, quantity)` - Update stock levels
- `getStockHistory(id)` - Get stock movement history

#### OrderService
- `getRecent(limit)` - Get recent orders
- `getPending(limit)` - Get pending orders
- `updateStatus(id, status)` - Update order status
- `cancelOrder(id, reason)` - Cancel order

#### WarehouseService
- Organized by operation type: `receiving`, `picking`, `packing`, `shipping`, `returns`
- Each operation has full CRUD support plus specific actions

## Environment Variables

Configure API endpoints in `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_CHATBOT_API_URL=http://localhost:8001
```

## Migration Guide

### From Legacy api.js

```javascript
// Old way
import { inventoryService } from '@/services/api';

// New way (same interface, better organization)
import { inventoryService } from '@/services';
// or
import { inventoryService } from '@/services/inventoryService';
```

### Benefits of New Structure

1. **Better Organization** - Each domain has its own file
2. **Easier Maintenance** - Changes isolated to specific services
3. **Better Tree Shaking** - Import only what you need
4. **Extensibility** - Easy to add new methods to specific services
5. **Type Safety** - Better TypeScript support (when migrated)
6. **Testing** - Easier to unit test individual services

## Error Handling

All services include automatic error handling:
- 401 responses redirect to login
- Network errors are propagated
- Response interceptors handle common scenarios

## Authentication

Authentication is handled automatically:
- JWT token from localStorage is attached to requests
- Token expiration triggers logout
- Supports token refresh (when implemented)
