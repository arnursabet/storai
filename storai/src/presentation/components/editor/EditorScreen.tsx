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
          <div className="flex space-x-5 items-center">
            <div className="flex items-center space-x-2 border-r border-gray-200 pr-4">
              <button 
                className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
                onClick={useEditorContext().handleNewNote}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Notes
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Settings"
                title="Settings"
                onClick={() => navigate('/settings')}
              >
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.98239 3.5808L6.47689 2.30829C6.56082 2.09364 6.70779 1.90946 6.89846 1.77999C7.08913 1.65052 7.31454 1.58185 7.54501 1.58302H8.47138C8.701 1.58285 8.92533 1.65199 9.11502 1.78139C9.30471 1.91079 9.45093 2.09443 9.53455 2.30829L10.0291 3.5808L11.6774 4.53684L13.029 4.33244C13.255 4.29908 13.4858 4.33436 13.6916 4.43369C13.8973 4.53303 14.0684 4.69185 14.1829 4.88958L14.6477 5.69397C14.7621 5.89278 14.814 6.12143 14.7967 6.35016C14.7793 6.57888 14.6935 6.79709 14.5504 6.97637L13.6982 8.04449V9.95656L14.5504 11.0247C14.6935 11.204 14.7793 11.4222 14.7967 11.6509C14.814 11.8796 14.7621 12.1083 14.6477 12.3071L14.1829 13.1115C14.0684 13.3092 13.8973 13.468 13.6916 13.5674C13.4858 13.6667 13.255 13.702 13.029 13.6686L11.6774 13.4642L10.0291 14.4202L9.53455 15.6928C9.45093 15.9066 9.30471 16.0903 9.11502 16.2197C8.92533 16.3491 8.701 16.4182 8.47138 16.418H7.54501C7.31539 16.4182 7.09106 16.3491 6.90137 16.2197C6.71168 16.0903 6.56546 15.9066 6.48184 15.6928L5.98734 14.4202L4.339 13.4642L2.98737 13.6686C2.76137 13.702 2.53055 13.6667 2.32483 13.5674C2.11911 13.468 1.94795 13.3092 1.83353 13.1115L1.35222 12.3071C1.2378 12.1083 1.18588 11.8796 1.20322 11.6509C1.22057 11.4222 1.30637 11.204 1.44947 11.0247L2.30166 9.95656V8.04449L1.44947 6.97637C1.30637 6.79709 1.22057 6.57888 1.20322 6.35016C1.18588 6.12143 1.2378 5.89278 1.35222 5.69397L1.81705 4.88958C1.93147 4.69185 2.10262 4.53303 2.30835 4.43369C2.51407 4.33436 2.74488 4.29908 2.97088 4.33244L4.32252 4.53684L5.98239 3.5808ZM5.94778 9.00053C5.94778 9.54698 6.16485 10.0711 6.55126 10.4575C6.93766 10.8439 7.46174 11.0609 8.00819 11.0609C8.55465 11.0609 9.07873 10.8439 9.46513 10.4575C9.85153 10.0711 10.0686 9.54698 10.0686 9.00053C10.0686 8.45407 9.85153 7.92999 9.46513 7.54359C9.07873 7.15719 8.55465 6.94011 8.00819 6.94011C7.46174 6.94011 6.93766 7.15719 6.55126 7.54359C6.16485 7.92999 5.94778 8.45407 5.94778 9.00053Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>

              <button className="text-gray-400 hover:text-gray-600"
                      aria-label="Delete folder"
                      title="Delete folder"
              >
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.998779 4.88907H15.0009M5.04733 4.8825V4.50527C5.04733 3.73153 5.3547 2.98949 5.90181 2.44237C6.44893 1.89526 7.19098 1.58789 7.96471 1.58789C8.73845 1.58789 9.4805 1.89526 10.0276 2.44237C10.5747 2.98949 10.8821 3.73153 10.8821 4.50527V4.8825M11.7106 16.4135H4.29768C3.86079 16.4135 3.44179 16.24 3.13286 15.931C2.82393 15.6221 2.65038 15.2031 2.65038 14.7662V4.88237H13.3579V14.7662C13.3579 15.2031 13.1843 15.6221 12.8754 15.931C12.5665 16.24 12.1475 16.4135 11.7106 16.4135Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <button 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Save"
                title="View options"
              >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.95166 14.5657V11.5174C4.95166 10.9994 5.37159 10.5795 5.88959 10.5795H10.1103C10.6283 10.5795 11.0482 10.9994 11.0482 11.5174V14.5657M4.95166 1.43471V4.48298M3.07581 14.8002H12.9241C13.9601 14.8002 14.8 13.9604 14.8 12.9243V5.96341C14.8 5.4659 14.6023 4.98877 14.2505 4.63697L11.3632 1.74963C11.0114 1.39783 10.5342 1.2002 10.0368 1.2002H3.07581C2.0398 1.2002 1.19995 2.04005 1.19995 3.07606V12.9243C1.19995 13.9604 2.0398 14.8002 3.07581 14.8002Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600"
                aria-label="Collapse"
                title="Collapse"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.3057 1.44616V14.5657M1.19995 3.07606C1.19995 2.04005 2.0398 1.2002 3.07581 1.2002H12.9241C13.9601 1.2002 14.8 2.04005 14.8 3.07606V12.9243C14.8 13.9604 13.9601 14.8002 12.9241 14.8002H3.07581C2.0398 14.8002 1.19995 13.9604 1.19995 12.9243V3.07606Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

              </button>
            </div>
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