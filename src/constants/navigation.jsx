import {
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  BarChartOutlined,
  ShopOutlined,
  CheckSquareOutlined,
  GiftOutlined,
  RollbackOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

// Role-based navigation configuration
export const ROLE_NAVIGATION = {
  Manager: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: <Link to="/inventory">Inventory</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
    {
      key: 'customers',
      icon: <ShopOutlined />,
      label: <Link to="/customers">Customers</Link>,
    },
    {
      key: 'workers',
      icon: <TeamOutlined />,
      label: <Link to="/workers">Workers</Link>,
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: <Link to="/locations">Locations</Link>,
    },
    {
      key: 'receiving',
      icon: <ImportOutlined />,
      label: <Link to="/receiving">Receiving</Link>,
    },
    {
      key: 'picking',
      icon: <CheckSquareOutlined />,
      label: <Link to="/picking">Picking</Link>,
    },
    {
      key: 'packing',
      icon: <GiftOutlined />,
      label: <Link to="/packing">Packing</Link>,
    },
    {
      key: 'shipping',
      icon: <ExportOutlined />,
      label: <Link to="/shipping">Shipping</Link>,
    },
    {
      key: 'returns',
      icon: <RollbackOutlined />,
      label: <Link to="/returns">Returns</Link>,
    },
    {
      key: 'vehicles',
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Vehicles</Link>,
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
    },
    {
      key: 'seasonal-inventory',
      icon: <LineChartOutlined />,
      label: <Link to="/seasonal-inventory">AI Forecasting</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
  ],
  ReceivingClerk: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: <Link to="/inventory">Inventory</Link>,
    },
    {
      key: 'receiving',
      icon: <ImportOutlined />,
      label: <Link to="/receiving">Receiving</Link>,
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: <Link to="/locations">Locations</Link>,
    },
    {
      key: 'returns',
      icon: <RollbackOutlined />,
      label: <Link to="/returns">Returns</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">View Orders</Link>,
    },
  ],
  Picker: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: <Link to="/inventory">Inventory</Link>,
    },
    {
      key: 'picking',
      icon: <CheckSquareOutlined />,
      label: <Link to="/picking">Picking Tasks</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: <Link to="/locations">Locations</Link>,
    },
  ],
  Packer: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'packing',
      icon: <GiftOutlined />,
      label: <Link to="/packing">Packing Tasks</Link>,
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Orders</Link>,
    },
  ],
  Driver: [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: 'shipping',
      icon: <ExportOutlined />,
      label: <Link to="/shipping">Shipping</Link>,
    },
    {
      key: 'vehicles',
      icon: <CarOutlined />,
      label: <Link to="/vehicles">Vehicles</Link>,
    },
  ],
}; 