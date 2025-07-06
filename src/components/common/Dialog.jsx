import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DialogContext = createContext();

export const Dialog = ({ children, open, onOpenChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(open || false);
  
  const actualOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || setIsOpen;
  
  return (
    <DialogContext.Provider value={{ isOpen: actualOpen, onOpenChange: handleOpenChange }}>
      {children}
      {actualOpen && <DialogOverlay />}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild = false, ...props }) => {
  const { onOpenChange } = useContext(DialogContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        onOpenChange(true);
        children.props.onClick?.(e);
      }
    });
  }
  
  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className = '', ...props }) => {
  const { isOpen, onOpenChange } = useContext(DialogContext);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onOpenChange]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        ref={contentRef}
        className={`relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-auto ${className}`}
        {...props}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const DialogFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogOverlay = () => {
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity" />
  );
};

export default Dialog; 