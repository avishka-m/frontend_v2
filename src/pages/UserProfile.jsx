import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Card, Button, Form, Input, Divider, Avatar, Row, Col, Typography, Spin } from 'antd';
import { UserOutlined, SaveOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        job_title: user.job_title || '',
        department: user.department || '',
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updateUser(values);
      addNotification({
        type: 'success',
        message: 'Profile Updated',
        description: 'Your profile information has been updated successfully.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Update Failed',
        description: error.message || 'Failed to update profile information. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">User Profile</Title>
      <Row gutter={24}>
        <Col xs={24} md={8} className="mb-6">
          <Card className="text-center">
            <div className="mb-4 flex justify-center">
              <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                src={user.avatar} 
                className="bg-blue-500"
              />
            </div>
            <Title level={4}>{user.username}</Title>
            <Text type="secondary">{user.role || 'User'}</Text>
            <Divider />
            <div className="text-left">
              <p><MailOutlined className="mr-2" /> {user.email}</p>
              <p><PhoneOutlined className="mr-2" /> {user.phone || 'Not provided'}</p>
              <p><IdcardOutlined className="mr-2" /> {user.employee_id || 'Not provided'}</p>
            </div>
            <Divider />
            <Button 
              type="primary" 
              href="/change-password" 
              className="w-full"
            >
              Change Password
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Edit Profile Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input placeholder="Enter your email" type="email" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="job_title"
                    label="Job Title"
                  >
                    <Input placeholder="Enter your job title" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                  >
                    <Input placeholder="Enter your department" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={loading}
                  className="w-full md:w-auto"
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;