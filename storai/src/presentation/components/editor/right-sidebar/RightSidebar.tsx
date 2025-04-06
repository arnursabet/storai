import React, { RefObject } from 'react';
import StorAI_Logo from '../../../../assets/logo.png';
import UploadsSection from './components/UploadsSection';
import TemplatesSection from './components/TemplatesSection';

interface RightSidebarProps {
  // Toggle UI states
  uploadsExpanded: boolean;
  templateExpanded: boolean;
  toggleUploads: () => void;
  toggleTemplates: () => void;
  
  // Files and uploads
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  directUploading: boolean;
  directUploadProgress: { [key: string]: number };
  directUploadError: string | null;
  uploadedFiles: any[]; // Using 'any' for now, replace with proper type
}


const RightSidebar: React.FC<RightSidebarProps> = ({
  uploadsExpanded,
  templateExpanded,
  toggleUploads,
  toggleTemplates,
  fileInputRef,
  handleFileInputChange,
  directUploading,
  directUploadProgress,
  directUploadError,
  uploadedFiles,
}) => {
  return (
    <div className="w-64 bg-white flex flex-col ml-6 shadow-lg mt-3 mb-3 border border-gray-100 rounded-[10px]">
      
        {/* StorAI Section */}
        <div className="p-4 flex items-center">
            <img src={StorAI_Logo} alt="StorAI Logo" className="h-[56px] w-[60px]" />
            
            <div>
            <div className="font-medium text-gray-800">StorAI</div>
            <div className="text-xs text-gray-500">some kind of description here related to our framework</div>
            </div>
        </div>

        {/* Uploads Section */}
        <UploadsSection 
            uploadsExpanded={uploadsExpanded}
            toggleUploads={toggleUploads}
            fileInputRef={fileInputRef}
            handleFileInputChange={handleFileInputChange}
            directUploading={directUploading}
            directUploadProgress={directUploadProgress}
            directUploadError={directUploadError}
            uploadedFiles={uploadedFiles}
        />
    

        {/* Template Section */}
        <TemplatesSection
            templateExpanded={templateExpanded}
            toggleTemplates={toggleTemplates}
        />

        {/* Links */}
        <div className="p-4 space-y-4">
            <a href="#" className="flex items-center justify-between text-storai-teal font-medium">
                <span>FAQ</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
            </a>
            
            <a href="#" className="flex items-center justify-between text-storai-teal font-medium">
                <span>HIPAA Compliance</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
        </div>
    </div>
  );
};

export default React.memo(RightSidebar);