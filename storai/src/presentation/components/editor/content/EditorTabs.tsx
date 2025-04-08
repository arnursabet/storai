import React, { useState } from 'react';
import { useEditorContext } from '../context/EditorContext';

const EditorTabs: React.FC = () => {
    const { tabs, activeTabId, handleTabClick, handleCloseTab, handleTabRename } = useEditorContext();
    const [editingTabId, setEditingTabId] = useState<string | null>(null); 

    // Begin renaming a tab
    const startRenamingTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent tab selection
        setEditingTabId(tabId);
    };

    // Save tab name
    const saveTabName = (tabId: string, newName: string) => {
        handleTabRename(tabId, newName);
        setEditingTabId(null);
    };

    return (
        <div className="flex bg-[--color-storai-light-gray]">
            {tabs.map(tab => (
                <div
                    key={tab.id} 
                    className={`flex items-center px-4 py-2 cursor-pointer ${activeTabId === tab.id ? 'bg-white border-t border-gray-200 rounded-t-[8px] shadow-[rgba(0, 0, 0, 0.1)_1px_-2px_5px_0px]' : 'bg-[--color-storai-light-gray] hover:bg-gray-100'}`}
                    onClick={() => handleTabClick(tab.id)}
                >
                    {editingTabId === tab.id ? (
                        <input
                            type="text"
                            title={tab.title}
                            placeholder={tab.title}
                            className="w-24 px-1 py-0 text-sm border border-gray-300 rounded"
                            defaultValue={tab.title}
                            autoFocus
                            onBlur={(e) => saveTabName(tab.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    saveTabName(tab.id, (e.target as HTMLInputElement).value);
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span 
                            className="text-sm text-gray-700"
                            onDoubleClick={(e) => startRenamingTab(tab.id, e)}
                        >
                            {tab.title}
                        </span>
                    )}

                    <button 
                        className="ml-2 text-gray-400 hover:text-gray-700"
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        aria-label="Close tab"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default React.memo(EditorTabs);