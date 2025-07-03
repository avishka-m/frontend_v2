/**
 * Application Constants
 */

// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8002/api/v1';

// Agent Role Configurations
export const AGENT_ROLES = {
  CLERK: 'clerk',
  PICKER: 'picker', 
  PACKER: 'packer',
  DRIVER: 'driver',
  MANAGER: 'manager'
};

export const ROLE_COLORS = {
  [AGENT_ROLES.CLERK]: 'blue',
  [AGENT_ROLES.PICKER]: 'orange',
  [AGENT_ROLES.PACKER]: 'green', 
  [AGENT_ROLES.DRIVER]: 'purple',
  [AGENT_ROLES.MANAGER]: 'red'
};

export const ROLE_DESCRIPTIONS = {
  [AGENT_ROLES.CLERK]: 'General warehouse operations and inventory queries',
  [AGENT_ROLES.PICKER]: 'Order picking and inventory location assistance',
  [AGENT_ROLES.PACKER]: 'Packaging guidelines and shipping preparation',
  [AGENT_ROLES.DRIVER]: 'Delivery routes and vehicle management',
  [AGENT_ROLES.MANAGER]: 'Analytics, reports, and high-level operations'
};

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system'
};

// Conversation Status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  SELECTED_ROLE: 'selectedRole'
};

export default {
  API_BASE_URL,
  AGENT_ROLES,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
  MESSAGE_TYPES,
  CONVERSATION_STATUS,
  STORAGE_KEYS
};
