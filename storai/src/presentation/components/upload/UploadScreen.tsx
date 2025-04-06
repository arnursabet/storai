import { useState, useRef, DragEvent, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '../../../application/hooks/useFileUpload';
import { FileService } from '../../../infrastructure/storage/FileService';
import { DocumentIcon } from '../icons/DocumentIcon';
import ArrowButton from '../common/ArrowButton';
import { useEditorContext } from '../editor/context/EditorContext';
import { EditorProvider } from '../editor/context/EditorContext';

// Default folder ID for initial uploads
const DEFAULT_FOLDER_ID = '1';

export const UploadScreen: React.FC = () => {
  return (
    <EditorProvider>
      <UploadScreenContent />
    </EditorProvider>
  );
};

/**
 * Component for uploading files with drag-and-drop functionality
 */
export function UploadScreenContent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    files,
    isUploading,
    uploadProgress,
    uploadError,
    addFiles,
    removeFile,
    uploadFiles,
    uploadedFiles,
    fetchUploadedFiles
  } = useFileUpload();
  
  const [dragActive, setDragActive] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  
  // Direct upload state
  const [directUploading, setDirectUploading] = useState(false);
  const [directUploadProgress, setDirectUploadProgress] = useState<{ [key: string]: number }>({});
  const [directUploadError, setDirectUploadError] = useState<string | null>(null);

  const { associateFileWithFolder } = useEditorContext();

  // Monitor uploadedFiles changes and navigate when files are uploaded
  useEffect(() => {
    if (uploadedFiles.length > 0 && !isUploading && !directUploading) {
      // Store folder ID in localStorage for EditorScreen to use
      localStorage.setItem('defaultFolderId', DEFAULT_FOLDER_ID);
      
      // Navigate to templates page when upload is complete
      navigate('/templates');
    }
  }, [uploadedFiles, isUploading, directUploading, navigate]);

  /**
   * Handles files dropped into the drag area
   */
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await directUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  /**
   * Direct upload files without relying on state updates
   */
  const directUploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setDirectUploading(true);
    setDirectUploadError(null);
    
    try {
      // Upload files directly using the FileService
      for (const file of filesToUpload) {
        // Create progress simulation
        const progressInterval = setInterval(() => {
          setDirectUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress < 90) {
              return {
                ...prev,
                [file.name]: currentProgress + 10
              };
            }
            return prev;
          });
        }, 300);
        
        try {
          // Direct upload through FileService
          // Associate file with default folder (Folder 1)
          const uploadedFile = await FileService.uploadFile(file);
          
          // Store the file-folder association in context instead of localStorage
          associateFileWithFolder(uploadedFile.id, DEFAULT_FOLDER_ID);
          
          // Set progress to 100%
          setDirectUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          setDirectUploadError(`Error uploading file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          clearInterval(progressInterval);
        }
      }
      
      // Store information about the upload in localStorage
      localStorage.setItem('uploadedToFolder', DEFAULT_FOLDER_ID);
      
      // After uploading, refresh the list of uploaded files
      await fetchUploadedFiles();
    } catch (error) {
      console.error('Error in upload process:', error);
      setDirectUploadError(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDirectUploading(false);
    }
  };

  /**
   * Handles drag over event for visual feedback
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  /**
   * Handles drag leave event for visual feedback
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  /**
   * Triggers the hidden file input when the button is clicked
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles files selected through the file input
   */
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Use the direct upload method
      await directUploadFiles(selectedFiles);
      
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  /**
   * Handles the file upload submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      await directUploadFiles(files);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /**
   * Toggle data policy visibility
   */
  const toggleDataPolicy = () => {
    setShowPolicy(!showPolicy);
  };

  /**
   * Navigate to editor when skip is clicked
   */
  const handleSkip = () => {
    // Clear any template-related localStorage items to prevent automatic template generation
    localStorage.removeItem('selectedTemplate');
    localStorage.removeItem('pendingTemplateGeneration');
    
    // Navigate to editor without uploading any files
    navigate('/editor');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3">
      <div className="w-full max-w-[50rem] mx-auto p-8 bg-white rounded-xl shadow-lg relative">
        <h1 className="text-[1.875rem] text-[var(--color-storai-dark-blue)] mb-2">Upload files</h1>
        <p className="text-[var(--color-storai-gray)] text-[1.25rem] mb-8">Upload notes and we will summarize for you!</p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-12 mb-8 flex flex-col items-center justify-center text-center transition-all duration-200 bg-gray-50
              ${dragActive ? 'border-storai-jade bg-storai-seafoam' : 'border-gray-200 hover:border-storai-teal'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            aria-labelledby="dropzone-label"
          >
            <DocumentIcon className="w-12 h-12 text-storai-teal mb-6" />
            <p id="dropzone-label" className="text-lg text-gray-600 mb-2">
              Drag and drop your files here
            </p>
            <p className="text-gray-500 mb-6">
              or
            </p>
            <button 
              type="button" 
              className="px-6 py-2 bg-storai-teal text-white rounded-md font-medium hover:bg-storai-teal transition-colors"
              onClick={handleButtonClick}
              disabled={directUploading}
            >
              {directUploading ? 'Uploading...' : 'Choose your files'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.docx,.doc,.rtf"
              className="sr-only"
              onChange={handleFileInputChange}
              aria-label="File upload"
            />
          </div>

          {files.length > 0 && (
            <div className="bg-storai-seafoam rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Files to upload</h2>
              <ul className="list-none p-0 max-h-[300px] overflow-y-auto">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between items-center p-3 bg-white rounded-md mb-2 border border-gray-200">
                    <div className="flex flex-col flex-grow min-w-0 mr-4">
                      <span className="text-sm text-gray-800 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    {directUploading && directUploadProgress[file.name] !== undefined ? (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-[60px]">
                        <div 
                          className="h-full bg-storai-jade transition-all duration-300" 
                          style={{ width: `${directUploadProgress[file.name] || 0}%` }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="bg-transparent border-none text-gray-400 cursor-pointer w-6 h-6 text-sm rounded-full flex items-center justify-center transition-all hover:text-red-500 hover:bg-red-100"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                        disabled={directUploading}
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show direct upload progress when no files in state but uploading in progress */}
          {files.length === 0 && directUploading && (
            <div className="bg-storai-seafoam rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Uploading files</h2>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-storai-jade transition-all duration-300" 
                  style={{ width: `${Object.values(directUploadProgress)[0] || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Please wait while we upload your files...</p>
            </div>
          )}

          {directUploadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-8" role="alert">
              {directUploadError}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-[1.25rem] text-[var(--color-storai-dark-blue)]"> Additional Information</h3>
            <ul className="list-disc text-[1.125rem] text-[var(--color-storai-gray)] pl-5">
              <li> You can easily delete your uploaded files after.</li>
              <li>Patient identification will be anonymized.</li>
            </ul>
          </div>

          <div className="mb-8">
            <ArrowButton 
              text="Data Storage Policy" 
              onClick={toggleDataPolicy} 
              className="mb-2 text-[0.875rem] max-w-[20rem]"
            />
            
            {showPolicy && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md text-gray-700 text-sm animate-fadeIn">
                <p className="mb-2">Your files are securely stored and automatically deleted after processing:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Files are encrypted during transit and at rest</li>
                  <li>Files are deleted within 24 hours after processing</li>
                  <li>No patient identifying information is stored long-term</li>
                  <li>We comply with all applicable data protection regulations</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Only show this button when we have files to upload */}
          {files.length > 0 && (
            <button 
              type="submit" 
              className="w-full mt-3 bg-storai-jade text-white rounded-md py-2 px-4 flex items-center justify-center hover:bg-storai-teal transition-colors"
              disabled={directUploading}
            >
              {directUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload
                </>
              )}
            </button>
          )}
        </form>
        
        {/* Skip button positioned in the bottom right */}
        <div className="absolute bottom-8 right-8">
          <button 
            type="button" 
            className="px-6 py-2 bg-transparent text-gray-600 border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors"
            onClick={handleSkip}
            disabled={directUploading}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
} 