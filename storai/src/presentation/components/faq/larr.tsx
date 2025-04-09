import React from 'react';

interface LeftArrowButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export const LeftArrowButton: React.FC<LeftArrowButtonProps> = ({
  text,
  onClick,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 text-left border-none bg-transparent text-[#19213D] cursor-pointer ${className}`}
    >
      {/* Arrow Badge */}
      {/* Arrow Badge */}
      <div className="w-6 h-6 bg-[#F7F8FA] rounded flex items-center justify-center">
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M9.5 2.5L4.5 7L9.5 11.5"
            stroke="#666F8D"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
    </div>


      {/* Text with precise typography */}
      <span
        className="font-medium"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          lineHeight: '130%',
          letterSpacing: '0',
        }}
      >
        {text}
      </span>
    </button>
  );
};

export default LeftArrowButton;
