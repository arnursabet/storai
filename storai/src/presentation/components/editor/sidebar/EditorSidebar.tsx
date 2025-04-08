import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditorContext, NoteEntity, FolderData } from '../context/EditorContext';
import FolderItem from './components/FolderItem';
import NoteItem from './components/NoteItem';

const EditorSidebar: React.FC = () => {
  const navigate = useNavigate();
  // Get state and relevant action helpers from the context
  const {
    state,
    handleNewFolder,
    setActiveFolder,
    toggleFolderExpanded,
    renameFolder,
    setFolderRenaming,
    activateTab,
    renameNote,
    addTab,
    setNoteRenaming,
  } = useEditorContext();

  const { notesById, folders } = state;

  console.log(`[EditorSidebar] Rendering. Notes count: ${Object.keys(notesById).length}`); // Log on render

  return (
    <div className="w-[20%] bg-[--color-storai-light-gray] flex flex-col">
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
            <svg width="14" height="16" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.98239 3.5808L6.47689 2.30829C6.56082 2.09364 6.70779 1.90946 6.89846 1.77999C7.08913 1.65052 7.31454 1.58185 7.54501 1.58302H8.47138C8.701 1.58285 8.92533 1.65199 9.11502 1.78139C9.30471 1.91079 9.45093 2.09443 9.53455 2.30829L10.0291 3.5808L11.6774 4.53684L13.029 4.33244C13.255 4.29908 13.4858 4.33436 13.6916 4.43369C13.8973 4.53303 14.0684 4.69185 14.1829 4.88958L14.6477 5.69397C14.7621 5.89278 14.814 6.12143 14.7967 6.35016C14.7793 6.57888 14.6935 6.79709 14.5504 6.97637L13.6982 8.04449V9.95656L14.5504 11.0247C14.6935 11.204 14.7793 11.4222 14.7967 11.6509C14.814 11.8796 14.7621 12.1083 14.6477 12.3071L14.1829 13.1115C14.0684 13.3092 13.8973 13.468 13.6916 13.5674C13.4858 13.6667 13.255 13.702 13.029 13.6686L11.6774 13.4642L10.0291 14.4202L9.53455 15.6928C9.45093 15.9066 9.30471 16.0903 9.11502 16.2197C8.92533 16.3491 8.701 16.4182 8.47138 16.418H7.54501C7.31539 16.4182 7.09106 16.3491 6.90137 16.2197C6.71168 16.0903 6.56546 15.9066 6.48184 15.6928L5.98734 14.4202L4.339 13.4642L2.98737 13.6686C2.76137 13.702 2.53055 13.6667 2.32483 13.5674C2.11911 13.468 1.94795 13.3092 1.83353 13.1115L1.35222 12.3071C1.2378 12.1083 1.18588 11.8796 1.20322 11.6509C1.22057 11.4222 1.30637 11.204 1.44947 11.0247L2.30166 9.95656V8.04449L1.44947 6.97637C1.30637 6.79709 1.22057 6.57888 1.20322 6.35016C1.18588 6.12143 1.2378 5.89278 1.35222 5.69397L1.81705 4.88958C1.93147 4.69185 2.10262 4.53303 2.30835 4.43369C2.51407 4.33436 2.74488 4.29908 2.97088 4.33244L4.32252 4.53684L5.98239 3.5808ZM5.94778 9.00053C5.94778 9.54698 6.16485 10.0711 6.55126 10.4575C6.93766 10.8439 7.46174 11.0609 8.00819 11.0609C8.55465 11.0609 9.07873 10.8439 9.46513 10.4575C9.85153 10.0711 10.0686 9.54698 10.0686 9.00053C10.0686 8.45407 9.85153 7.92999 9.46513 7.54359C9.07873 7.15719 8.55465 6.94011 8.00819 6.94011C7.46174 6.94011 6.93766 7.15719 6.55126 7.54359C6.16485 7.92999 5.94778 8.45407 5.94778 9.00053Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </button>
          <button 
            className="text-gray-400 hover:text-gray-600"
            aria-label="View options"
            title="View options"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.88934 1.44616V14.5657M1.19995 3.07606C1.19995 2.04005 2.0398 1.2002 3.07581 1.2002H12.9241C13.9601 1.2002 14.8 2.04005 14.8 3.07606V12.9243C14.8 13.9604 13.9601 14.8002 12.9241 14.8002H3.07581C2.0398 14.8002 1.19995 13.9604 1.19995 12.9243V3.07606Z" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
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
            className="w-full bg-white shadow-sm rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-0"
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
                onSetActiveFolder={setActiveFolder}
                onToggleExpand={toggleFolderExpanded}
                onRenameFolder={renameFolder}
                onSetRenaming={setFolderRenaming}
              />
              
              {/* Folder Contents */}
              {folder.isExpanded && (
                <div className="ml-6 mt-1 mb-2 space-y-1">
                  {(folder.noteIds && folder.noteIds.length > 0) ? (
                    folder.noteIds.map(noteId => {
                      const note = notesById[noteId];
                      console.log(`[EditorSidebar] Mapping noteId ${noteId}. Found note: ${!!note}. isRenaming: ${note?.isRenaming}`);
                      if (!note) {
                        console.warn(`Note with ID ${noteId} referenced in folder ${folder.id} but not found in notesById.`);
                        return null;
                      }
                      return (
                        <NoteItem
                          key={note.id}
                          note={note}
                          onActivateNote={activateTab}
                          onRenameNote={renameNote}
                          addTab={addTab}
                          onSetRenaming={setNoteRenaming}
                        />
                      );
                    })
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
        <div className="p-10 border-gray-100 mt-5">
          <button 
            onClick={handleNewFolder}
            className="w-full m-auto flex items-center justify-center p-2 bg-storai-teal text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            <svg className="mr-2" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.375V13.625M13.625 8H2.375" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

            New Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
