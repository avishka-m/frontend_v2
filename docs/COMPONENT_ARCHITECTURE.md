# 🏗️ Component Architecture - React + Ant Design Structure

## 📐 Architecture Overview

Our frontend follows a **modular, scalable architecture** that combines React 19.1.0's latest features with Ant Design's enterprise components, organized around role-based access and AI-first interactions.

## 🗂️ Project Structure

```
frontend_v2/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   ├── charts/          # Visualization components
│   │   ├── ai/              # AI-specific components
│   │   └── role-specific/   # Role-based components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── inventory/       # Inventory management
│   │   ├── orders/          # Order management
│   │   ├── workers/         # Worker management
│   │   ├── analytics/       # Analytics pages
│   │   └── ai/              # AI assistant pages
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication logic
│   │   ├── useAPI.js        # API integration
│   │   ├── useRealtime.js   # WebSocket integration
│   │   └── useAI.js         # AI assistant hooks
│   ├── services/            # API and external services
│   │   ├── api/             # Backend API clients
│   │   ├── auth/            # Authentication service
│   │   ├── websocket/       # Real-time communication
│   │   └── ai/              # AI service integration
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.js   # Authentication state
│   │   ├── ThemeContext.js  # Theme management
│   │   ├── RoleContext.js   # Role-based access
│   │   └── AIContext.js     # AI assistant state
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # App constants
│   │   ├── helpers.js       # Helper functions
│   │   ├── validators.js    # Form validation
│   │   └── formatters.js    # Data formatters
│   ├── assets/              # Static assets
│   │   ├── images/          # Images and icons
│   │   ├── styles/          # Global styles
│   │   └── fonts/           # Custom fonts
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── docs/                    # Documentation
├── package.json
└── vite.config.js
```

## 🧱 Component Hierarchy

### 1. **App Level Components**

#### App.jsx - Root Application
```jsx
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { AIProvider } from './contexts/AIContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './components/routing/AppRouter';
import GlobalNotifications from './components/common/GlobalNotifications';
import AIAssistantGlobal from './components/ai/AIAssistantGlobal';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <RoleProvider>
            <AIProvider>
              <ThemeProvider>
                <AppRouter />
                <GlobalNotifications />
                <AIAssistantGlobal />
              </ThemeProvider>
            </AIProvider>
          </RoleProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
```

### 2. **Layout Components**

#### MainLayout.jsx - Application Layout
```jsx
import { Layout } from 'antd';
import HeaderBar from './HeaderBar';
import SideNavigation from './SideNavigation';
import ContentArea from './ContentArea';
import FooterBar from './FooterBar';

const { Header, Sider, Content, Footer } = Layout;

function MainLayout({ children }) {
  const { userRole, collapsed, toggleCollapsed } = useContext(RoleContext);
  
  return (
    <Layout className="main-layout">
      <Header className="header-bar">
        <HeaderBar onMenuToggle={toggleCollapsed} />
      </Header>
      
      <Layout>
        <Sider 
          collapsed={collapsed}
          theme="light"
          width={240}
          collapsedWidth={80}
        >
          <SideNavigation role={userRole} />
        </Sider>
        
        <Content className="content-area">
          <ContentArea>
            {children}
          </ContentArea>
        </Content>
      </Layout>
      
      <Footer className="footer-bar">
        <FooterBar />
      </Footer>
    </Layout>
  );
}
```

#### RoleBasedLayout.jsx - Role-Specific Layouts
```jsx
import ManagerLayout from './roles/ManagerLayout';
import ClerkLayout from './roles/ClerkLayout';
import PickerLayout from './roles/PickerLayout';
import PackerLayout from './roles/PackerLayout';
import DriverLayout from './roles/DriverLayout';

function RoleBasedLayout({ children }) {
  const { userRole } = useAuth();
  
  const LayoutComponent = {
    'Manager': ManagerLayout,
    'ReceivingClerk': ClerkLayout,
    'Picker': PickerLayout,
    'Packer': PackerLayout,
    'Driver': DriverLayout
  }[userRole] || MainLayout;
  
  return (
    <LayoutComponent>
      {children}
    </LayoutComponent>
  );
}
```

### 3. **Navigation Components**

#### SideNavigation.jsx - Role-Based Menu
```jsx
import { Menu } from 'antd';
import { 
  DashboardOutlined, 
  InboxOutlined, 
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  RobotOutlined
} from '@ant-design/icons';

function SideNavigation({ role }) {
  const menuItems = useRoleBasedMenu(role);
  
  return (
    <Menu
      mode="inline"
      theme="light"
      defaultSelectedKeys={['dashboard']}
      items={menuItems}
      className="side-navigation"
    />
  );
}

// Custom hook for role-based menu items
function useRoleBasedMenu(role) {
  return useMemo(() => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        path: '/dashboard'
      }
    ];
    
    const roleSpecificItems = {
      'Manager': [
        { key: 'inventory', icon: <InboxOutlined />, label: 'Inventory', path: '/inventory' },
        { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Orders', path: '/orders' },
        { key: 'workers', icon: <TeamOutlined />, label: 'Workers', path: '/workers' },
        { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', path: '/analytics' },
        { key: 'ai-assistant', icon: <RobotOutlined />, label: 'AI Assistant', path: '/ai' }
      ],
      'ReceivingClerk': [
        { key: 'inventory', icon: <InboxOutlined />, label: 'Inventory', path: '/inventory' },
        { key: 'receiving', icon: <InboxOutlined />, label: 'Receiving', path: '/receiving' },
        { key: 'returns', icon: <RollbackOutlined />, label: 'Returns', path: '/returns' }
      ],
      // ... other roles
    };
    
    return [...baseItems, ...(roleSpecificItems[role] || [])];
  }, [role]);
}
```

### 4. **Data Display Components**

#### SmartTable.jsx - Enhanced Data Table
```jsx
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function SmartTable({ 
  dataSource, 
  columns, 
  loading, 
  onSearch, 
  aiSuggestions = false,
  ...props 
}) {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  
  // Enhanced columns with search functionality
  const enhancedColumns = columns.map(col => ({
    ...col,
    ...getColumnSearchProps(col.dataIndex, col.title)
  }));
  
  return (
    <div className="smart-table">
      {aiSuggestions && (
        <AITableSuggestions 
          data={dataSource}
          onSuggestionApply={handleSuggestionApply}
        />
      )}
      
      <Table
        columns={enhancedColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`
        }}
        scroll={{ x: 'max-content' }}
        {...props}
      />
    </div>
  );
}
```

#### MetricsCard.jsx - KPI Display Component
```jsx
import { Card, Statistic, Trend } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

function MetricsCard({ 
  title, 
  value, 
  trend, 
  icon, 
  color = 'blue',
  loading = false,
  alert = false
}) {
  const trendIcon = trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = trend > 0 ? '#52c41a' : '#ff4d4f';
  
  return (
    <Card 
      className={`metrics-card ${alert ? 'alert' : ''}`}
      loading={loading}
      hoverable
    >
      <Statistic
        title={title}
        value={value}
        precision={0}
        valueStyle={{ color: `var(--${color})` }}
        prefix={icon}
        suffix={
          trend && (
            <span style={{ color: trendColor, fontSize: '14px' }}>
              {trendIcon} {Math.abs(trend)}%
            </span>
          )
        }
      />
    </Card>
  );
}
```

### 5. **Form Components**

#### SmartForm.jsx - AI-Assisted Forms
```jsx
import { Form, Input, Select, Button, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

function SmartForm({ 
  form, 
  onFinish, 
  aiAssisted = false,
  autoSave = false,
  children 
}) {
  const [aiSuggestions, setAISuggestions] = useState([]);
  
  return (
    <div className="smart-form">
      {aiAssisted && (
        <AISuggestionPanel 
          suggestions={aiSuggestions}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
      
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
        onValuesChange={autoSave ? handleAutoSave : undefined}
      >
        {children}
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            {aiAssisted && (
              <Button 
                icon={<RobotOutlined />}
                onClick={getAISuggestions}
              >
                Get AI Suggestions
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
```

### 6. **AI Integration Components**

#### AIAssistant.jsx - Floating AI Helper
```jsx
import { FloatButton, Drawer, Avatar, Button } from 'antd';
import { RobotOutlined, MessageOutlined } from '@ant-design/icons';
import AgenticChatInterface from './AgenticChatInterface';

function AIAssistant() {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const { currentAgent, userRole } = useAI();
  
  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setVisible(true)}
        badge={{ 
          count: unreadMessages,
          color: '#52c41a'
        }}
      />
      
      <Drawer
        title={
          <Space>
            <Avatar icon={<RobotOutlined />} />
            {currentAgent.name} Assistant
          </Space>
        }
        placement="right"
        width={400}
        open={visible}
        onClose={() => setVisible(false)}
        className="ai-assistant-drawer"
      >
        <AgenticChatInterface
          agent={currentAgent}
          userRole={userRole}
          onMinimize={() => setMinimized(true)}
        />
      </Drawer>
    </>
  );
}
```

#### AgenticChatInterface.jsx - AI Chat Component
```jsx
import { List, Input, Button, Space, Tag } from 'antd';
import { SendOutlined, MicrophoneOutlined } from '@ant-design/icons';
import MessageBubble from './MessageBubble';
import AICapabilities from './AICapabilities';

function AgenticChatInterface({ agent, userRole, onMinimize }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="agentic-chat-interface">
      <AICapabilities 
        agent={agent}
        capabilities={agent.capabilities}
      />
      
      <div className="chat-messages">
        <List
          dataSource={messages}
          renderItem={(message) => (
            <MessageBubble 
              message={message}
              agent={agent}
            />
          )}
        />
      </div>
      
      <div className="chat-input">
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder={`Ask ${agent.name} for help...`}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
          />
          <Button
            icon={<MicrophoneOutlined />}
            onClick={handleVoiceInput}
          />
        </Space.Compact>
      </div>
    </div>
  );
}
```

### 7. **Page Components**

#### DashboardPage.jsx - Role-Based Dashboard
```jsx
import { Row, Col, Spin } from 'antd';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import AIInsights from '../components/ai/AIInsights';

function DashboardPage() {
  const { userRole } = useAuth();
  const { dashboardData, loading } = useDashboardData(userRole);
  
  if (loading) return <Spin size="large" />;
  
  return (
    <div className="dashboard-page">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <MetricsOverview 
            metrics={dashboardData.metrics}
            role={userRole}
          />
        </Col>
        
        <Col lg={16} md={24}>
          <RecentActivity 
            activities={dashboardData.activities}
            role={userRole}
          />
        </Col>
        
        <Col lg={8} md={24}>
          <QuickActions role={userRole} />
          <AIInsights 
            insights={dashboardData.aiInsights}
            role={userRole}
          />
        </Col>
      </Row>
    </div>
  );
}
```

## 🔗 State Management Strategy

### 1. **Context Providers**

#### AuthContext.jsx - Authentication State
```jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2. **Custom Hooks**

#### useAPI.js - API Integration Hook
```jsx
export function useAPI(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get(endpoint, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers
        }
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, token, options]);
  
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [fetchData, token]);
  
  return { data, loading, error, refetch: fetchData };
}
```

## 🎨 Styling Strategy

### 1. **CSS Modules + Ant Design Customization**
```css
/* Global theme variables */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #fa8c16;
  --error-color: #ff4d4f;
  --text-color: #262626;
  --bg-color: #fafafa;
}

/* Component-specific styles */
.smart-table {
  .ant-table-thead > tr > th {
    background-color: var(--bg-color);
    font-weight: 600;
  }
  
  .ai-suggestion-highlight {
    background-color: #fff2e8;
    border-left: 3px solid var(--warning-color);
  }
}
```

### 2. **Responsive Design with Ant Design Grid**
```jsx
const responsiveProps = {
  xs: { span: 24 },
  sm: { span: 12 },
  md: { span: 8 },
  lg: { span: 6 },
  xl: { span: 4 }
};

<Row gutter={[16, 16]}>
  <Col {...responsiveProps}>
    <MetricsCard />
  </Col>
</Row>
```

## 🔄 Real-time Integration

### WebSocket Hook
```jsx
export function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data));
    };
    
    setSocket(ws);
    
    return () => ws.close();
  }, [url]);
  
  const sendMessage = useCallback((message) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);
  
  return { lastMessage, sendMessage };
}
```

---

*This component architecture provides a scalable, maintainable foundation for building the revolutionary WMS frontend with seamless AI integration and role-based customization.*
