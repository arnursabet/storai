import { useState, useRef, DragEvent, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '../../../application/hooks/useFileUpload';
import { FileService } from '../../../infrastructure/storage/FileService';
import { DocumentIcon } from '../icons/DocumentIcon';
import ArrowButton from '../common/ArrowButton';

export const UploadScreen: React.FC = () => {
  return <UploadScreenContent />;
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
    uploadedFiles,
    fetchUploadedFiles
  } = useFileUpload();
  
  const [dragActive, setDragActive] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  
  const [directUploading, setDirectUploading] = useState(false);
  const [directUploadProgress, setDirectUploadProgress] = useState<{ [key: string]: number }>({});
  const [directUploadError, setDirectUploadError] = useState<string | null>(null);

  /**
   * Handles files dropped into the drag area
   */
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
      await directUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  /**
   * Directly uploads an array of files using FileService.
   */
  const directUploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setDirectUploading(true);
    setDirectUploadError(null);
    setDirectUploadProgress({});
    
    let allSuccessful = true;

    try {
      for (const file of filesToUpload) {
        setDirectUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const progressInterval = setInterval(() => {
          setDirectUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            return { ...prev, [file.name]: Math.min(currentProgress + 10, 90) }; 
          });
        }, 200);
        
        try {
          await FileService.uploadFile(file);
          
          setDirectUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        } catch (error) {
          allSuccessful = false;
          console.error(`Error uploading file ${file.name}:`, error);
          setDirectUploadError(prevError => 
             `${prevError ? prevError + "; " : ""}Error uploading ${file.name}: ${error instanceof Error ? error.message : String(error)}`
          );
          setDirectUploadProgress(prev => {
              const { [file.name]: _, ...rest } = prev;
              return rest;
          });
        } finally {
          clearInterval(progressInterval);
        }
      }
      
      await fetchUploadedFiles();

      console.log("Navigating to /templates after upload attempt.");
      navigate('/templates'); 

    } catch (error) {
      console.error('Error in the overall upload process:', error);
      setDirectUploadError(`Upload process failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDirectUploading(false);
    }
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  /**
   * Handles drag leave event
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return; 
    setDragActive(false);
  };

  /**
   * Triggers the hidden file input
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles files selected via input, adds them to stage, and uploads.
   */
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      await directUploadFiles(selectedFiles);
      e.target.value = '';
    }
  };

  /**
   * Handles form submission (used if files are staged but not uploaded immediately).
   * Currently, uploads happen immediately on select/drop.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, files should already be uploading/uploaded.");
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /**
   * Toggle data policy
   */
  const toggleDataPolicy = () => {
    setShowPolicy(!showPolicy);
  };

  /**
   * Navigate to editor (Skip button)
   */
  const handleSkip = () => {
    console.log("Skipping upload, navigating to /editor");
    navigate('/editor');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 bg-gray-50">
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
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#F3FFFE"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M33.6 20.7769C33.6 20.3364 33.425 19.914 33.1135 19.6025L25.9974 12.4864C25.686 12.175 25.2636 12 24.8231 12H15.6458C14.9578 12 14.4001 12.5577 14.4001 13.2456V34.7544C14.4001 35.4423 14.9578 36 15.6458 36H32.3544C33.0423 36 33.6 35.4423 33.6 34.7544V20.7769ZM24.586 14.232C24.5337 14.1796 24.4442 14.2167 24.4442 14.2907V20.9032C24.4442 21.0867 24.5929 21.2354 24.7764 21.2354H31.389C31.4629 21.2354 31.5 21.146 31.4477 21.0936L24.586 14.232Z" fill="#199D94"/>
            </svg>

            <p id="dropzone-label" className="text-lg text-gray-600 mb-2 mt-4">
              Drag and drop your files here
            </p>
            <p className="text-gray-500 mb-6">
              or
            </p>
            <button 
              type="button" 
              className="px-6 py-2 bg-storai-teal text-white rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
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
                      <span className="text-sm text-gray-800 truncate" title={file.name}>{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    {directUploading && directUploadProgress[file.name] !== undefined && directUploadProgress[file.name] < 100 ? (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-[60px]">
                        <div 
                          className="h-full bg-storai-jade transition-all duration-300" 
                          style={{ width: `${directUploadProgress[file.name] || 0}%` }}
                        />
                      </div>
                    ) : directUploadProgress[file.name] === 100 ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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

          {files.length === 0 && directUploading && (
            <div className="bg-storai-seafoam rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Uploading files</h2>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-storai-jade transition-all duration-300" 
                  style={{ width: `${Math.round(Object.values(directUploadProgress).reduce((a, b) => a + b, 0) / Object.keys(directUploadProgress).length) || 0}%` }}
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
        </form>
        
        <div className="absolute bottom-8 right-8">
          <button 
            type="button" 
            className="px-6 py-2 bg-transparent text-gray-600 border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
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