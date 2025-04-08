import React from 'react';
import RichTextEditor from './RichTextEditor';
import { useEditorContext } from '../context/EditorContext';

interface EditorContentProps {
    onDeleteNote?: () => void;
}

const EditorContent: React.FC<EditorContentProps> = ({ onDeleteNote }) => {
    const {
        state,
        updateNoteContent,
    } = useEditorContext();

    const { activeTabId, notesById, isLoadingContent } = state;

    const activeNote = activeTabId ? notesById[activeTabId] : null;

    const handleEditorChange = (newValue: any) => {
        if (activeNote) {
            updateNoteContent(activeNote.id, newValue);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Content Area */}
            <div className="flex-1">
                {isLoadingContent ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                        <svg className="animate-spin h-8 w-8 text-storai-teal mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>Loading file content...</p>
                    </div>
                ) : activeNote ? (
                    <div className="h-full p-2">
                        <RichTextEditor
                            key={activeNote.id}
                            onDeleteFile={onDeleteNote}
                            value={activeNote.content}
                            onChange={handleEditorChange}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg">No document selected</p>
                        <p className="text-sm">Select a note from the sidebar or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(EditorContent);