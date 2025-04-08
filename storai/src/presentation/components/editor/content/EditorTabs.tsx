import React from 'react';
import { useEditorContext, NoteEntity, TabData } from '../context/EditorContext';

const EditorTabs: React.FC = () => {
    const {
        state,
        activateTab,
        closeTab,
        renameNote,
        setNoteRenaming,
    } = useEditorContext();

    const { tabs, activeTabId, notesById } = state;

    const handleCloseClick = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        closeTab(tabId);
    };

    const handleRenameDoubleClick = (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNoteRenaming(noteId, true);
    };

    const handleRenameSubmit = (noteId: string, newName: string) => {
        renameNote(noteId, newName);
    };

    const handleRenameCancel = (noteId: string) => {
        setNoteRenaming(noteId, false);
    };

    return (
        <div className="w-full overflow-hidden bg-[--color-storai-light-gray] border-gray-200">
            <div className="overflow-x-auto no-scrollbar">
                <div className="inline-flex">
                    {tabs.map(tab => {
                        const note = notesById[tab.noteId];

                        if (!note) {
                            console.warn(`Note for tab ${tab.id} (Note ID: ${tab.noteId}) not found.`);
                            return null;
                        }

                        return (
                            <div
                                key={tab.id}
                                className={`flex-none flex items-center px-4 py-2 cursor-pointer border-gray-200 last:border-r-0  max-w-[200px] ${
                                    activeTabId === tab.id
                                        ? 'bg-white border-t border-gray-200 rounded-t-[8px] shadow-[rgba(0,0,0,0.04)_0px_-2px_4px_0px]'
                                        : 'bg-[--color-storai-light-gray] hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => activateTab(tab.id)}
                            >
                                {note.isRenaming ? (
                                    <input
                                        type="text"
                                        className="w-24 px-1 py-0 text-sm border border-gray-300 rounded bg-white"
                                        defaultValue={note.title}
                                        autoFocus
                                        onBlur={(e) => handleRenameSubmit(note.id, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleRenameSubmit(note.id, (e.target as HTMLInputElement).value);
                                            }
                                            if (e.key === 'Escape') {
                                                handleRenameCancel(note.id);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label="Rename tab"
                                        placeholder="Tab name"
                                    />
                                ) : (
                                    <span
                                        className={`text-sm ${activeTabId === tab.id ? 'text-gray-700' : ''} truncate pr-1`}
                                        onDoubleClick={(e) => handleRenameDoubleClick(note.id, e)}
                                        title={note.title}
                                    >
                                        {note.title}
                                    </span>
                                )}

                                <button
                                    className="ml-2 text-gray-400 hover:text-gray-700"
                                    onClick={(e) => handleCloseClick(tab.id, e)}
                                    aria-label="Close tab"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(EditorTabs);