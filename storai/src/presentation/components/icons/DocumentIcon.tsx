interface DocumentIconProps {
  className?: string;
}

/**
 * Document icon component for use in the upload UI
 */
export function DocumentIcon({ className = '' }: DocumentIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.5 21a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v18Z" opacity="0.1"></path>
      <path 
        fill="none"
        stroke="currentColor"
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.5"
        d="M19.5 21a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v18Z"
      ></path>
      <path 
        fill="none"
        stroke="currentColor"
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.5"
        d="M9 17h6M9 13h6M9 9h6"
      ></path>
    </svg>
  );
} 