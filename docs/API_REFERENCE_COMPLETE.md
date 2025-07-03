# 📡 Backend API Reference - Complete Endpoint Documentation

## 🏗️ API Architecture Overview

**Base URL**: `http://localhost:8002/api/v1`  
**Authentication**: JWT Bearer Token  
**Response Format**: JSON  
**Total Endpoints**: 83 endpoints across 15 modules

## 🔐 Authentication System

### Base: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/auth/token` | Login and get JWT token | ❌ | All |
| `GET` | `/auth/me` | Get current user info | ✅ | All |

#### Request/Response Examples:

```javascript
// Login Request
POST /api/v1/auth/token
Content-Type: application/x-www-form-urlencoded

username=manager&password=password123

// Login Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "user_id",
    "username": "manager",
    "role": "Manager",
    "warehouse_id": "warehouse_1"
  }
}
```

## 📦 Inventory Management

### Base: `/api/v1/inventory`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all inventory items | ✅ | All |
| `POST` | `/` | Create new inventory item | ✅ | Manager, Clerk |
| `GET` | `/{item_id}` | Get specific inventory item | ✅ | All |
| `PUT` | `/{item_id}` | Update inventory item | ✅ | Manager, Clerk |
| `DELETE` | `/{item_id}` | Delete inventory item | ✅ | Manager |
| `GET` | `/low-stock` | Get low stock items | ✅ | All |
| `GET` | `/categories` | Get inventory categories | ✅ | All |
| `POST` | `/{item_id}/allocate` | Allocate inventory for order | ✅ | All |

#### Key Features:
- **Filtering**: By category, low stock status, location
- **Pagination**: Skip/limit parameters
- **Stock Alerts**: Automated low stock detection
- **Allocation**: Reserve inventory for orders

#### Request/Response Examples:

```javascript
// Get Inventory Items
GET /api/v1/inventory?category=Electronics&low_stock=true&skip=0&limit=20

// Response
{
  "items": [
    {
      "id": "inv_001",
      "product_name": "Laptop Dell XPS 13",
      "sku": "DELL-XPS13-001",
      "category": "Electronics",
      "quantity": 5,
      "min_stock_level": 10,
      "max_stock_level": 100,
      "location": "A1-B2-C3",
      "price": 1299.99,
      "status": "low_stock",
      "last_updated": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "has_more": false
}

// Create Inventory Item
POST /api/v1/inventory
{
  "product_name": "iPhone 15 Pro",
  "sku": "APPLE-IP15P-256",
  "category": "Electronics",
  "quantity": 50,
  "min_stock_level": 20,
  "max_stock_level": 200,
  "location": "B2-A1-C4",
  "price": 999.99,
  "supplier_id": "supplier_apple"
}
```

## 📋 Order Management

### Base: `/api/v1/orders`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all orders | ✅ | All |
| `POST` | `/` | Create new order | ✅ | Manager, Clerk |
| `GET` | `/{order_id}` | Get specific order | ✅ | All |
| `PUT` | `/{order_id}` | Update order | ✅ | Manager, Clerk |
| `DELETE` | `/{order_id}` | Delete order | ✅ | Manager |
| `POST` | `/{order_id}/fulfill` | Start order fulfillment | ✅ | Picker, Manager |
| `POST` | `/{order_id}/pack` | Mark order as packed | ✅ | Packer, Manager |
| `POST` | `/{order_id}/ship` | Ship order | ✅ | Driver, Manager |
| `GET` | `/status/{status}` | Get orders by status | ✅ | All |
| `GET` | `/{order_id}/tracking` | Get order tracking info | ✅ | All |

#### Order Statuses:
- `pending` → `processing` → `picking` → `packing` → `shipping` → `delivered`
- `cancelled`, `returned`

## 👥 Worker Management

### Base: `/api/v1/workers`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all workers | ✅ | Manager |
| `POST` | `/` | Create new worker | ✅ | Manager |
| `GET` | `/{worker_id}` | Get specific worker | ✅ | Manager, Self |
| `PUT` | `/{worker_id}` | Update worker | ✅ | Manager |
| `GET` | `/{worker_id}/performance` | Get worker performance | ✅ | Manager, Self |
| `POST` | `/{worker_id}/assign-task` | Assign task to worker | ✅ | Manager |

#### Worker Roles:
- `Manager`, `ReceivingClerk`, `Picker`, `Packer`, `Driver`

## 🏢 Customer Management

### Base: `/api/v1/customers`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all customers | ✅ | All |
| `POST` | `/` | Create new customer | ✅ | Manager, Clerk |
| `GET` | `/{customer_id}` | Get specific customer | ✅ | All |
| `PUT` | `/{customer_id}` | Update customer | ✅ | Manager, Clerk |
| `GET` | `/{customer_id}/orders` | Get customer orders | ✅ | All |

## 📍 Location Management

### Base: `/api/v1/locations`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all locations | ✅ | All |
| `POST` | `/` | Create new location | ✅ | Manager |
| `GET` | `/{location_id}` | Get specific location | ✅ | All |
| `GET` | `/optimal/{item_id}` | Find optimal location for item | ✅ | All |

## 📦 Warehouse Operations

### Receiving: `/api/v1/receiving`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all receiving tasks | ✅ | All |
| `POST` | `/` | Create receiving task | ✅ | Manager, Clerk |
| `PUT` | `/{task_id}` | Update receiving task | ✅ | Manager, Clerk |
| `POST` | `/{task_id}/complete` | Complete receiving | ✅ | Clerk |

### Picking: `/api/v1/picking`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all picking tasks | ✅ | All |
| `POST` | `/` | Create picking task | ✅ | Manager, Picker |
| `PUT` | `/{task_id}` | Update picking task | ✅ | Picker, Manager |
| `POST` | `/{task_id}/complete` | Complete picking | ✅ | Picker |

### Packing: `/api/v1/packing`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all packing tasks | ✅ | All |
| `POST` | `/` | Create packing task | ✅ | Manager, Packer |
| `PUT` | `/{task_id}` | Update packing task | ✅ | Packer, Manager |
| `POST` | `/{task_id}/complete` | Complete packing | ✅ | Packer |

### Shipping: `/api/v1/shipping`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all shipments | ✅ | All |
| `POST` | `/` | Create shipment | ✅ | Manager, Driver |
| `PUT` | `/{shipment_id}` | Update shipment | ✅ | Driver, Manager |
| `POST` | `/{shipment_id}/deliver` | Mark as delivered | ✅ | Driver |
| `GET` | `/{shipment_id}/tracking` | Get tracking info | ✅ | All |

## 🔄 Returns Management

### Base: `/api/v1/returns`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all returns | ✅ | All |
| `POST` | `/` | Create return | ✅ | Manager, Clerk |
| `PUT` | `/{return_id}` | Update return | ✅ | Manager, Clerk |
| `POST` | `/{return_id}/process` | Process return | ✅ | Clerk |

## 🚛 Vehicle Management

### Base: `/api/v1/vehicles`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Get all vehicles | ✅ | All |
| `POST` | `/` | Create vehicle | ✅ | Manager |
| `GET` | `/{vehicle_id}` | Get specific vehicle | ✅ | All |

## 📊 Analytics Dashboard

### Base: `/api/v1/analytics`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/dashboard` | Get dashboard metrics | ✅ | All |
| `GET` | `/inventory-report` | Get inventory analytics | ✅ | Manager |
| `GET` | `/order-report` | Get order analytics | ✅ | Manager |
| `GET` | `/worker-performance` | Get worker metrics | ✅ | Manager |

#### Dashboard Metrics Example:
```javascript
{
  "overview": {
    "total_orders": 1247,
    "pending_orders": 23,
    "total_inventory_value": 2456789.50,
    "low_stock_items": 15,
    "active_workers": 42
  },
  "charts": {
    "orders_by_status": [...],
    "inventory_turnover": [...],
    "worker_productivity": [...]
  }
}
```

## 🤖 AI Prediction Services

### Base: `/api/v1/predictions`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/health` | Service health check | ✅ | Manager, Analyst |
| `POST` | `/item/predict` | Predict item demand | ✅ | Manager, Analyst |
| `POST` | `/items/batch-predict` | Batch prediction | ✅ | Manager, Analyst |
| `POST` | `/item/analyze` | Item pattern analysis | ✅ | Manager, Analyst |
| `POST` | `/category/predict` | Category prediction | ✅ | Manager, Analyst |
| `GET` | `/recommendations` | Inventory recommendations | ✅ | Manager, Analyst |
| `GET` | `/model/status` | Model status | ✅ | Manager, Analyst |
| `POST` | `/model/retrain` | Retrain model | ✅ | Manager |

#### Prediction Features:
- **Prophet ML**: Time series forecasting
- **Confidence Intervals**: 95% default, configurable
- **External Factors**: Weather, economic data integration
- **Batch Processing**: Background tasks for large datasets
- **Pattern Analysis**: Seasonality and trend detection

## 🤖 Enhanced AI Chatbot

### Base: `/api/v1/chatbot`

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/` | Health check | ✅ | All |
| `POST` | `/conversations` | Create conversation | ✅ | All |
| `GET` | `/conversations` | List conversations | ✅ | All |
| `GET` | `/conversations/{id}` | Get conversation | ✅ | All |
| `PUT` | `/conversations/{id}` | Update conversation | ✅ | All |
| `DELETE` | `/conversations/{id}` | Delete conversation | ✅ | All |
| `POST` | `/chat` | Send chat message | ✅ | All |
| `GET` | `/user/role` | Get user role info | ✅ | All |
| `POST` | `/conversations/search` | Search conversations | ✅ | All |
| `GET` | `/conversations/{id}/export` | Export conversation | ✅ | All |
| `POST` | `/conversations/{id}/analysis` | Analyze conversation | ✅ | Manager |
| `GET` | `/analytics/usage` | Get usage analytics | ✅ | Manager |

#### AI Agent Capabilities:

**Manager Agent**: Full system access, analytics, worker management  
**Clerk Agent**: Inventory, orders, returns, receiving procedures  
**Picker Agent**: Item location, picking optimization, path planning  
**Packer Agent**: Packing procedures, order verification, quality control  
**Driver Agent**: Route optimization, vehicle selection, delivery tracking  

#### Conversation Features:
- **Persistent Memory**: Cross-session conversation history
- **Role-Based Responses**: Agent behavior adapted to user role
- **Tool Integration**: AI agents can execute real warehouse operations
- **Context Awareness**: Understanding of current workflow and location
- **Multi-Modal**: Support for voice, images, documents

## 🔑 Authentication & Authorization

### JWT Token Structure:
```javascript
{
  "sub": "user_id",
  "username": "manager",
  "role": "Manager",
  "warehouse_id": "warehouse_1",
  "exp": 1641123456,
  "iat": 1641037056
}
```

### Role Permissions Matrix:

| Feature | Manager | Clerk | Picker | Packer | Driver |
|---------|---------|-------|--------|--------|--------|
| View Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modify Inventory | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Orders | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process Orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Worker Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Analytics | ✅ | Limited | Limited | Limited | Limited |
| AI Predictions | ✅ | ❌ | ❌ | ❌ | ❌ |
| All AI Agents | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚀 Real-time Features

### WebSocket Events:
- `order_status_changed`
- `inventory_low_stock`
- `task_assigned`
- `shipment_updated`
- `ai_prediction_complete`

### Push Notifications:
- Order status updates
- Low stock alerts
- Task assignments
- AI recommendations
- System announcements

---

*This comprehensive API reference serves as the foundation for building the frontend interface. Each endpoint includes proper authentication, role-based access control, and detailed request/response specifications.*
