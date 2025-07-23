import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { EnhancedChatbotProvider } from './context/EnhancedChatbotContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import Notification from './components/common/Notification';
import ErrorBoundary from './components/common/ErrorBoundary';
import FloatingChatWidget from './components/common/FloatingChatWidget';
// import WebSocketMonitor from './components/WebSocketMonitor';
import { Toaster } from 'react-hot-toast';


// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const RoleBasedDashboard = lazy(() => import('./pages/RoleBasedDashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Orders = lazy(() => import('./pages/Orders'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AddInventoryItem = lazy(() => import('./components/inventory/AddInventoryItem'));
const EditInventoryItem = lazy(() => import('./components/inventory/EditInventoryItem'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const UserProfile = lazy(() => import('./components/common/UserProfile'));
const ChangePassword = lazy(() => import('./components/common/ChangePassword'));
const Customers = lazy(() => import('./pages/Customers'));
const CreateCustomer = lazy(() => import('./pages/CreateCustomer'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Workers = lazy(() => import('./pages/Workers'));
const WorkerDetail = lazy(() => import('./pages/WorkerDetail'));
const CreateWorker = lazy(() => import('./pages/CreateWorker'));
const Locations = lazy(() => import('./pages/Locations'));
const Receiving = lazy(() => import('./pages/Receiving'));
const CreateReceiving = lazy(() => import('./pages/CreateReceiving'));
const ReceivingDetail = lazy(() => import('./pages/ReceivingDetail'));
const Picking = lazy(() => import('./pages/Picking'));
const Packing = lazy(() => import('./pages/Packing'));
const CreatePacking = lazy(() => import('./pages/CreatePacking'));
const PackingDetail = lazy(() => import('./pages/PackingDetail'));
const Shipping = lazy(() => import('./pages/Shipping'));
const CreateShipping = lazy(() => import('./pages/CreateShipping'));
const ShippingDetail = lazy(() => import('./pages/ShippingDetail'));
const Returns = lazy(() => import('./pages/Returns'));
const CreateReturn = lazy(() => import('./pages/CreateReturn'));
const ReturnDetail = lazy(() => import('./pages/ReturnDetail'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const CreateVehicle = lazy(() => import('./pages/CreateVehicle'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const OrderWorkflowTracker = lazy(() => import('./pages/OrderWorkflowTracker'));
const WorkflowManagement = lazy(() => import('./pages/WorkflowManagement'));
const RoleBasedChatbot = lazy(() => import('./pages/chatbot/RoleBasedChatbot'));
const WarehouseMapPage = lazy(() => import('./pages/WarehouseMap'));
const History = lazy(() => import('./pages/History'));
const UpdateInventory = lazy(() => import('./pages/UpdateInventory'));
const ReturnItem = lazy(() => import('./pages/receiving/ReturnItem'));
const SeasonalInventoryDashboard = lazy(() => import('./pages/SeasonalInventoryDashboard'));
const SeasonalInventoryDemo = lazy(() => import('./pages/SeasonalInventoryDemo'));
const AnomalyDetection = lazy(() => import('./pages/AnomalyDetection'));
const AnomalyDetectionDashboard = lazy(() => import('./pages/anomaly/AnomalyDetectionDashboard'));
const AnomalyAnalysisPage = lazy(() => import('./pages/anomaly/AnomalyAnalysisPage'));
const AnomalySettingsPage = lazy(() => import('./pages/anomaly/AnomalySettingsPage'));
const AnomalyHistoryPage = lazy(() => import('./pages/anomaly/AnomalyHistoryPage'));


function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationProvider>
          <AuthProvider>
            <EnhancedChatbotProvider>
              <Notification />
              <Toaster position="top-right" />
                
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  {/* Protected routes - within layout */}
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    {/* Dashboard - role-based routing */}
                    <Route path="/dashboard" element={<RoleBasedDashboard />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    {/* Inventory routes - Manager, ReceivingClerk, Picker */}
                    <Route path="/inventory" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><Inventory /></RoleBasedRoute>} />
                    <Route path="/inventory/add" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><AddInventoryItem /></RoleBasedRoute>} />
                    <Route path="/inventory/edit/:id" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><EditInventoryItem /></RoleBasedRoute>} />
                    <Route path="/inventory/update" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><UpdateInventory /></RoleBasedRoute>} />
                    {/* Order routes - Manager, ReceivingClerk, Picker, Packer */}
                    <Route path="/orders" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}><Orders /></RoleBasedRoute>} />
                    <Route path="/orders/create" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><CreateOrder /></RoleBasedRoute>} />
                    <Route path="/orders/:id" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}><OrderDetail /></RoleBasedRoute>} />
                    {/* Customers routes - Manager only */}
                    <Route path="/customers" element={<RoleBasedRoute allowedRoles={['Manager']}><Customers /></RoleBasedRoute>} />
                    <Route path="/customers/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreateCustomer /></RoleBasedRoute>} />
                    <Route path="/customers/:id/edit" element={<RoleBasedRoute allowedRoles={['Manager']}><CustomerDetail /></RoleBasedRoute>} />
                    {/* Workers routes - Manager only */}
                    <Route path="/workers" element={<RoleBasedRoute allowedRoles={['Manager']}><Workers /></RoleBasedRoute>} />
                    <Route path="/workers/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreateWorker /></RoleBasedRoute>} />
                    <Route path="/workers/:id" element={<RoleBasedRoute allowedRoles={['Manager']}><WorkerDetail /></RoleBasedRoute>} />
                    {/* Locations routes - Manager, ReceivingClerk, Picker */}
                    <Route path="/locations" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker']}><Locations /></RoleBasedRoute>} />
                    {/* Receiving routes - Manager, ReceivingClerk */}
                    <Route path="/receiving" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><Receiving /></RoleBasedRoute>} />
                    <Route path="/receiving/create" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><CreateReceiving /></RoleBasedRoute>} />
                    <Route path="/receiving/return-item" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><ReturnItem /></RoleBasedRoute>} />
                    <Route path="/receiving/:id" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><ReceivingDetail /></RoleBasedRoute>} />
                    {/* Picking routes - Manager, Picker */}
                    <Route path="/picking" element={<RoleBasedRoute allowedRoles={['Manager', 'Picker']}><Picking /></RoleBasedRoute>} />
                    {/* Packing routes - Manager, Packer */}
                    <Route path="/packing" element={<RoleBasedRoute allowedRoles={['Manager', 'Packer']}><Packing /></RoleBasedRoute>} />
                    <Route path="/packing/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreatePacking /></RoleBasedRoute>} />
                    <Route path="/packing/:id" element={<RoleBasedRoute allowedRoles={['Manager', 'Packer']}><PackingDetail /></RoleBasedRoute>} />
                    {/* Shipping routes - Manager, Driver */}
                    <Route path="/shipping" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><Shipping /></RoleBasedRoute>} />
                    <Route path="/shipping/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreateShipping /></RoleBasedRoute>} />
                    <Route path="/shipping/:shippingId" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><ShippingDetail /></RoleBasedRoute>} />
                    <Route path="/shipping/:shippingId/edit" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><ShippingDetail /></RoleBasedRoute>} />
                    <Route path="/shipping/:shippingId/tracking" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><ShippingDetail /></RoleBasedRoute>} />
                    {/* Returns routes - Manager, ReceivingClerk */}
                    <Route path="/returns" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><Returns /></RoleBasedRoute>} />
                    <Route path="/returns/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreateReturn /></RoleBasedRoute>} />
                    <Route path="/returns/:returnId" element={<RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}><ReturnDetail /></RoleBasedRoute>} />
                    {/* Vehicles routes - Manager, Driver */}
                    <Route path="/vehicles" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><Vehicles /></RoleBasedRoute>} />
                    <Route path="/vehicles/create" element={<RoleBasedRoute allowedRoles={['Manager']}><CreateVehicle /></RoleBasedRoute>} />
                    <Route path="/vehicles/:vehicleId" element={<RoleBasedRoute allowedRoles={['Manager', 'Driver']}><VehicleDetail /></RoleBasedRoute>} />
                    <Route path="/vehicles/:vehicleId/edit" element={<RoleBasedRoute allowedRoles={['Manager']}><VehicleDetail /></RoleBasedRoute>} />
                    {/* Analytics routes - Manager only */}
                    <Route path="/analytics" element={<RoleBasedRoute allowedRoles={['Manager']}><Analytics /></RoleBasedRoute>} />
                    {/* Seasonal Inventory routes - Manager only */}
                    <Route path="/seasonal-inventory" element={<RoleBasedRoute allowedRoles={['Manager']}><SeasonalInventoryDashboard /></RoleBasedRoute>} />
                    <Route path="/seasonal-inventory/demo" element={<RoleBasedRoute allowedRoles={['Manager']}><SeasonalInventoryDemo /></RoleBasedRoute>} />
                    {/* Anomaly Detection routes - All authenticated users */}
                    <Route path="/anomaly-detection/*" element={<AnomalyDetection />} />
                    <Route path="/anomaly-detection/dashboard" element={<AnomalyDetectionDashboard />} />
                    <Route path="/anomaly-detection/analysis" element={<AnomalyAnalysisPage />} />
                    <Route path="/anomaly-detection/history" element={<AnomalyHistoryPage />} />
                    <Route path="/anomaly-detection/settings" element={<RoleBasedRoute allowedRoles={['Manager']}><AnomalySettingsPage /></RoleBasedRoute>} />
                    {/* Workflow routes - Manager, Picker, Packer, Driver */}
                    <Route path="/workflow" element={<RoleBasedRoute allowedRoles={['Manager', 'Picker', 'Packer', 'Driver', 'ReceivingClerk']}><WorkflowManagement /></RoleBasedRoute>} />
                    <Route path="/workflow/dashboard" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/workflow/order/:orderId" element={<RoleBasedRoute allowedRoles={['Manager', 'Picker', 'Packer', 'Driver', 'ReceivingClerk']}><OrderWorkflowTracker /></RoleBasedRoute>} />
                    {/* Settings routes - Manager only */}
                    <Route path="/settings" element={<RoleBasedRoute allowedRoles={['Manager']}><Settings /></RoleBasedRoute>} />
                    {/* Enhanced Chatbot - All roles */}
                    <Route path="/chatbot/enhanced" element={<RoleBasedChatbot />} />
                    
                    {/* Picker specific routes */}
                    <Route path="/history" element={<RoleBasedRoute allowedRoles={['Manager', 'Picker']}><History /></RoleBasedRoute>} />
                    <Route path="/warehouse-map" element={<RoleBasedRoute allowedRoles={['Manager', 'Picker']}><WarehouseMapPage /></RoleBasedRoute>} />
                    
                    {/* Common routes */}
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    {/* Default redirect to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    {/* 404 page */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>

              {/* Enhanced Personal Assistant */}
              <FloatingChatWidget />
              {/* WebSocket Connection Monitor
              <WebSocketMonitor /> */}
            </EnhancedChatbotProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
