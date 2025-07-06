import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const DropdownContext = createContext();

export const DropdownMenu = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" {...props}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild = false, ...props }) => {
  const { setIsOpen } = useContext(DropdownContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        setIsOpen(prev => !prev);
        children.props.onClick?.(e);
      }
    });
  }
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(prev => !prev)}
      {...props}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={contentRef}
      className={`absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
      {...props}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = '', ...props }) => {
  const { setIsOpen } = useContext(DropdownContext);
  
  const handleClick = (e) => {
    onClick?.(e);
    setIsOpen(false);
  };
  
  return (
    <button
      type="button"
      className={`group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default DropdownMenu; 