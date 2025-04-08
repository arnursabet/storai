export const FileIcon = () => (
    <svg className="mr-2" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="5.33333" fill="#F6FAFF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M22.4005 13.8513C22.4005 13.5576 22.2838 13.276 22.0762 13.0684L17.3321 8.32429C17.1245 8.11665 16.8429 8 16.5492 8H10.431C9.97237 8 9.60059 8.37178 9.60059 8.8304V23.1696C9.60059 23.6282 9.97237 24 10.431 24H21.5701C22.0287 24 22.4005 23.6282 22.4005 23.1696V13.8513ZM16.3911 9.48797C16.3563 9.4531 16.2966 9.4778 16.2966 9.52712V13.9355C16.2966 14.0578 16.3958 14.1569 16.5181 14.1569H20.9265C20.9758 14.1569 21.0005 14.0973 20.9656 14.0624L16.3911 9.48797Z" fill="#2388FF"/>
    </svg>
  );
  
  export const OptionsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.0005 2.06057C6.81337 2.06057 6.6339 1.98623 6.50158 1.85391C6.36926 1.72159 6.29492 1.54212 6.29492 1.35499C6.29492 1.16786 6.36926 0.988394 6.50158 0.856073C6.6339 0.723751 6.81337 0.649414 7.0005 0.649414" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.00098 2.06057C7.18811 2.06057 7.36757 1.98623 7.49989 1.85391C7.63222 1.72159 7.70655 1.54212 7.70655 1.35499C7.70655 1.16786 7.63222 0.988394 7.49989 0.856073C7.36757 0.723751 7.18811 0.649414 7.00098 0.649414" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.0005 13.3496C6.81337 13.3496 6.6339 13.2753 6.50158 13.143C6.36926 13.0106 6.29492 12.8312 6.29492 12.6441C6.29492 12.4569 6.36926 12.2775 6.50158 12.1451C6.6339 12.0128 6.81337 11.9385 7.0005 11.9385" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.00098 13.3496C7.18811 13.3496 7.36757 13.2753 7.49989 13.143C7.63222 13.0106 7.70655 12.8312 7.70655 12.6441C7.70655 12.4569 7.63222 12.2775 7.49989 12.1451C7.36757 12.0128 7.18811 11.9385 7.00098 11.9385" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.0005 7.7051C6.81337 7.7051 6.6339 7.63076 6.50158 7.49844C6.36926 7.36612 6.29492 7.18665 6.29492 6.99952C6.29492 6.81239 6.36926 6.63293 6.50158 6.5006C6.6339 6.36828 6.81337 6.29395 7.0005 6.29395" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.00098 7.7051C7.18811 7.7051 7.36757 7.63076 7.49989 7.49844C7.63222 7.36612 7.70655 7.18665 7.70655 6.99952C7.70655 6.81239 7.63222 6.63293 7.49989 6.5006C7.36757 6.36828 7.18811 6.29395 7.00098 6.29395" stroke="#666F8D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  export const AddIcon = () => (
    <svg className="h-4 w-4 mr-1" width="12" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 1.5V10.5M11 6H2" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  export const ArrowIcon = ({ expanded }: { expanded: boolean }) => (
    <svg 
      className={`transition-transform ${expanded ? 'transform rotate-[-90deg]' : ''}`}
      width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.03786 15.5L12.9609 10L7.03786 4.5" 
        stroke={expanded ? 'var(--color-storai-blue)' : 'var(--color-storai-gray)'} 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeLinejoin="round"/>
    </svg>
  );

  interface ProgressBarProps {
    progress: number;
  }
  
  export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-storai-jade transition-all duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );