import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { TabData, FolderData } from '../../types';
import { createEmptyContent, textToSlateValue, slateToPlainText } from '../utils/textFormatting';
import { TemplateType } from '../../../../domain/entities/Template';
import { LLMServiceFactory } from '../../../../infrastructure/llm/LLMServiceFactory';

interface EditorContextType {
  // State
  tabs: TabData[];
  folders: FolderData[];
  activeTabId: string | null;
  activeFolder: FolderData | null;
  isLoadingContent: boolean;
  
  // Template state
  isGenerating: boolean;
  templateError: string | null;
  showTemplateConfirmation: boolean;
  selectedTemplateType: TemplateType | null;
  pendingSourceNoteId: string | null;
  
  // Tab operations
  setTabs: React.Dispatch<React.SetStateAction<TabData[]>>;
  setActiveTabId: (id: string) => void;
  handleTabClick: (tabId: string) => void;
  handleCloseTab: (tabId: string, e: React.MouseEvent) => void;
  handleTabRename: (tabId: string, newName: string) => void;
  handleNewNote: () => void;
  
  // Folder operations
  setFolders: React.Dispatch<React.SetStateAction<FolderData[]>>;
  setActiveFolder: (folder: FolderData) => void;
  handleNewFolder: () => void;
  toggleFolderExpanded: (folderId: string, e: React.MouseEvent) => void;
  
  // Content operations
  setIsLoadingContent: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditorChange: (tabId: string, newValue: any) => void;
  
  // Template operations
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  setTemplateError: React.Dispatch<React.SetStateAction<string | null>>;
  setShowTemplateConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTemplateType: React.Dispatch<React.SetStateAction<TemplateType | null>>;
  setPendingSourceNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  handleTemplateSelect: (templateType: TemplateType) => void;
  handleConfirmTemplateGeneration: () => void;
  handleCancelTemplateGeneration: () => void;
  getTemplateButtonClass: (buttonTemplateType: TemplateType) => string;

  // File-Folder association
  associateFileWithFolder: (fileId: string, folderId: string) => void;
  getFileFolderId: (fileId: string) => string | undefined;
}

// Default value as undefined with type assertion
const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Initial folder structure
const INITIAL_FOLDERS: FolderData[] = [
  { id: '1', name: 'Folder 1', isActive: true, isExpanded: true, notes: [] },
  { id: '2', name: 'Folder 2', isActive: false, isExpanded: true, notes: [] },
  { id: '3', name: 'Folder 3', isActive: false, isExpanded: false, notes: [] }
];

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State definitions
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderData[]>(INITIAL_FOLDERS);
  const [activeFolder, setActiveFolder] = useState<FolderData>(
    folders.find(f => f.isActive) || folders[0]
  );
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  // Template state
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [showTemplateConfirmation, setShowTemplateConfirmation] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType | null>(null);
  const [pendingSourceNoteId, setPendingSourceNoteId] = useState<string | null>(null);

  // File-Folder association state
  const [fileFolderMap, setFileFolderMap] = useState<Record<string, string>>({});

  // Tab operations
  const handleTabClick = (tabId: string) => {
    console.log(`Switching to tab ${tabId}`);
    
    // Get fresh data for the tab we're switching to
    const targetTab = tabs.find(t => t.id === tabId);
    if (targetTab) {
      console.log(`Found tab ${targetTab.title} with content:`, JSON.stringify(targetTab.content).substring(0, 100) + '...');
    }
    
    setActiveTabId(tabId);
    
    // Find the folder containing this tab and set it as active
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.folderId) {
      const folder = folders.find(f => f.id === tab.folderId);
      if (folder) {
        setFolders(prev => 
          prev.map(f => ({ ...f, isActive: f.id === folder.id }))
        );
        setActiveFolder({...folder}); // Create a fresh copy
      }
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Remove from tabs array
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // Remove from folder notes
    setFolders(prev => 
      prev.map(folder => {
        if (!folder.notes) return folder;
        
        return { 
          ...folder, 
          notes: folder.notes.filter(note => note.id !== tabId) 
        };
      })
    );
    
    // If closing the active tab, activate the first remaining tab
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleTabRename = (tabId: string, newName: string) => {
    // Update tab in tabs array
    setTabs(prev => 
      prev.map(tab => 
        tab.id === tabId 
          ? { ...tab, title: newName.trim() || 'Untitled Note' }
          : tab
      )
    );
    
    // Also update in folder's notes
    setFolders(prev => 
      prev.map(folder => {
        if (!folder.notes) return folder;
        
        const updatedNotes = folder.notes.map(note => 
          note.id === tabId 
            ? { ...note, title: newName.trim() || 'Untitled Note', isRenaming: false }
            : note
        );
        
        return { ...folder, notes: updatedNotes };
      })
    );
  };

  const handleNewNote = () => {
    const newNoteId = `note-new-${Date.now()}`;
    
    // Create a fresh empty content object
    const emptyContent = createEmptyContent();
    console.log('Creating new empty note with content:', JSON.stringify(emptyContent));
    
    const newNote: TabData = {
      id: newNoteId,
      title: 'Untitled Note',
      type: 'note',
      content: emptyContent, // Use newly created empty content
      folderId: activeFolder.id, // Associate note with current active folder
    };
    
    // Create a deep copy for tabs
    const tabsCopy = JSON.parse(JSON.stringify(newNote));
    
    // Add to tabs state
    setTabs(prev => [...prev, tabsCopy]);
    setActiveTabId(newNoteId);
    
    // Create another deep copy for folder
    const folderCopy = JSON.parse(JSON.stringify(newNote));
    
    // Also add to folder's notes
    setFolders(prev => 
      prev.map(folder => 
        folder.id === activeFolder.id 
          ? { 
              ...folder, 
              notes: [...(folder.notes || []), folderCopy],
              isExpanded: true // Ensure folder is expanded to show the new note
            }
          : folder
      )
    );
  };

  // Folder operations
  const handleNewFolder = () => {
    const newFolder: FolderData = {
      id: `folder-${Date.now()}`,
      name: `New Folder`,
      isActive: false
    };
    
    setFolders([...folders, newFolder]);
  };

  const toggleFolderExpanded = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder selection when clicking expand icon
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  // Content operations
  const handleEditorChange = (tabId: string, newValue: any) => {
    console.log(`Updating tab ${tabId} with new content:`, JSON.stringify(newValue).substring(0, 100) + '...');
    
    // Create a deep copy of the new value to avoid reference issues
    const newValueCopy = JSON.parse(JSON.stringify(newValue));
    
    setTabs(prev => 
      prev.map(tab => 
        tab.id === tabId ? { ...tab, content: newValueCopy } : tab
      )
    );
    
    // Also update the content in the folder
    setFolders(prev => 
      prev.map(folder => {
        if (!folder.notes) return folder;
        
        return {
          ...folder,
          notes: folder.notes.map(note =>
            note.id === tabId ? { ...note, content: JSON.parse(JSON.stringify(newValueCopy)) } : note
          )
        };
      })
    );
  };

  // Template operations
  const handleTemplateSelect = useCallback((templateType: TemplateType) => {
    console.log('handleTemplateSelect called with:', { templateType });
    console.log('Current state:', { 
      activeTabId, 
      showTemplateConfirmation, 
      selectedTemplateType, 
      pendingSourceNoteId 
    });
    
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    console.log('Active tab found:', activeTab);
    
    // Only show template confirmation if there's an active note tab
    if (activeTab && activeTab.type === 'note') {
      console.log('Setting template state...');
      
      // Important: We need to set the template type first to ensure it's available
      // when the confirmation modal renders
      setSelectedTemplateType(templateType);
      
      // Then set the source note ID
      setPendingSourceNoteId(activeTab.id);
      
      // Finally, show the confirmation modal
      // This ensures the modal has all the data it needs when it renders
      setTimeout(() => {
        setShowTemplateConfirmation(true);
        console.log(`Template confirmation modal should now open for ${templateType}`);
      }, 0);
    } else {
      console.warn('Cannot generate template: no active note selected');
    }
  }, [tabs, activeTabId, setSelectedTemplateType, setPendingSourceNoteId, setShowTemplateConfirmation]);

  const handleConfirmTemplateGeneration = useCallback(async () => {
    console.log('Confirming template generation with:', { selectedTemplateType, pendingSourceNoteId });
    
    if (selectedTemplateType && pendingSourceNoteId) {
      // Generate the template now that the user has confirmed
      setIsGenerating(true);
      try {
        // Get the source tab
        const sourceTab = tabs.find(tab => tab.id === pendingSourceNoteId);
        if (!sourceTab) {
          throw new Error('Source note not found');
        }
        console.log('Source tab found:', sourceTab.title);

        // Use the folder of the source note
        const folderId = sourceTab.folderId || folders[0].id;
        
        // Generate content using LLM - create a deep copy of the source content
        const sourceContent = JSON.parse(JSON.stringify(sourceTab.content));
        
        // Convert Slate content to plain text
        const plainTextContent = slateToPlainText(sourceContent);
        console.log('Source content for template generation:', plainTextContent.substring(0, 100) + '...');
        
        console.log(`About to call LLM service for template type: ${selectedTemplateType}`);
        
        // Get the service and generate template
        const llmService = await LLMServiceFactory.getService();
        const generatedContent = await llmService.generateTemplate(plainTextContent, selectedTemplateType);
        
        console.log(`Received template from OpenAI (${selectedTemplateType}):`, generatedContent.substring(0, 100) + '...');
        
        // Convert generated text back to Slate value with improved formatting
        const slateValue = textToSlateValue(generatedContent);
        console.log('Converted to Slate value:', JSON.stringify(slateValue).substring(0, 100) + '...');
        
        // Make a deep copy to ensure no shared references
        const safeGeneratedContent = JSON.parse(JSON.stringify(slateValue));
        
        // Create a new tab with the generated content
        const newTab: TabData = {
          id: `template-${selectedTemplateType}-${Date.now()}`,
          title: `${selectedTemplateType} - ${sourceTab.title}`,
          type: 'template',
          content: safeGeneratedContent,
          templateType: selectedTemplateType,
          folderId: folderId,
          sourceNoteId: sourceTab.id
        };
        
        console.log('Created new tab with template type:', newTab.templateType);
        
        // Add to tabs - create a copy to avoid reference issues
        const newTabCopy = JSON.parse(JSON.stringify(newTab));
        setTabs(prev => [...prev, newTabCopy]);
        setActiveTabId(newTab.id);
        
        // Add to source note's folder - create a separate deep copy for the folder
        const folderTabCopy = JSON.parse(JSON.stringify(newTab));
        setFolders(prev => 
          prev.map(folder => 
            folder.id === folderId 
              ? { 
                  ...folder, 
                  notes: [...(folder.notes || []), folderTabCopy],
                  isExpanded: true
                }
              : folder
          )
        );
      } catch (error) {
        console.error('Error in template generation:', error);
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            setTemplateError('Network error while contacting OpenAI. Please check your internet connection and try again.');
          } else {
            setTemplateError(`Template generation failed: ${error.message}`);
          }
        } else {
          setTemplateError('An unexpected error occurred during template generation.');
        }
      } finally {
        setIsGenerating(false);
        setShowTemplateConfirmation(false);
        setSelectedTemplateType(null);
        setPendingSourceNoteId(null);
      }
    }
  }, [selectedTemplateType, pendingSourceNoteId, tabs, folders]);

  const handleCancelTemplateGeneration = useCallback(() => {
    setShowTemplateConfirmation(false);
    setSelectedTemplateType(null);
    setPendingSourceNoteId(null);
  }, []);

  const getTemplateButtonClass = useCallback((buttonTemplateType: TemplateType) => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    if (activeTab?.templateType === buttonTemplateType) {
      return 'bg-storai-teal text-white';
    }
    
    if (isGenerating) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }
    
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  }, [tabs, activeTabId, isGenerating]);

  // File-Folder association functions
  const associateFileWithFolder = useCallback((fileId: string, folderId: string) => {
    // Update the in-memory map
    setFileFolderMap(prev => ({ ...prev, [fileId]: folderId }));
    
    // No need to use localStorage as we're now managing this in context state
  }, []);

  const getFileFolderId = useCallback((fileId: string): string | undefined => {
    // Return from in-memory map
    return fileFolderMap[fileId];
  }, [fileFolderMap]);

  // Create context value
  const contextValue: EditorContextType = {
    tabs,
    folders,
    activeTabId,
    activeFolder,
    isLoadingContent,
    setTabs,
    setActiveTabId,
    handleTabClick,
    handleCloseTab,
    handleTabRename,
    handleNewNote,
    setFolders,
    setActiveFolder,
    handleNewFolder,
    toggleFolderExpanded,
    setIsLoadingContent,
    handleEditorChange,
    isGenerating,
    templateError,
    showTemplateConfirmation,
    selectedTemplateType,
    pendingSourceNoteId,
    setIsGenerating,
    setTemplateError,
    setShowTemplateConfirmation,
    setSelectedTemplateType,
    setPendingSourceNoteId,
    handleTemplateSelect,
    handleConfirmTemplateGeneration,
    handleCancelTemplateGeneration,
    getTemplateButtonClass,
    associateFileWithFolder,
    getFileFolderId
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Create custom hook for using this context
export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};