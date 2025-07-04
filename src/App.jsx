import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider } from './context/ChatbotContext';
import NotificationProvider from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import Notification from './components/common/Notification';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
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
import Workers from './pages/Workers';
import Locations from './pages/Locations';
import Receiving from './pages/Receiving';
import Picking from './pages/Picking';
import Packing from './pages/Packing';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Vehicles from './pages/Vehicles';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationProvider>
          <AuthProvider>
            <ChatbotProvider>
              <Notification />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes - within layout */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  {/* Dashboard - redirect to inventory for now */}
                  <Route path="/dashboard" element={<Navigate to="/inventory" replace />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Inventory routes - Manager, ReceivingClerk, Picker */}
                  <Route path="/inventory" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk', 'Picker']}>
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
                  
                  {/* Workers routes - Manager only */}
                  <Route path="/workers" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Workers />
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
                  
                  {/* Shipping routes - Manager, Driver */}
                  <Route path="/shipping" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <Shipping />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Returns routes - Manager, ReceivingClerk */}
                  <Route path="/returns" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'ReceivingClerk']}>
                      <Returns />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Vehicles routes - Manager, Driver */}
                  <Route path="/vehicles" element={
                    <RoleBasedRoute allowedRoles={['Manager', 'Driver']}>
                      <Vehicles />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Analytics routes - Manager only */}
                  <Route path="/analytics" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Analytics />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Settings routes - Manager only */}
                  <Route path="/settings" element={
                    <RoleBasedRoute allowedRoles={['Manager']}>
                      <Settings />
                    </RoleBasedRoute>
                  } />
                  
                  {/* User routes - accessible to all authenticated users */}
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  
                  {/* Default redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </ChatbotProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
