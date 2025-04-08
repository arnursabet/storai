import React, { RefObject, useMemo } from 'react';
import { formatFileSize } from '../../utils/textFormatting';
import { FileIcon, OptionsIcon } from '../../../common';

interface FileItemProps {
  file: any; // Replace with proper type if available
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
  return (
    <div className="px-3 py-1 mb-3 flex items-center justify-between bg-white border border-gray-200 rounded-[8px]">
      <div className="flex items-center">
        <FileIcon />
        <div className="w-full flex flex-row items-center justify-between">
          <div className="text-sm text-gray-700 truncate max-w-[150px]" title={file.name}>
            {file.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500 lowercase">
          {formatFileSize(file.size)}
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600"
          aria-label={`Options for ${file.name}`}
          title={`Options for ${file.name}`}
        >
          <OptionsIcon />
        </button>
      </div>
    </div>
  );
};

interface UploadsSectionProps {
  uploadsExpanded: boolean;
  toggleUploads: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  directUploading: boolean;
  directUploadProgress: { [key: string]: number };
  directUploadError: string | null;
  uploadedFiles: any[]; // Replace with proper type if available
}

const UploadsSection: React.FC<UploadsSectionProps> = ({
  uploadsExpanded,
  toggleUploads,
  fileInputRef,
  handleFileInputChange,
  directUploading,
  directUploadProgress,
  directUploadError,
  uploadedFiles
}) => {
  const overallProgress = useMemo(() => {
    const progresses = Object.values(directUploadProgress);
    if (progresses.length === 0) return 0;
    const total = progresses.reduce((sum, p) => sum + p, 0);
    return Math.round(total / progresses.length);
  }, [directUploadProgress]);

  return (
    <div className="border-b border-gray-100">
      <div
        className={`p-4 flex items-center cursor-pointer ${uploadsExpanded ? 'bg-[--color-storai-light-gray] rounded-t-[8px]' : ''}`}
        onClick={toggleUploads}
      >
        <div className="w-full flex items-center justify-between">
          <span className={`font-medium ${uploadsExpanded ? 'text-[--color-storai-blue]' : 'text-[--color-storai-gray]'}`}>Uploads</span>
          <svg
            className={`transition-transform ${uploadsExpanded ? 'transform rotate-[-90deg]' : ''}`}
            width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.03786 15.5L12.9609 10L7.03786 4.5" stroke={uploadsExpanded ? 'var(--color-storai-blue)' : 'var(--color-storai-gray)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {uploadsExpanded && (
        <div className="p-4 pt-0 bg-[--color-storai-light-gray] rounded-b-[8px]">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileInputChange}
            multiple
            aria-label="File upload"
          />
          
          {directUploading && (
            <div className="mb-3 bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700 mb-1">
                Uploading files... ({overallProgress}%)
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-storai-jade transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {directUploadError && (
            <div className="mb-3 bg-red-50 p-3 rounded-md text-sm text-red-700">
              {directUploadError}
            </div>
          )}
          
          {uploadedFiles.length > 0 ? (
            <div className="mb-1 max-h-60 overflow-y-auto">
              {uploadedFiles.map(file => (
                <FileItem
                  key={file.id}
                  file={file}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3 text-center">No files uploaded yet</p>
          )}
          
          <button
            className="w-max-content m-auto mt-1 bg-storai-teal text-white rounded-[6px] py-2 px-4 flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fileInputRef.current?.click()}
            disabled={directUploading}
          >
            <svg className="h-4 w-4 mr-1" width="12" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 1.5V10.5M11 6H2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {directUploading ? 'Uploading...' : `Upload Files`}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(UploadsSection);