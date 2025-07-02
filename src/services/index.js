// API Configuration
export { wmsApi, chatbotApi, BaseService } from './apiConfig';

// Core Services
export { authService } from './authService';
export { inventoryService } from './inventoryService';
export { orderService } from './orderService';
export { workerService } from './workerService';
export { customerService } from './customerService';
export { locationService } from './locationService';
export { vehicleService } from './vehicleService';

// Operations Services
export { warehouseService } from './warehouseService';

// Analytics & Dashboard
export { analyticsService } from './analyticsService';
export { dashboardService } from './dashboardService';

// AI Services
export { chatbotService } from './chatbotService';
export { seasonalInventoryService } from './seasonalInventoryApi';

// Default export for backward compatibility
export { wmsApi as default } from './apiConfig';
