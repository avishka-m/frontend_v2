import React from 'react';
import { 
  Bot, 
  User, 
  Sparkles, 
  CheckCircle,
  Crown
} from 'lucide-react';
import { Badge } from '../common/Badge';

const AssistantSelectionPanel = ({
  agents,
  selectedAgent,
  onSelectAgent
}) => {
  
  // Get gradient class for agent
  const getGradientClass = (color) => {
    return `bg-gradient-to-r ${color}`;
  };

  // Get agent capabilities description
  const getAgentCapabilities = (agentId) => {
    const capabilities = {
      'general': [
        'General warehouse inquiries',
        'System navigation help',
        'Basic information lookup'
      ],
      'clerk': [
        'Receiving operations',
        'Inventory management',
        'Quality control guidance'
      ],
      'picker': [
        'Order picking assistance',
        'Location navigation',
        'Picking optimization'
      ],
      'packer': [
        'Packing procedures',
        'Shipping requirements',
        'Quality checks'
      ],
      'driver': [
        'Route optimization',
        'Delivery planning',
        'Vehicle management'
      ]
    };
    return capabilities[agentId] || capabilities['general'];
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Crown className="h-4 w-4 text-purple-600" />
        <h4 className="text-sm font-semibold text-gray-900">Select AI Assistant</h4>
        <Badge variant="secondary" className="text-xs">Manager</Badge>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => {
          const AgentIcon = agent.icon;
          const isSelected = selectedAgent === agent.id;
          const capabilities = getAgentCapabilities(agent.id);
          
          return (
            <div
              key={agent.id}
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectAgent(agent.id)}
            >
              {/* Agent Header */}
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 rounded-full ${getGradientClass(agent.color)} flex items-center justify-center shadow-sm`}>
                  <AgentIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className={`text-sm font-medium ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {agent.name}
                  </h5>
                  <p className={`text-xs ${
                    isSelected ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    Specialized AI assistant
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                )}
              </div>

              {/* Agent Capabilities */}
              <div className="ml-11">
                <ul className="space-y-1">
                  {capabilities.slice(0, 2).map((capability, index) => (
                    <li 
                      key={index}
                      className={`text-xs flex items-center ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      <div className={`w-1 h-1 rounded-full mr-2 ${
                        isSelected ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      {capability}
                    </li>
                  ))}
                  {capabilities.length > 2 && (
                    <li className={`text-xs ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      +{capabilities.length - 2} more capabilities
                    </li>
                  )}
                </ul>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          <Sparkles className="h-3 w-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-900">Manager Features</span>
        </div>
        <p className="text-xs text-purple-700">
          Switch between specialized assistants to get expert help for different warehouse operations.
        </p>
      </div>
    </div>
  );
};

export default AssistantSelectionPanel; 