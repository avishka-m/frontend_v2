import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { COLORS, SPACING } from '../../utils/styleConstants';

const UserInfo = ({ user, collapsed }) => {
  if (collapsed || !user) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      width: '100%',
      borderTop: `1px solid ${COLORS.borderLight}`,
      padding: SPACING.sidebarPadding,
      background: COLORS.white,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          style={{ backgroundColor: COLORS.primary }} 
          icon={<UserOutlined />}
          size="small"
        >
          {user.username?.charAt(0).toUpperCase()}
        </Avatar>
        <div style={{ marginLeft: 12 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>
            {user.username || 'User'}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' }}>
            {user.role || 'User'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo; 