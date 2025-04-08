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
      <span className="font-bold">{text}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.78241 2.52898L9.60588 2.39355L9.47045 8.21702M9.38803 2.51616L2.3457 9.55849" stroke="#666F8D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

    </button>
  );
};

export default ArrowButton; 