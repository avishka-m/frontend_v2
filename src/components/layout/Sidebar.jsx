import { Layout, Menu } from 'antd';
import { useLocation } from 'react-router-dom';
import { ROLE_NAVIGATION } from '../../constants/navigation.jsx';
import { LAYOUT_DIMENSIONS, COLORS, SHADOWS, SPACING } from '../../utils/styleConstants';
import UserInfo from './UserInfo';

const { Sider } = Layout;

const Sidebar = ({ user, collapsed }) => {
  const location = useLocation();

  // Get menu items based on user role
  const getMenuItems = () => {
    const userRole = user?.role;
    if (userRole && ROLE_NAVIGATION[userRole]) {
      return ROLE_NAVIGATION[userRole];
    }
    // Return empty menu for users without proper role
    return [];
  };

  // Get the active menu key based on current location
  const getActiveMenuKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    const key = path.split('/')[1];
    return [key];
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      theme="light"
      width={LAYOUT_DIMENSIONS.sidebarWidth}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        boxShadow: SHADOWS.sidebar,
      }}
    >
      {/* Logo Section */}
      <div style={{ 
        height: LAYOUT_DIMENSIONS.logoHeight, 
        margin: SPACING.sidebarPadding, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: `1px solid ${COLORS.borderLight}`,
        paddingBottom: SPACING.sidebarPadding,
      }}>
        <h2 style={{ margin: 0, color: COLORS.primary, fontSize: collapsed ? 20 : 24 }}>
          {collapsed ? 'WMS' : 'Warehouse MS'}
        </h2>
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={getActiveMenuKey()}
        items={getMenuItems()}
        style={{ borderRight: 0 }}
      />

      {/* User Info Section */}
      <UserInfo user={user} collapsed={collapsed} />
    </Sider>
  );
};

export default Sidebar; 