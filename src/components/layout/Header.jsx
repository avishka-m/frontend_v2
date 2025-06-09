import { Layout, Button, Dropdown, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { LAYOUT_DIMENSIONS, COLORS, SHADOWS, SPACING } from '../../utils/styleConstants';

const { Header: AntHeader } = Layout;

const Header = ({ user, collapsed, setCollapsed, onLogout }) => {
  const navigate = useNavigate();

  // User dropdown menu items
  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader style={{ 
      padding: 0, 
      background: COLORS.white,
      boxShadow: SHADOWS.header,
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingInline: SPACING.pageMargin 
      }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ 
            fontSize: '16px', 
            width: LAYOUT_DIMENSIONS.headerHeight, 
            height: LAYOUT_DIMENSIONS.headerHeight 
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: COLORS.textSecondary }}>
            Welcome, <strong>{user?.username || 'User'}</strong>
          </span>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
          >
            <Avatar 
              style={{ backgroundColor: COLORS.primary, cursor: 'pointer' }} 
              icon={<UserOutlined />}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header; 