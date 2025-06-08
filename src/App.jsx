import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // If still checking authentication, show nothing
  if (loading) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, show the requested page
  return children;
};

function App() {
  return (
    <StyleProvider hashPriority="high">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          }
        }}
      >
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Add more routes here for different pages */}
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Inventory Management</h1>
                      <p>Inventory page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Order Management</h1>
                      <p>Orders page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Customer Management</h1>
                      <p>Customers page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/workers" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Worker Management</h1>
                      <p>Workers page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/locations" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Location Management</h1>
                      <p>Locations page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/vehicles" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Vehicle Management</h1>
                      <p>Vehicles page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/receiving" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Receiving Management</h1>
                      <p>Receiving page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/picking" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Picking Management</h1>
                      <p>Picking page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/packing" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Packing Management</h1>
                      <p>Packing page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/shipping" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Shipping Management</h1>
                      <p>Shipping page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/returns" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Returns Management</h1>
                      <p>Returns page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <h1>Analytics</h1>
                      <p>Analytics page content will go here</p>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all other routes and redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ConfigProvider>
    </StyleProvider>
  );
}

export default App;
