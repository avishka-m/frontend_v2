import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EnhancedChatbotProvider } from './context/EnhancedChatbotContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import Notification from './components/common/Notification';
import ErrorBoundary from './components/common/ErrorBoundary';
import FloatingChatWidget from './components/common/FloatingChatWidget';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';

// Inventory Components
import AddInventoryItem from './components/inventory/AddInventoryItem';
import EditInventoryItem from './components/inventory/EditInventoryItem';

// Order Components
import OrderDetail from './pages/OrderDetail';
import CreateOrder from './pages/CreateOrder';

// Common Components
import UserProfile from './components/common/UserProfile';
import ChangePassword from './components/common/ChangePassword';

// Import placeholder components for new routes
// These will need to be created separately
import Customers from './pages/Customers';
import CreateCustomer from './pages/CreateCustomer';
import CustomerDetail from './pages/CustomerDetail';
import Workers from './pages/Workers';
import WorkerDetail from './pages/WorkerDetail';
import CreateWorker from './pages/CreateWorker';
import Locations from './pages/Locations';
import Receiving from './pages/Receiving';
import CreateReceiving from './pages/CreateReceiving';
import ReceivingDetail from './pages/ReceivingDetail';
import UpdateItem from './pages/receiving/UpdateItem';
import ReturnItem from './pages/receiving/ReturnItem';
import UpdateInventory from './pages/UpdateInventory';
import Picking from './pages/Picking';
import Packing from './pages/Packing';
import CreatePacking from './pages/CreatePacking';
import PackingDetail from './pages/PackingDetail';
import Shipping from './pages/Shipping';
import CreateShipping from './pages/CreateShipping';
import ShippingDetail from './pages/ShippingDetail';
import Returns from './pages/Returns';
import CreateReturn from './pages/CreateReturn';
import ReturnDetail from './pages/ReturnDetail';
import Vehicles from './pages/Vehicles';
import CreateVehicle from './pages/CreateVehicle';
import VehicleDetail from './pages/VehicleDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Workflow Components
import OrderWorkflowTracker from './pages/OrderWorkflowTracker';
import WorkflowManagement from './pages/WorkflowManagement';

// Enhanced Chatbot Components
import RoleBasedChatbot from './pages/chatbot/RoleBasedChatbot';

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationProvider>
          <AuthProvider>
            <EnhancedChatbotProvider>
              <Notification />
              <Toaster position="top-right" />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes - within layout */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  {/* Dashboard - role-based routing */}
                  <Route path="/dashboard" element={<RoleBasedDashboard />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Inventory routes - Manager, ReceivingClerk, Picker */}
                  <Route path="/inventory" element={
                    <RoleBasedRoute allowedRoles={['Manager','ReceivingClerk']}>
                      <Inventory />
                    </RoleBasedRoute>
                  } />
                  <Route path="/inventory/add" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <AddInventoryItem />
                    </RoleBasedRoute>
                  } />
                  <Route path="/inventory/edit/:id" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <EditInventoryItem />
                    </RoleBasedRoute>
                  } />
                  <Route path="/inventory/update" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <UpdateInventory />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Order routes - Manager, ReceivingClerk, Picker, Packer */}
                  <Route path="/orders" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}>
                      <Orders />
                    </RoleBasedRoute>
                  } />
                  <Route path="/orders/create" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <CreateOrder />
                    </RoleBasedRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}>
                      <OrderDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Customers routes - Manager only */}
                  <Route path="/customers" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Customers />
                    </RoleBasedRoute>
                  } />
                  <Route path="/customers/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreateCustomer />
                    </RoleBasedRoute>
                  } />
                  <Route path="/customers/:id/edit" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CustomerDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Workers routes - Manager only */}
                  <Route path="/workers" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Workers />
                    </RoleBasedRoute>
                  } />
                  <Route path="/workers/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreateWorker />
                    </RoleBasedRoute>
                  } />
                  <Route path="/workers/:id" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <WorkerDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Locations routes - Manager, ReceivingClerk, Picker */}
                  <Route path="/locations" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker']}>
                      <Locations />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Receiving routes - Manager, ReceivingClerk */}
                  <Route path="/receiving" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <Receiving />
                    </RoleBasedRoute>
                  } />
                  <Route path="/receiving/create" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <CreateReceiving />
                    </RoleBasedRoute>
                  } />
                  <Route path="/receiving/update-item" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <UpdateItem />
                    </RoleBasedRoute>
                  } />
                  <Route path="/receiving/return-item" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <ReturnItem />
                    </RoleBasedRoute>
                  } />
                  <Route path="/receiving/:id" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <ReceivingDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Picking routes - Manager, Picker */}
                  <Route path="/picking" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Picker']}>
                      <Picking />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Packing routes - Manager, Packer */}
                  <Route path="/packing" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Packer']}>
                      <Packing />
                    </RoleBasedRoute>
                  } />
                  <Route path="/packing/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreatePacking />
                    </RoleBasedRoute>
                  } />
                  <Route path="/packing/:id" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Packer']}>
                      <PackingDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Shipping routes - Manager, Driver */}
                  <Route path="/shipping" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <Shipping />
                    </RoleBasedRoute>
                  } />
                  <Route path="/shipping/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreateShipping />
                    </RoleBasedRoute>
                  } />
                  <Route path="/shipping/:shippingId" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <ShippingDetail />
                    </RoleBasedRoute>
                  } />
                  <Route path="/shipping/:shippingId/edit" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <ShippingDetail />
                    </RoleBasedRoute>
                  } />
                  <Route path="/shipping/:shippingId/tracking" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <ShippingDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Returns routes - Manager, ReceivingClerk */}
                  <Route path="/returns" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <Returns />
                    </RoleBasedRoute>
                  } />
                  <Route path="/returns/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreateReturn />
                    </RoleBasedRoute>
                  } />
                  <Route path="/returns/:returnId" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <ReturnDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Vehicles routes - Manager, Driver */}
                  <Route path="/vehicles" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <Vehicles />
                    </RoleBasedRoute>
                  } />
                  <Route path="/vehicles/create" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <CreateVehicle />
                    </RoleBasedRoute>
                  } />
                  <Route path="/vehicles/:vehicleId" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <VehicleDetail />
                    </RoleBasedRoute>
                  } />
                  <Route path="/vehicles/:vehicleId/edit" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <VehicleDetail />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Analytics routes - Manager only */}
                  <Route path="/analytics" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Analytics />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Workflow routes - Manager, Picker, Packer, Driver */}
                  <Route path="/workflow" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Picker', 'Packer', 'Driver', 'ReceivingClerk']}>
                      <WorkflowManagement />
                    </RoleBasedRoute>
                  } />
                  <Route path="/workflow/dashboard" element={
                    <Navigate to="/dashboard" replace />
                  } />
                  <Route path="/workflow/order/:orderId" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Picker', 'Packer', 'Driver', 'ReceivingClerk']}>
                      <OrderWorkflowTracker />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Settings routes - Manager only */}
                  <Route path="/settings" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Settings />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Enhanced Chatbot - All roles */}
                  <Route path="/chatbot/enhanced" element={<RoleBasedChatbot />} />
                  
                  {/* Common routes */}
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  
                  {/* Default redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              
              {/* Enhanced Personal Assistant */}
              <FloatingChatWidget />
              
            </EnhancedChatbotProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
