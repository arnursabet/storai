import React, { RefObject } from 'react';
import { formatFileSize } from '../../utils/textFormatting';
import { FileServiceFactory } from '../../../../../infrastructure/storage/FileServiceFactory';
import { textToSlateValue } from '../../utils/textFormatting';
import { useEditorContext } from '../../context/EditorContext';

interface UploadsSectionProps {
  uploadsExpanded: boolean;
  toggleUploads: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  directUploading: boolean;
  directUploadProgress: { [key: string]: number };
  directUploadError: string | null;
  uploadedFiles: any[]; // Using 'any' for now, replace with proper type
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
  const { 
    activeFolder, 
    setActiveFolder, 
    folders, 
    setFolders, 
    tabs, 
    setTabs, 
    setActiveTabId,
    setIsLoadingContent 
  } = useEditorContext();

  return (
    <div className="border-b border-gray-100">
        <div 
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={toggleUploads}
        >
            <span className="text-storai-teal font-medium">Uploads</span>
            <svg 
                className={`h-5 w-5 text-gray-400 transition-transform ${uploadsExpanded ? 'transform rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      
        {uploadsExpanded && (
            <div className="p-4 pt-0">
                {/* Hidden file input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileInputChange} 
                    multiple
                    aria-label="File upload"
                />
          
                {/* Upload progress indicator - direct upload */}
                {directUploading && (
                    <div className="mb-3 bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-700 mb-1">
                            Uploading files...
                        </p>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-storai-jade transition-all duration-300" 
                                style={{ width: `${Object.values(directUploadProgress)[0] || 0}%` }}
                            />
                        </div>
                    </div>
                )}
          
                {/* Upload error message - direct upload */}
                    {directUploadError && (
                        <div className="mb-3 bg-red-50 p-3 rounded-md text-sm text-red-700">
                        {directUploadError}
                        </div>
                )}
          
                {/* Uploaded files list */}
                {uploadedFiles.length > 0 ? (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">
                            Uploaded files:
                        </p>
                        {uploadedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm text-gray-700">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="text-gray-400 hover:text-gray-600"
                                    aria-label={`Open ${file.name}`}
                                    title={`Open ${file.name}`}
                                    onClick={() => {
                                        // Open this file in the editor
                                        const openInEditor = async () => {
                                            try {
                                                setIsLoadingContent(true);
                                                const fileService = await FileServiceFactory.getService();
                                                const content = await fileService.readFileAsText(file.path);
                                                
                                                // Check if this file has a specific folder association
                                                const associatedFolderId = localStorage.getItem(`file_folder_${file.id}`) || activeFolder?.id || '';
                                                
                                                // Create a fresh content object using textToSlateValue
                                                // This ensures a completely new object is created with no shared references
                                                const fileContent = JSON.parse(JSON.stringify(textToSlateValue(content || `Unable to read content from ${file.name}`)));
                                        
                                                const fileTab = {
                                                    id: `note-${file.id}`,
                                                    title: file.name,
                                                    type: 'note',
                                                    content: fileContent, // Use the freshly created content
                                                    folderId: associatedFolderId // Use the associated folder or active folder
                                                };
                          
                                                // Check if tab already exists
                                                if (!tabs.some(tab => tab.id === fileTab.id)) {
                                                    setTabs(prev => [...prev, {
                                                        ...fileTab,
                                                        type: 'note' as 'note' | 'template' // Ensure type is compatible with TabData
                                                    }]); // Create a new object, don't pass the reference
                                                    
                                                    // Add to the associated folder
                                                    setFolders(prev => 
                                                        prev.map(folder => 
                                                            folder.id === associatedFolderId 
                                                            ? { 
                                                                ...folder, 
                                                                notes: folder.notes?.some(note => note.id === fileTab.id)
                                                                    ? folder.notes
                                                                    : [...(folder.notes || []), JSON.parse(JSON.stringify(fileTab))] // Deep clone to avoid reference sharing
                                                                }
                                                            : folder
                                                        )
                                                    );
                                
                                                    // If the associated folder isn't the active folder, we may want to
                                                    // activate that folder for better context
                                                    if (associatedFolderId !== activeFolder?.id) {
                                                        const folderToActivate = folders.find(f => f.id === associatedFolderId);
                                                        
                                                        if (folderToActivate) {
                                                            setFolders(prev => 
                                                            prev.map(folder => ({
                                                                ...folder,
                                                                isActive: folder.id === associatedFolderId,
                                                                isExpanded: folder.id === associatedFolderId ? true : folder.isExpanded
                                                            }))
                                                            );
                                                            setActiveFolder({...folderToActivate}); // Create a new object to avoid reference issues
                                                        }
                                                    }
                                                }

                                                setActiveTabId(fileTab.id);
                                            } catch (error) {
                                                console.error('Error opening file:', error);
                                            } finally {
                                                setIsLoadingContent(false);
                                            }
                                        };

                                        openInEditor();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-3">No files uploaded yet</p>
                )}
          
                <button 
                    className="w-full mt-3 bg-storai-teal text-white rounded-md py-2 px-4 flex items-center justify-center hover:bg-storai-teal transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={directUploading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {directUploading ? 'Uploading...' : `Upload to ${activeFolder?.name}`}
                </button>
            </div>
        )}
    </div>
  );
};

export default React.memo(UploadsSection);