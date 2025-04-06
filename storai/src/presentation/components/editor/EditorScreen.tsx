import React, { useEffect, useState, useRef, ChangeEvent, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileUpload } from '../../../application/hooks/useFileUpload';
import { FileService } from '../../../infrastructure/storage/FileService';
import { TemplateType } from '../../../domain/entities/Template';
import TemplateConfirmationModal from './modals/TemplateConfirmationModal';
import EditorSidebar from './sidebar/EditorSidebar';
import RightSidebar from './right-sidebar/RightSidebar';
import { EditorProvider } from './context/EditorContext';
import { useEditorContext } from './context/EditorContext';
import EditorTabs from './content/EditorTabs';
import EditorContent from './content/EditorContent';
import { createEmptyContent, textToSlateValue, slateToPlainText, textToSlate } from './utils/textFormatting';


const EditorScreen: React.FC = () => {
  return (
    <EditorProvider>
      <EditorScreenContent />
    </EditorProvider>
  );
};

// Editor Component
const EditorScreenContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { uploadedFiles, fetchUploadedFiles } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    activeFolder, 
    setFolders, 
    setTabs, 
    handleTemplateSelect, 
    setActiveTabId,
    showTemplateConfirmation,
    selectedTemplateType, 
    handleConfirmTemplateGeneration,
    handleCancelTemplateGeneration,
    associateFileWithFolder,
    getFileFolderId
  } = useEditorContext();
  
  // Local state for UI
  const [uploadsExpanded, setUploadsExpanded] = useState(true);
  const [templateExpanded, setTemplateExpanded] = useState(true);
  
  // Local state for direct uploads
  const [directUploading, setDirectUploading] = useState(false);
  const [directUploadProgress, setDirectUploadProgress] = useState<{ [key: string]: number }>({});
  const [directUploadError, setDirectUploadError] = useState<string | null>(null);

  // Load uploaded files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  // Handle initial file loading and template generation
  useEffect(() => {
    let isMounted = true; // Flag to check if component is still mounted
    const controller = new AbortController(); // AbortController for fetch (if used)

    const handleInitialLoad = async () => {
      try {
        // Fetch the latest uploaded files
        await fetchUploadedFiles(); // Assuming fetchUploadedFiles internally uses fetch and accepts a signal
        
        if (!isMounted) return; // Exit if component unmounted during fetch

        const defaultFolderId = '1';
        let newNotes: any[] = []; // Define newNotes before the if block to make it accessible later

        // Check if we have uploaded files that need to be converted to notes
        if (uploadedFiles.length > 0) {
          // Create notes from uploaded files
          newNotes = await Promise.all(uploadedFiles.map(async file => {
            const fileFolderId = getFileFolderId(file.id) || defaultFolderId;
            
            let content;
            try {
              // Pass signal to readFileAsText if it supports it
              const fileContent = await FileService.readFileAsText(file.path /*, { signal: controller.signal } */); 
              if (!isMounted) throw new Error('Component unmounted'); // Check again after async op
              content = textToSlate(fileContent);
            } catch (error: any) { // Catch specific errors if needed
              if (error.name === 'AbortError' || !isMounted) {
                console.log('File reading aborted or component unmounted');
                content = textToSlate(`[Aborted loading content for ${file.name}]`);
              } else {
                console.error(`Error reading file ${file.name}:`, error);
                content = textToSlate(`[Content from ${file.name} could not be loaded]`);
              }
            }
            
            return {
              id: `note-${file.id}`,
              title: file.name,
              type: 'note' as const,
              content: content,
              folderId: fileFolderId,
              // Add other TabData properties if necessary, e.g., isRenaming: false
            };
          }));
          
          if (!isMounted) return; // Check again

          // Add notes to tabs (Ensure state updates check isMounted if logic becomes async)
          setTabs(prev => {
            const newNoteIds = newNotes.map(note => note.id);
            const existingNoteIds = prev.map(tab => tab.id);
            const notesToAdd = newNotes.filter(note => !existingNoteIds.includes(note.id));
            return [...prev, ...notesToAdd];
          });
          
          // Add notes to folders (Ensure state updates check isMounted if logic becomes async)
          setFolders(prev => 
            prev.map(folder => {
              const folderNotes = newNotes.filter(note => note.folderId === folder.id);
              if (folderNotes.length === 0) return folder;
              const existingNoteIds = folder.notes?.map(note => note.id) || [];
              const notesToAdd = folderNotes.filter(note => !existingNoteIds.includes(note.id));
              return {
                ...folder,
                notes: [...(folder.notes || []), ...notesToAdd],
                isExpanded: true
              };
            })
          );
        }
        
        // Check if we need to generate a template (This part is synchronous)
        const selectedTemplateFromState = location.state?.selectedTemplate as TemplateType | undefined;
        if (selectedTemplateFromState && newNotes.length > 0) {
          const firstNote = newNotes[0];
          if (firstNote) {
            setActiveTabId(firstNote.id);
            handleTemplateSelect(selectedTemplateFromState);
            navigate(location.pathname, { replace: true, state: {} });
          }
        }
      } catch (error) {
          // Handle potential errors during fetchUploadedFiles if necessary
          console.error("Error during initial load:", error);
      }
    };
    
    handleInitialLoad();

    // Cleanup function
    return () => {
      isMounted = false; // Set flag when component unmounts
      controller.abort(); // Abort any ongoing fetch requests
    };
  // Dependencies reviewed - ensure fetchUploadedFiles, getFileFolderId, etc. are stable or included.
  }, [fetchUploadedFiles, uploadedFiles, setFolders, setTabs, handleTemplateSelect, setActiveTabId, navigate, location, getFileFolderId]);

  // Toggle sections
  const toggleUploads = () => {
    setUploadsExpanded(!uploadsExpanded);
  };

  const toggleTemplates = () => {
    setTemplateExpanded(!templateExpanded);
  };

  // Handle file selection with direct upload
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesToUpload = Array.from(e.target.files);
      
      // Set uploading state
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
            const uploadedFile = await FileService.uploadFile(file);
            
            // Store the folder relationship using context
            associateFileWithFolder(uploadedFile.id, activeFolder?.id || '1');

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
        
        // After uploading, refresh the list of uploaded files
        await fetchUploadedFiles();

      } catch (error) {
        console.error('Error in upload process:', error);
        setDirectUploadError(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setDirectUploading(false);
      }
      
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Memoize the modal component to prevent unnecessary re-renders
  const templateConfirmationModal = useMemo(() => (
    <TemplateConfirmationModal 
      isOpen={showTemplateConfirmation}
      templateType={selectedTemplateType}
      onCancel={handleCancelTemplateGeneration}
      onConfirm={handleConfirmTemplateGeneration}
    />
  ), [showTemplateConfirmation, selectedTemplateType, handleCancelTemplateGeneration, handleConfirmTemplateGeneration]);

  return (
    <div className="flex h-screen bg-[--color-storai-light-gray]">
      {/* Left Sidebar */}
      <EditorSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col mt-3 mb-3 shadow-lg bg-white border border-gray-100 rounded-[10px]">
        {/* Top Bar */}
        <div className="p-4 flex items-center justify-between">
          <div className="font-medium text-lg text-gray-700">{activeFolder?.name || 'My Notes'}</div>
          <div className="flex items-center space-x-2">
            <button 
              className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
              onClick={useEditorContext().handleNewNote}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Notes
            </button>
            <button 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Settings"
              title="Settings"
              onClick={() => navigate('/settings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="text-gray-400 hover:text-gray-600"
              aria-label="View options"
              title="View options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Document options"
              title="Document options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <EditorTabs />

        {/* Editor Area */}
        <EditorContent />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        uploadsExpanded={uploadsExpanded}
        templateExpanded={templateExpanded}
        toggleUploads={toggleUploads}
        toggleTemplates={toggleTemplates}
        fileInputRef={fileInputRef}
        handleFileInputChange={handleFileInputChange}
        directUploading={directUploading}
        directUploadProgress={directUploadProgress}
        directUploadError={directUploadError}
        uploadedFiles={uploadedFiles}
      />

      {/* Template Confirmation Modal */}
      {templateConfirmationModal}
    </div>
  );
});

export default EditorScreen; 