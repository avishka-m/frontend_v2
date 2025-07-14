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
import React, { Suspense, lazy } from 'react';

// Pages
import Login from './pages/Login';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import InventoryDetailOptimized from './pages/InventoryDetailOptimized';
import OrdersComplexOptimized from './pages/OrdersComplexOptimized';
import NotFound from './pages/NotFound';

// Inventory Components
import InventoryAddForm from './components/forms/InventoryAddForm';
import InventoryEditForm from './components/forms/InventoryEditForm';

// Order Components
import OrderDetailOptimized from './pages/OrderDetailOptimized';
import OrderCreateForm from './components/forms/OrderCreateForm';

// Common Components  
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';

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
import ReceivingCreateForm from './components/forms/ReceivingCreateForm';
import ReceivingDetailOptimized from './pages/ReceivingDetailOptimized';
import Picking from './pages/Picking';
import Packing from './pages/Packing';
import PackingCreateForm from './components/forms/PackingCreateForm';
import PackingDetailOptimized from './pages/PackingDetailOptimized';
import Shipping from './pages/Shipping';
import CreateShipping from './pages/CreateShipping';
import ShippingDetail from './pages/ShippingDetail';
import Returns from './pages/Returns';
import CreateReturn from './pages/CreateReturn';
import ReturnDetail from './pages/ReturnDetail';
import Vehicles from './pages/Vehicles';
import CreateVehicle from './pages/CreateVehicle';
import VehicleDetail from './pages/VehicleDetail';
import Analytics from './pages/analytics/AnalyticsPage';
import Settings from './pages/Settings';

// Workflow Components
import OrderWorkflowTracker from './pages/OrderWorkflowTracker';
import WorkflowManagementOptimized from './pages/WorkflowManagementOptimized';

// Enhanced Chatbot Components
import RoleBasedChatbot from './pages/chatbot/RoleBasedChatbot';
import ChatbotOptimized from './components/chatbot/ChatbotOptimized';

// Lazy-loaded pages
const LazyOrdersComplexOptimized = lazy(() => import('./pages/OrdersComplexOptimized'));
const LazyInventoryDetailOptimized = lazy(() => import('./pages/InventoryDetailOptimized'));
const LazyWorkflowManagementOptimized = lazy(() => import('./pages/WorkflowManagementOptimized'));
const LazyOrderDetailOptimized = lazy(() => import('./pages/OrderDetailOptimized'));
const LazyReceivingDetailOptimized = lazy(() => import('./pages/ReceivingDetailOptimized'));
const LazyPackingDetailOptimized = lazy(() => import('./pages/PackingDetailOptimized'));
const LazyRoleBasedChatbot = lazy(() => import('./pages/chatbot/RoleBasedChatbot'));

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationProvider>
          <AuthProvider>
            <EnhancedChatbotProvider>
              <Notification />
              <Toaster position="top-right" />
              <Suspense fallback={<div>Loading...</div>}>
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
                      <RoleBasedRoute allowedRoles={['Manager']}>
                        <LazyInventoryDetailOptimized />
                      </RoleBasedRoute>
                    } />
                    <Route path="/inventory/add" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                        <InventoryAddForm />
                      </RoleBasedRoute>
                    } />
                    <Route path="/inventory/edit/:id" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                        <InventoryEditForm />
                      </RoleBasedRoute>
                    } />
                    
                    {/* Order routes - Manager, ReceivingClerk, Picker, Packer */}
                    <Route path="/orders" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}>
                        <LazyOrdersComplexOptimized />
                      </RoleBasedRoute>
                    } />
                    <Route path="/orders/create" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                        <OrderCreateForm />
                      </RoleBasedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker', 'Packer']}>
                        <LazyOrderDetailOptimized />
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
                    <Route path="/receiving/create" element={<ReceivingCreateForm />} />
                    <Route path="/receiving/:id" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                        <LazyReceivingDetailOptimized />
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
                    <Route path="/packing/create" element={<PackingCreateForm />} />
                    <Route path="/packing/:id" element={
                      <RoleBasedRoute allowedRoles={['Manager', 'Packer']}>
                        <LazyPackingDetailOptimized />
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
                    <Route path="/vehicles/create" element={<CreateVehicle />} />
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
                        <LazyWorkflowManagementOptimized />
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
                    <Route path="/chatbot/enhanced" element={<LazyRoleBasedChatbot />} />
                    <Route path="/chatbot" element={<ChatbotOptimized />} />
                    
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
              
            </EnhancedChatbotProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
