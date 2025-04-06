import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorContext } from '../context/EditorContext';
import FolderItem from './components/FolderItem';
import NoteItem from './components/NoteItem';

const EditorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { folders, setFolders, handleNewFolder } = useEditorContext();

  // Begin renaming a folder
  const startRenamingFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent folder selection when clicking the name
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isRenaming: true }
          : { ...folder, isRenaming: false }
      )
    );
  };

  // Save folder name
  const handleFolderRename = (folderId: string, newName: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName.trim() || 'Untitled Folder', isRenaming: false }
          : folder
      )
    );
  };

  return (
    <div className="w-64 bg-[--color-storai-light-gray] flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-gray-800">First Last</div>
        </div>
        <div className="ml-auto flex">
          <button 
            className="text-gray-400 hover:text-gray-600 mr-2"
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for notes..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm"
            aria-label="Search for notes"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notes History Section */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-6 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Notes History
        </div>

        {/* Folders */}
        <div className="space-y-1 px-5">
          {folders.map(folder => (
            <div key={folder.id}>
              <FolderItem
                folder={folder}
                onRenameFolder={handleFolderRename}
                onStartRenaming={startRenamingFolder}
              />
              
              {/* Folder Contents */}
              {folder.isExpanded && (
                <div className="ml-6 mt-1 mb-2 space-y-1">
                  {folder.notes && folder.notes.length > 0 ? (
                    folder.notes.map(note => (
                      <NoteItem key={note.id} note={note} />
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 p-1.5">
                      No notes in this folder
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* New Folder Button */}
        <div className="p-4 border-gray-100 mt-5">
          <button 
            onClick={handleNewFolder}
            className="w-full flex items-center justify-center p-2 bg-storai-teal text-white rounded-md hover:bg-storai-teal transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EditorSidebar);
