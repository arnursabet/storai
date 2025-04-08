import React from 'react';
import { FolderData } from '../../context/EditorContext';

interface FolderItemProps {
  folder: FolderData;
  onSetActiveFolder: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onSetRenaming: (folderId: string, isRenaming: boolean) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  onSetActiveFolder,
  onToggleExpand,
  onRenameFolder,
  onSetRenaming
}) => {
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetRenaming(folder.id, true);
  };

  return (
    <div key={folder.id}>
      <div 
        className={`flex items-center py-4 px-2 rounded-md cursor-pointer ${folder.isActive ? 'bg-white shadow-sm' : 'hover:bg-gray-50'}`}
        onClick={() => onSetActiveFolder(folder.id)}
      >
        <button 
          className="text-gray-400 hover:text-gray-600 mr-1"
          onClick={handleToggleClick}
          aria-label={folder.isExpanded ? "Collapse folder" : "Expand folder"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${folder.isExpanded ? 'transform rotate-90' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        
        {folder.isRenaming ? (
          <input
            type="text"
            className="flex-1 text-gray-700 bg-white border border-gray-200 rounded px-1 py-0 text-sm"
            defaultValue={folder.name}
            autoFocus
            onBlur={(e) => onRenameFolder(folder.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRenameFolder(folder.id, (e.target as HTMLInputElement).value);
              }
              if (e.key === 'Escape') {
                onSetRenaming(folder.id, false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Rename folder"
            placeholder="Folder name"
          />
        ) : (
          <span 
            className="text-gray-700 flex-1"
            onClick={handleRenameClick}
          >
            {folder.name}
          </span>
        )}
      </div>
    </div>
  )
}

export default React.memo(FolderItem);