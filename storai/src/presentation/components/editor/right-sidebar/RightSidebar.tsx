import React, { RefObject } from 'react';
import StorAI_Logo from '../../../../assets/logo.png';
import UploadsSection from './components/UploadsSection';
import TemplatesSection from './components/TemplatesSection';
import ArrowButton from '../../common/ArrowButton';

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
    <div className="w-[372px] bg-white flex flex-col ml-3 mr-3 shadow-lg mt-3 mb-3 border border-gray-100 rounded-[10px]">
      
        {/* StorAI Section */}
        <div className="p-4 flex items-center">
            <img src={StorAI_Logo} alt="StorAI Logo" className="h-[56px] w-[60px]" />
            
            <div>
            <div className="font-medium text-gray-800">StorAI</div>
            <div className="text-xs text-gray-500">some kind of description here related to our framework</div>
            </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
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
        </div>
        {/* Links */}

        <div className="p-8 space-y-6">
          <ArrowButton
            text="FAQ"
          />
            
          <ArrowButton
            text="HIPAA Compliance"
          />
        </div>
    </div>
  );
};

export default React.memo(RightSidebar);