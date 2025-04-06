import React from 'react';
import { TabData } from '../../../types';
import { useEditorContext } from '../../context/EditorContext';

interface NoteItemProps {
  note: TabData;
}

const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
    const { activeTabId, setActiveTabId, tabs, setTabs, handleTabRename, setFolders } = useEditorContext();
    
    const openNoteFromFolder = () => {
      console.log(`Opening note from folder: ${note.title}`);
      
      // Create a fresh copy of the note
      const freshNoteCopy = JSON.parse(JSON.stringify(note));
      
      // Check if tab is already open
       if (!tabs.some(tab => tab.id === note.id)) {
        console.log(`Adding tab for note ${note.title} with content:`, 
            JSON.stringify(freshNoteCopy.content).substring(0, 100) + '...');
        setTabs(prev => [...prev, freshNoteCopy]);
      }
      setActiveTabId(note.id);
    };
    
    // Start renaming note
    const startRenamingNote = (e: React.MouseEvent) => {
      console.log(`Starting to rename note ${note.title}`);
      e.stopPropagation(); // Prevent note opening

      // Update isRenaming in tabs array
      setTabs(prev => 
        prev.map(tab => 
          tab.id === note.id 
            ? { ...tab, isRenaming: true }
            : { ...tab, isRenaming: false }
        )
      );

      // Update isRenaming in folder's notes array
      setFolders(prev => 
        prev.map(folder => {
          if (!folder.notes) return folder;
          
          return {
            ...folder,
            notes: folder.notes.map(n => 
              n.id === note.id 
                ? { ...n, isRenaming: true }
                : { ...n, isRenaming: false }
            )
          };
        })
      );
    };

    // Save note name
    const saveNoteName = (newName: string) => {
      handleTabRename(note.id, newName);
      // handleTabRename already handles setting isRenaming to false in both tabs and folders
    };
    
    return (
        <div 
            className={`flex items-center p-1.5 text-sm rounded-md cursor-pointer ${
            activeTabId === note.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onClick={openNoteFromFolder}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {note.isRenaming ? (
                <input
                    type="text"
                    className="flex-1 px-1 py-0 text-sm border border-gray-300 rounded"
                    defaultValue={note.title}
                    autoFocus
                    onBlur={(e) => saveNoteName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            saveNoteName((e.target as HTMLInputElement).value);
                        }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Rename note"
                    placeholder="Note name"
                />
            ) : (
                <span 
                    className="text-gray-700"
                    onDoubleClick={startRenamingNote}
                >
                    {note.title}
                </span>
            )}
        </div>
    );
};
  
export default React.memo(NoteItem);