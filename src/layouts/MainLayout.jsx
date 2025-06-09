import { useState } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Chatbot from '../components/Chatbot';
import { 
  LAYOUT_DIMENSIONS, 
  COLORS, 
  SHADOWS, 
  SPACING, 
  BORDER_RADIUS, 
  TRANSITIONS 
} from '../utils/styleConstants';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar user={user} collapsed={collapsed} />
      
      <Layout style={{ 
        marginLeft: collapsed ? LAYOUT_DIMENSIONS.sidebarCollapsedWidth : LAYOUT_DIMENSIONS.sidebarWidth, 
        transition: TRANSITIONS.layout 
      }}>
        <Header 
          user={user} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          onLogout={handleLogout} 
        />
        
        <Content
          style={{
            margin: SPACING.pageMargin,
            padding: SPACING.contentPadding,
            minHeight: 280,
            background: COLORS.white,
            borderRadius: BORDER_RADIUS.content,
            boxShadow: SHADOWS.content,
          }}
        >
          {children}
          <Chatbot />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 