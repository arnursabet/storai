import React from 'react';
import { NoteEntity, useEditorContext } from '../../context/EditorContext';

interface NoteItemProps {
  note: NoteEntity;
  onActivateNote: (noteId: string) => void;
  addTab: (noteId: string) => void;
  onRenameNote: (noteId: string, newName: string) => void;
  onSetRenaming: (noteId: string, isRenaming: boolean) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onActivateNote,
  addTab,
  onRenameNote,
  onSetRenaming
}) => {
  const { state } = useEditorContext();
  const { activeTabId, tabs } = state;

  const handleActivateClick = () => {
    const tabExists = tabs.some(tab => tab.noteId === note.id);

    if (!tabExists) {
      console.log(`Tab for note ${note.id} not found. Adding tab...`);
      addTab(note.id);
    }

    onActivateNote(note.id);
  };

  const handleRenameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[NoteItem] handleRenameDoubleClick called for note: ${note.id}`);
    onSetRenaming(note.id, true);
  };

  const handleRenameSubmit = (newName: string) => {
    onRenameNote(note.id, newName);
  };

  const handleRenameCancel = () => {
    onSetRenaming(note.id, false);
  };

  console.log(`[NoteItem] Rendering note ${note.id}. isRenaming: ${note.isRenaming}`);

  return (
    <div
      className={`flex items-center p-1.5 text-sm rounded-md cursor-pointer ${
        activeTabId === note.id ? 'bg-white shadow-sm' : 'hover:bg-gray-50'
      }`}
      onClick={handleActivateClick}
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
          onBlur={(e) => handleRenameSubmit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRenameSubmit((e.target as HTMLInputElement).value);
            }
            if (e.key === 'Escape') {
              handleRenameCancel();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Rename note"
          placeholder="Note name"
        />
      ) : (
        <span
          className="text-gray-700 flex-1 truncate pr-1"
          onDoubleClick={handleRenameDoubleClick}
          title={note.title}
        >
          {note.title}
        </span>
      )}
    </div>
  );
};

export default NoteItem;