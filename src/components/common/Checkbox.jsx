import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({ 
  checked = false, 
  onCheckedChange, 
  className = '', 
  id,
  ...props 
}) => {
  const handleChange = (e) => {
    onCheckedChange?.(e.target.checked);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <div
        className={`h-4 w-4 rounded border border-gray-300 flex items-center justify-center cursor-pointer transition-colors ${
          checked 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white hover:border-gray-400'
        } ${className}`}
        onClick={() => onCheckedChange?.(!checked)}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
};

export default Checkbox; 