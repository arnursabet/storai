import React from 'react';

interface ArrowButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({ 
  text, 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between text-left border-none bg-transparent text-storai-teal py-2 shadow-[0_1px_0_rgba(0,0,0,0.05)] cursor-pointer transition-colors hover:text-storai-turquoise ${className}`}
    >
      <span className="text-[0.875rem] font-medium">{text}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-gray-400 transform rotate-[-45deg]"
      >
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </button>
  );
};

export default ArrowButton; 