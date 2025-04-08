import { useCallback } from 'react';
import { FileServiceFactory } from '../../../../infrastructure/storage/FileServiceFactory';
import { textToSlateValue } from '../utils/textFormatting';
import { useEditorContext } from '../context/EditorContext';

export const useFileOpener = () => {
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

  const openFile = useCallback(async (file: any) => {
    try {
      setIsLoadingContent(true);
      const fileService = await FileServiceFactory.getService();
      const content = await fileService.readFileAsText(file.path);
      
      // Check if this file has a specific folder association
      const associatedFolderId = localStorage.getItem(`file_folder_${file.id}`) || activeFolder?.id || '';
      
      // Create a fresh content object using textToSlateValue
      const fileContent = JSON.parse(JSON.stringify(textToSlateValue(content || `Unable to read content from ${file.name}`)));

      const fileTab = {
        id: `note-${file.id}`,
        title: file.name,
        type: 'note',
        content: fileContent,
        folderId: associatedFolderId
      };

      // Check if tab already exists
      if (!tabs.some(tab => tab.id === fileTab.id)) {
        setTabs(prev => [...prev, {
          ...fileTab,
          type: 'note' as 'note' | 'template'
        }]);
        
        // Add to the associated folder
        setFolders(prev => 
          prev.map(folder => 
            folder.id === associatedFolderId 
              ? { 
                ...folder, 
                notes: folder.notes?.some(note => note.id === fileTab.id)
                  ? folder.notes
                  : [...(folder.notes || []), JSON.parse(JSON.stringify(fileTab))]
                }
              : folder
          )
        );

        // If the associated folder isn't the active folder, activate it
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
            setActiveFolder({...folderToActivate});
          }
        }
      }

      setActiveTabId(fileTab.id);
    } catch (error) {
      console.error('Error opening file:', error);
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  return { openFile };
};