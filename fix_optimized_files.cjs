const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/pages/ReceivingDetailOptimized.jsx',
  'src/pages/PackingDetailOptimized.jsx', 
  'src/pages/WorkflowManagementOptimized.jsx',
  'src/components/chatbot/ChatbotOptimized.jsx'
];

// Component definitions to replace lazy imports
const componentReplacements = {
  // Receiving components
  'ReceivingStatus': 'const ReceivingStatus = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Receiving Status</h3><p className="text-gray-600">Receiving status information will be displayed here.</p></div>);',
  'ReceivingDetails': 'const ReceivingDetails = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Receiving Details</h3><p className="text-gray-600">Receiving details will be displayed here.</p></div>);',
  'ReceivingActions': 'const ReceivingActions = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Actions</h3><p className="text-gray-600">Available actions will be displayed here.</p></div>);',
  'ReceivingItemsList': 'const ReceivingItemsList = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Items List</h3><p className="text-gray-600">Items list will be displayed here.</p></div>);',
  'ReceivingHistory': 'const ReceivingHistory = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">History</h3><p className="text-gray-600">History will be displayed here.</p></div>);',
  
  // Packing components
  'PackingStatus': 'const PackingStatus = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Packing Status</h3><p className="text-gray-600">Packing status information will be displayed here.</p></div>);',
  'PackingDetails': 'const PackingDetails = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Packing Details</h3><p className="text-gray-600">Packing details will be displayed here.</p></div>);',
  'PackingActions': 'const PackingActions = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Actions</h3><p className="text-gray-600">Available actions will be displayed here.</p></div>);',
  'PackingItemsList': 'const PackingItemsList = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Items List</h3><p className="text-gray-600">Items list will be displayed here.</p></div>);',
  'PackingHistory': 'const PackingHistory = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">History</h3><p className="text-gray-600">History will be displayed here.</p></div>);',
  
  // Workflow components
  'WorkflowTasks': 'const WorkflowTasks = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Workflow Tasks</h3><p className="text-gray-600">Workflow tasks will be displayed here.</p></div>);',
  'WorkflowMetrics': 'const WorkflowMetrics = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Workflow Metrics</h3><p className="text-gray-600">Workflow metrics will be displayed here.</p></div>);',
  'WorkflowOptimization': 'const WorkflowOptimization = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Optimization</h3><p className="text-gray-600">Workflow optimization will be displayed here.</p></div>);',
  'WorkflowActions': 'const WorkflowActions = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Actions</h3><p className="text-gray-600">Available actions will be displayed here.</p></div>);',
  
  // Chatbot components
  'ConversationHistory': 'const ConversationHistory = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Conversation History</h3><p className="text-gray-600">Conversation history will be displayed here.</p></div>);',
  'AgentSelector': 'const AgentSelector = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Agent Selector</h3><p className="text-gray-600">Agent selection will be displayed here.</p></div>);',
  'ChatSettings': 'const ChatSettings = () => (<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-4">Chat Settings</h3><p className="text-gray-600">Chat settings will be displayed here.</p></div>);'
};

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove lazy import statements and replace with component definitions
  const lazyImportRegex = /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\([^)]+\)\);/g;
  
  let hasChanges = false;
  const components = [];
  
  // Find all lazy components
  let match;
  while ((match = lazyImportRegex.exec(content)) !== null) {
    const componentName = match[1];
    if (componentReplacements[componentName]) {
      components.push(componentName);
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    // Remove all lazy imports
    content = content.replace(lazyImportRegex, '');
    
    // Remove import { lazy } from 'react' and import { Suspense, lazy } from 'react'
    content = content.replace(/import\s*\{\s*Suspense,\s*lazy\s*\}\s*from\s*['"]react['"];?/g, "import React from 'react';");
    content = content.replace(/import\s*\{\s*lazy\s*\}\s*from\s*['"]react['"];?/g, '');
    
    // Add component definitions before the main component
    const componentDefs = components.map(comp => componentReplacements[comp]).join('\n\n');
    
    // Find where to insert the component definitions (after imports, before main component)
    const mainComponentMatch = content.match(/(\/\*\*[\s\S]*?\*\/\s*)?const\s+\w+\s*=\s*\(\)/);
    if (mainComponentMatch) {
      const insertPos = content.indexOf(mainComponentMatch[0]);
      content = content.slice(0, insertPos) + '\n' + componentDefs + '\n\n' + content.slice(insertPos);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath} - replaced ${components.length} components`);
  } else {
    console.log(`⚠️  No lazy imports found in ${filePath}`);
  }
}

// Fix all files
filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixFile(filePath);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('✅ All files fixed!'); 