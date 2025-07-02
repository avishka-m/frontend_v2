// Legacy API file - maintained for backward compatibility
// New modular services are available in individual files

// Import all services from the new modular structure
export {
  authService,
  inventoryService,
  orderService,
  workerService,
  customerService,
  locationService,
  vehicleService,
  warehouseService,
  analyticsService,
  dashboardService,
  chatbotService,
} from './index';

// For backward compatibility, re-export with old names
import { 
  authService,
  inventoryService,
  orderService,
  workerService,
  customerService,
  locationService,
  vehicleService,
  warehouseService,
  analyticsService,
  dashboardService,
  chatbotService,
  wmsApi
} from './index';

// Legacy default export
export default wmsApi; 