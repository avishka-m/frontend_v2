/**
 * Role Selector Component
 * Allows users to select which AI agent role to chat with
 */

import React from 'react';
import { Select, Typography, Space, Tag } from 'antd';
import { User, HardHat, Package, Truck, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const { Text } = Typography;
const { Option } = Select;

const ROLE_ICONS = {
  clerk: <User size={16} />,
  picker: <HardHat size={16} />,
  packer: <Package size={16} />,
  driver: <Truck size={16} />,
  manager: <Crown size={16} />,
};

const ROLE_DESCRIPTIONS = {
  clerk: 'General warehouse operations and inventory queries',
  picker: 'Order picking and inventory location assistance',
  packer: 'Packaging guidelines and shipping preparation',
  driver: 'Delivery routes and vehicle management',
  manager: 'Analytics, reports, and high-level operations',
};

const ROLE_COLORS = {
  clerk: 'blue',
  picker: 'orange',
  packer: 'green',
  driver: 'purple',
  manager: 'red',
};

const RoleSelector = ({ style = {} }) => {
  const { userRoles } = useAuth();
  const { selectedRole, setSelectedRole } = useChat();

  if (!userRoles || !userRoles.allowed) {
    return null;
  }

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
  };

  return (
    <div style={{ ...style }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text strong>Select AI Assistant Role:</Text>
        
        <Select
          value={selectedRole}
          onChange={handleRoleChange}
          style={{ width: '100%' }}
          size="large"
          placeholder="Choose an AI agent..."
        >
          {userRoles.allowed.map(role => (
            <Option key={role} value={role}>
              <Space>
                {ROLE_ICONS[role]}
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                  {role}
                </span>
                <Tag color={ROLE_COLORS[role]} size="small">
                  {role === userRoles.current ? 'Your Role' : 'Available'}
                </Tag>
              </Space>
            </Option>
          ))}
        </Select>

        {selectedRole && (
          <div style={{ 
            padding: '12px', 
            background: '#f6f8fa', 
            borderRadius: '6px',
            border: '1px solid #e1e4e8'
          }}>
            <Space>
              {ROLE_ICONS[selectedRole]}
              <Text strong style={{ textTransform: 'capitalize' }}>
                {selectedRole} Assistant
              </Text>
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {ROLE_DESCRIPTIONS[selectedRole]}
            </Text>
          </div>
        )}
      </Space>
    </div>
  );
};

export default RoleSelector;
