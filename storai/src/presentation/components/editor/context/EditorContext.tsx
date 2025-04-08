import React, { createContext, useReducer, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Descendant } from 'slate';
import { createEmptyContent, slateToPlainText, textToSlateValue } from '../utils/textFormatting'; // Assuming textToSlateValue handles text -> Descendant[]
import { TemplateType } from '../../../../domain/entities/Template';
import { LLMServiceFactory } from '../../../../infrastructure/llm/LLMServiceFactory';

// Normalized Note/Template Data (Single Source of Truth)
export interface NoteEntity {
    id: string; // Corresponds to TabData.id or a generated ID
    title: string;
    content: Descendant[];
    type: 'note' | 'template';
    folderId: string; // Which folder it belongs to
    templateType?: TemplateType; // Only if type === 'template'
    sourceNoteId?: string;      // Only if type === 'template'
    isRenaming?: boolean;       // UI state for renaming in sidebar
}

// Updated Folder Structure
export interface FolderData {
    id: string;
    name: string;
    isActive: boolean;
    isExpanded?: boolean;
    isRenaming?: boolean; // Keep UI state here
    noteIds: string[]; // Reference notes by ID
}

// Updated Tab Structure (references NoteEntity)
export interface TabData {
    id: string; // Same as NoteEntity.id
    noteId: string; // Explicit reference to the note entity
}

// --- State ---
export interface EditorState {
    notesById: Record<string, NoteEntity>; // Normalized notes/templates
  folders: FolderData[];
    tabs: TabData[]; // Open tabs
    activeTabId: string | null; // ID of the active tab (which is also the note ID)
    activeFolderId: string | null;

    // UI / Process State
    isInitialized: boolean;
  isLoadingContent: boolean;
  isGenerating: boolean;
  templateError: string | null;
  showTemplateConfirmation: boolean;
    selectedTemplateType: TemplateType | null; // For modal
    pendingSourceNoteId: string | null;       // For modal
}

// --- Actions ---
export type EditorAction =
    // Note/Tab Actions
    | { type: 'ADD_NOTE'; payload: { note: NoteEntity; activate: boolean } }
    | { type: 'UPDATE_NOTE_CONTENT'; payload: { noteId: string; content: Descendant[] } }
    | { type: 'RENAME_NOTE'; payload: { noteId: string; newName: string } }
    | { type: 'SET_NOTE_RENAMING'; payload: { noteId: string; isRenaming: boolean } }
    | { type: 'DELETE_NOTE'; payload: { noteId: string } }
    | { type: 'ACTIVATE_TAB'; payload: { tabId: string } } // tabId is noteId
    | { type: 'ADD_TAB'; payload: { noteId: string } }
    | { type: 'CLOSE_TAB'; payload: { tabId: string } } // tabId is noteId
    // Folder Actions
    | { type: 'ADD_FOLDER'; payload: { folder: FolderData } }
    | { type: 'RENAME_FOLDER'; payload: { folderId: string; newName: string } }
    | { type: 'SET_FOLDER_RENAMING'; payload: { folderId: string; isRenaming: boolean } }
    | { type: 'SET_ACTIVE_FOLDER'; payload: { folderId: string } }
    | { type: 'TOGGLE_FOLDER_EXPANDED'; payload: { folderId: string } }
    | { type: 'DELETE_FOLDER'; payload: { folderId: string } } // Example: Added delete
    // Template Generation Process
    | { type: 'INITIATE_TEMPLATE_GENERATION'; payload: { templateType: TemplateType; sourceNoteId: string } }
    | { type: 'CONFIRM_TEMPLATE_GENERATION'; payload: { generatedNote: NoteEntity } } // Pass the full new note
    | { type: 'CANCEL_TEMPLATE_GENERATION' }
    | { type: 'SET_TEMPLATE_GENERATING'; payload: boolean }
    | { type: 'SET_TEMPLATE_ERROR'; payload: string | null }
    // Loading State
    | { type: 'SET_LOADING_CONTENT'; payload: boolean }
    // Initialization
    | { type: 'INITIALIZE_STATE'; payload: { notes: NoteEntity[]; folders: FolderData[], tabs?: TabData[]; activeTabId?: string | null  } } // For loading saved state
    | { type: 'SET_INITIALIZED' }

// --- Context Type ---
interface EditorContextType {
  state: EditorState;
  // Helper Action Functions
  addNote: (note: Omit<NoteEntity, 'folderId' | 'isRenaming'>, activate?: boolean) => void; // Automatically use active folder
  updateNoteContent: (noteId: string, content: Descendant[]) => void;
  renameNote: (noteId: string, newName: string) => void;
  setNoteRenaming: (noteId: string, isRenaming: boolean) => void;
  activateTab: (tabId: string) => void;
  addTab: (noteId: string) => void;
  closeTab: (tabId: string) => void;
  handleNewNote: () => void; // Specific action for UI button
  addFolder: (folderData: Omit<FolderData, 'id' | 'noteIds' | 'isActive' | 'isExpanded' | 'isRenaming'>) => void; // Simplify adding
  renameFolder: (folderId: string, newName: string) => void;
  setFolderRenaming: (folderId: string, isRenaming: boolean) => void;
  setActiveFolder: (folderId: string) => void;
  toggleFolderExpanded: (folderId: string) => void;
  handleNewFolder: () => void; // Specific action for UI button
  initiateTemplateGeneration: (templateType: TemplateType, sourceNoteId: string) => void;
  confirmTemplateGeneration: () => void; 
  cancelTemplateGeneration: () => void;
  generateAndAddTemplate: (templateType: TemplateType, sourceNoteId: string) => Promise<void>;
  setTemplateGenerating: (generating: boolean) => void;
  setTemplateError: (error: string | null) => void;
  setLoadingContent: (loading: boolean) => void;
  getTemplateButtonClass: (buttonTemplateType: TemplateType) => string; // Recalculate based on new state
  initializeState: (notes: NoteEntity[], folders: FolderData[]) => void;
  handleTemplateSelect: (templateType: TemplateType) => void; // Keep UI interaction logic separate
  deleteNote: (noteId: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// --- Reducer ---
const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
    // Check if payload exists before accessing it
    console.log("Reducer Action:", action.type, ('payload' in action ? action.payload : '')); // Debugging
    switch (action.type) {
        // --- Note/Tab ---
        case 'ADD_NOTE': {
            const { note, activate } = action.payload;

             // Check 1: Ensure valid folderId
             if (!note.folderId || !state.folders.some(f => f.id === note.folderId)) {
                 console.error("Cannot add note: Invalid or missing folderId", note);
                 return state;
             }

             // Check 2: Prevent adding duplicate note ID
            if (state.notesById[note.id]) {
                console.warn(`Attempted to add duplicate note ID: ${note.id}. Ensuring tab/activation state.`);
                 // Note already exists, but ensure tab is open and activated if needed.
                const isTabOpen = state.tabs.some(t => t.noteId === note.id);
                let newState = { ...state }; // Start with current state
                if (!isTabOpen) {
                    // If tab isn't open, add it.
                     newState.tabs = [...state.tabs, { id: note.id, noteId: note.id }];
                }
                 if (activate) {
                     // If activation is requested, update active IDs and folder state.
                    newState.activeTabId = note.id;
                    newState.activeFolderId = note.folderId;
                    newState.folders = newState.folders.map(f => ({ ...f, isActive: f.id === note.folderId }));
                 }
                // Return the potentially modified state (for tab/activation) but do not re-add note data.
                 return newState;
             }

             // Note is new, proceed with adding
            const newState = {
                ...state,
                notesById: {
                    ...state.notesById,
                    [note.id]: note,
                },
                // Add note ID to its folder (only runs for new notes now)
                folders: state.folders.map(f =>
                    f.id === note.folderId
                        ? { ...f, noteIds: [...(f.noteIds || []), note.id], isExpanded: true } // Ensure folder is expanded
                        : f
                ),
                 // Add tab (guaranteed not open due to the earlier check)
                 tabs: [...state.tabs, { id: note.id, noteId: note.id }],
            };
            if (activate) {
                newState.activeTabId = note.id;
                newState.activeFolderId = note.folderId;
                // Update folder active state
                newState.folders = newState.folders.map(f => ({ ...f, isActive: f.id === note.folderId }));
            }
            return newState;
        }
        case 'UPDATE_NOTE_CONTENT': {
            const { noteId, content } = action.payload;
            if (!state.notesById[noteId]) return state; // Note not found
            return {
                ...state,
                notesById: {
                    ...state.notesById,
                    [noteId]: { ...state.notesById[noteId], content },
                },
            };
        }
        case 'RENAME_NOTE': {
            const { noteId, newName } = action.payload;
            if (!state.notesById[noteId]) return state;
            return {
                ...state,
                notesById: {
                    ...state.notesById,
                    [noteId]: {
                        ...state.notesById[noteId],
                        title: newName.trim() || 'Untitled Note',
                        isRenaming: false,
                    },
                },
            };
        }
       case 'SET_NOTE_RENAMING': {
            const { noteId, isRenaming } = action.payload;
             if (!state.notesById[noteId]) return state;

           console.log(`[Reducer SET_NOTE_RENAMING] Before update for ${noteId}:`, { currentIsRenaming: state.notesById[noteId]?.isRenaming, targetValue: isRenaming });

           // Create a new notesById map with updated isRenaming flags
           const newNotesById = Object.fromEntries(
               Object.entries(state.notesById).map(([id, note]) => {
                   if (id === noteId) {
                       // Update the target note
                       return [id, { ...note, isRenaming }];
                   } else if (isRenaming && note.isRenaming) {
                       // If setting one to true, ensure others are false
                       return [id, { ...note, isRenaming: false }];
                   } else {
                       // Keep other notes as they are
                       return [id, note];
                   }
               })
           );

           console.log(`[Reducer SET_NOTE_RENAMING] After update for ${noteId}:`, { newIsRenaming: newNotesById[noteId]?.isRenaming });

           return { ...state, notesById: newNotesById };
        }
        case 'ACTIVATE_TAB': {
            const { tabId } = action.payload;
            const note = state.notesById[tabId];
            if (!note) return state; // Tab/Note doesn't exist

            return {
                ...state,
                activeTabId: tabId,
                activeFolderId: note.folderId,
                folders: state.folders.map(f => ({ ...f, isActive: f.id === note.folderId }))
            };
        }
         case 'ADD_TAB': {
            const { noteId } = action.payload;
            if (!state.notesById[noteId] || state.tabs.some(t => t.noteId === noteId)) {
                return state; // Note doesn't exist or tab already open
            }
            return {
                ...state,
                tabs: [...state.tabs, { id: noteId, noteId: noteId }],
            };
        }
        case 'CLOSE_TAB': {
            const { tabId } = action.payload;
            const remainingTabs = state.tabs.filter(tab => tab.id !== tabId);
            let newActiveTabId = state.activeTabId;

            if (state.activeTabId === tabId) {
                // If closing the active tab, activate the first remaining tab or null
                newActiveTabId = remainingTabs.length > 0 ? remainingTabs[0].id : null;
            }

            let newActiveFolderId = state.activeFolderId;
            let updatedFolders = state.folders;
            if (newActiveTabId) {
                 const newActiveNote = state.notesById[newActiveTabId];
                 if (newActiveNote) {
                    newActiveFolderId = newActiveNote.folderId;
                    updatedFolders = state.folders.map(f => ({ ...f, isActive: f.id === newActiveFolderId }));
                 }
            } else {
                // No tabs left, set first folder active if available
                 newActiveFolderId = state.folders.length > 0 ? state.folders[0].id : null;
                 updatedFolders = state.folders.map(f => ({ ...f, isActive: f.id === newActiveFolderId }));
            }

            return {
                ...state,
                tabs: remainingTabs,
                activeTabId: newActiveTabId,
                activeFolderId: newActiveFolderId,
                folders: updatedFolders,
            };
        }
        case 'DELETE_NOTE': {
            const { noteId } = action.payload;
            const noteToDelete = state.notesById[noteId];
            if (!noteToDelete) return state; // Note doesn't exist

            // 1. Remove note from notesById
            const { [noteId]: _, ...remainingNotesById } = state.notesById;

            // 2. Remove note ID from its folder
            const updatedFolders = state.folders.map(f =>
                f.id === noteToDelete.folderId
                    ? { ...f, noteIds: f.noteIds.filter(id => id !== noteId) }
                    : f
            );

            // 3. Remove tab and determine new active state (similar to CLOSE_TAB)
            const remainingTabs = state.tabs.filter(tab => tab.id !== noteId);
            let newActiveTabId = state.activeTabId;

            if (state.activeTabId === noteId) {
                // If deleting the active tab, activate the first remaining tab or null
                newActiveTabId = remainingTabs.length > 0 ? remainingTabs[0].id : null;
            }

            let newActiveFolderId = state.activeFolderId;
            let finalFolders = updatedFolders;

            if (newActiveTabId) {
                const newActiveNote = remainingNotesById[newActiveTabId];
                if (newActiveNote) {
                    newActiveFolderId = newActiveNote.folderId;
                    // Ensure the new active folder's state is correctly set
                    finalFolders = updatedFolders.map(f => ({ ...f, isActive: f.id === newActiveFolderId }));
                } else {
                    // Should not happen if remainingTabs is consistent with remainingNotesById
                    console.warn("Inconsistency: New active tab ID exists but note not found after deletion.");
                    newActiveTabId = null; // Reset active tab if note is missing
                }
            }

            if (!newActiveTabId) {
                // No tabs left, or inconsistency found
                // If there are still folders, make the first one active
                const firstFolder = finalFolders.find(f => f.id === state.activeFolderId) || finalFolders[0];
                newActiveFolderId = firstFolder ? firstFolder.id : null;
                finalFolders = finalFolders.map(f => ({ ...f, isActive: f.id === newActiveFolderId }));
            }

            return {
                ...state,
                notesById: remainingNotesById,
                folders: finalFolders,
                tabs: remainingTabs,
                activeTabId: newActiveTabId,
                activeFolderId: newActiveFolderId,
            };
        }

        // --- Folder ---
        case 'ADD_FOLDER':
            // Ensure ID is unique if needed, basic add here
            return { ...state, folders: [...state.folders, action.payload.folder] };
        case 'RENAME_FOLDER':
            return {
                ...state,
                folders: state.folders.map(f =>
                    f.id === action.payload.folderId
                        ? { ...f, name: action.payload.newName.trim() || 'Untitled Folder', isRenaming: false }
                        : f
                ),
            };
         case 'SET_FOLDER_RENAMING': {
            const { folderId, isRenaming } = action.payload;
             return {
                 ...state,
                 folders: state.folders.map(f => ({
                     ...f,
                     isRenaming: f.id === folderId ? isRenaming : (isRenaming ? false : f.isRenaming) // Reset others if setting one to true
                 }))
             };
        }
        case 'SET_ACTIVE_FOLDER': {
             const folderExists = state.folders.some(f => f.id === action.payload.folderId);
             if (!folderExists) return state;
            return {
                ...state,
                activeFolderId: action.payload.folderId,
                folders: state.folders.map(f => ({ ...f, isActive: f.id === action.payload.folderId }))
            };
        }
        case 'TOGGLE_FOLDER_EXPANDED':
            return {
                ...state,
                folders: state.folders.map(f =>
                    f.id === action.payload.folderId ? { ...f, isExpanded: !f.isExpanded } : f
                ),
            };

        // --- Template ---
        case 'INITIATE_TEMPLATE_GENERATION':
            return {
                ...state,
                showTemplateConfirmation: true,
                selectedTemplateType: action.payload.templateType,
                pendingSourceNoteId: action.payload.sourceNoteId,
                templateError: null, // Clear previous errors
            };
        case 'CONFIRM_TEMPLATE_GENERATION': {
            // Add the generated note/tab using ADD_NOTE logic
             const { generatedNote } = action.payload;
             const newState = editorReducer(state, { type: 'ADD_NOTE', payload: { note: generatedNote, activate: true }});
             // Reset template process state
            return {
                ...newState,
                isGenerating: false,
                showTemplateConfirmation: false,
                selectedTemplateType: null,
                pendingSourceNoteId: null,
            };
        }
        case 'CANCEL_TEMPLATE_GENERATION':
            return {
                ...state,
                showTemplateConfirmation: false,
                selectedTemplateType: null,
                pendingSourceNoteId: null,
                isGenerating: false, // Ensure generation stops
                templateError: null,
            };
        case 'SET_TEMPLATE_GENERATING':
            return { ...state, isGenerating: action.payload };
        case 'SET_TEMPLATE_ERROR':
            return { ...state, templateError: action.payload, isGenerating: false }; // Stop generation on error

        // --- Loading ---
        case 'SET_LOADING_CONTENT':
            return { ...state, isLoadingContent: action.payload };

        // --- Init ---
         case 'INITIALIZE_STATE': {
            const { notes, folders: initialFolders } = action.payload;
            const notesById = notes.reduce((acc, note) => {
                acc[note.id] = note;
                return acc;
            }, {} as Record<string, NoteEntity>);

             const activeFolder = initialFolders.find(f => f.isActive) ?? initialFolders[0];
             const activeFolderId = activeFolder?.id ?? null;
        
        return { 
                ...state, // Keep other UI states like template process? Or reset? Resetting here.
                notesById,
                folders: initialFolders,
                tabs: action.payload.tabs || [], // Start with no tabs open? Or derive from a saved state? Assuming empty start.
                activeTabId: action.payload.activeTabId || null,
                activeFolderId: activeFolderId,
                isLoadingContent: false,
                isGenerating: false,
                templateError: null,
                showTemplateConfirmation: false,
                selectedTemplateType: null,
                pendingSourceNoteId: null,
                isInitialized: false,
            };
        }
        case 'SET_INITIALIZED': {
            return { ...state, isInitialized: true };
        }

        default:
            // Provides type safety, ensures all actions are handled
             console.warn("Unhandled action:", action);
            return state;
    }
};

// --- Initial State ---
const initialFolders: FolderData[] = [
  { id: 'folder-1', name: 'My Notes', isActive: true, isExpanded: true, noteIds: [] },
  // Add more initial folders if needed
];

const initialState: EditorState = {
    notesById: {},
    folders: initialFolders,
    tabs: [],
    activeTabId: null,
    activeFolderId: initialFolders[0]?.id ?? null, // Default to first folder
    isInitialized: false,
    isLoadingContent: false,
    isGenerating: false,
    templateError: null,
    showTemplateConfirmation: false,
    selectedTemplateType: null,
    pendingSourceNoteId: null,
};


// --- Provider Component ---
export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

   // --- Persistence Example (Optional) ---
   useEffect(() => {
       let didInitialize = false;
       // Load state from local storage on mount
       console.log("[LOAD] Attempting to load state from localStorage..."); // 1. Entry log
       try {
           const savedState = localStorage.getItem('editorState');
           // 2. Log raw string (first 500 chars)
           console.log("[LOAD] Raw state string from localStorage:", savedState ? savedState.substring(0, 500) + '...' : 'null');

           if (savedState) {
                console.log("[LOAD] Parsing saved state..."); // 3. Before parsing
                let parsedState = null; // Define outside try block for logging
                try {
                    parsedState = JSON.parse(savedState);
                    // 4. Log parsed object IF parsing succeeds
                    console.log("[LOAD] Parsed state object:", parsedState);
                } catch (parseError) {
                    console.error("[LOAD] !!! JSON.parse FAILED:", parseError);
                    // Explicitly re-throw or handle, otherwise the outer catch might not see it clearly
                    throw parseError; // Ensure the outer catch block is triggered
                }

                // Basic validation
                console.log("[LOAD] Validating parsed state structure..."); // 5. Before validation
                if (parsedState && parsedState.notesById && parsedState.folders && parsedState.tabs && parsedState.activeTabId) {
                    // 6. Log validation success
                    console.log("[LOAD] Parsed state structure is valid.");
                     // Ensure folders have noteIds array if loading older state
                     const validatedFolders = parsedState.folders.map((f: FolderData) => ({ ...f, noteIds: f.noteIds ?? []}));
                     // Make sure isActive and isExpanded are handled - setting first folder active on load
                     const foldersWithActive = validatedFolders.map((f: FolderData, index: number) => ({ ...f, isActive: index === 0, isExpanded: f.isExpanded ?? (index === 0) }));
                     
                     // 7. Log the payload for INITIALIZE_STATE
                     console.log("[LOAD] Payload for INITIALIZE_STATE:", { notes: Object.values(parsedState.notesById), folders: foldersWithActive });

                     dispatch({ type: 'INITIALIZE_STATE', payload: { notes: Object.values(parsedState.notesById), folders: foldersWithActive, tabs: parsedState.tabs, activeTabId: parsedState.activeTabId } });
                     didInitialize = true; // Flag that we loaded from storage
                     console.log("[LOAD] INITIALIZE_STATE dispatched with loaded data.");
                } else {
                    // 6b. Log validation failure
                    console.warn("[LOAD] !!! Invalid parsed state structure found.", parsedState);
                }
           } else {
                console.log("[LOAD] No saved state string found in localStorage.");
           }
       } catch (error) {
           // 8. Log specific error during parsing/processing
           console.error("[LOAD] !!! Failed to parse or process saved state (outer catch):", error);
       } finally {
            // 9. Log entry into finally block and didInitialize status
            console.log(`[LOAD] Entering finally block. didInitialize = ${didInitialize}`);
            // Always signal initialization is complete, whether loaded or not
            if (!didInitialize) {
                 console.log("[LOAD] Initialization flag 'didInitialize' is false, proceeding with initial empty/default state.");
            }
            dispatch({ type: 'SET_INITIALIZED' });
            // 10. Log when SET_INITIALIZED is dispatched
            console.log("[LOAD] SET_INITIALIZED dispatched.");
       }
   }, []); // Run only on mount

   useEffect(() => {
       // Save state to local storage on change (debounce might be good here)
       if (!state.isInitialized) {
        console.log("--- Skipping save to localStorage: Context not initialized yet.");
        return;
       }
       try {
            // Only save the core data, not transient UI state
            const stateToSave = {
                notesById: state.notesById,
                folders: state.folders.map(f => ({ // Ensure only necessary folder data is saved
                    id: f.id,
                    name: f.name,
                    // isActive: f.isActive, // Don't save isActive, determine on load
                    isExpanded: f.isExpanded, // Save expanded state
                    noteIds: f.noteIds,
                })),
                // Optionally save activeFolderId / activeTabId if desired
                // activeFolderId: state.activeFolderId,
                tabs: state.tabs,
                activeTabId: state.activeTabId, 
            };
            // Log the state being saved for debugging
            console.log("--- Saving State to localStorage ---", JSON.stringify(stateToSave, null, 2));
            localStorage.setItem('editorState', JSON.stringify(stateToSave));
       } catch (error) {
            console.error("Failed to save state:", error);
       }
       // Limit dependencies to core data that needs saving
   }, [state.notesById, state.folders, state.tabs, state.activeTabId, state.isInitialized]); // Removed activeFolderId/activeTabId from deps if not saved


  // --- Helper Action Functions ---
  // Wrap dispatch calls in useCallback for performance

   // Define these first so they can be used in confirmTemplateGeneration dependencies
   const setTemplateGenerating = useCallback((generating: boolean) => {
     dispatch({ type: 'SET_TEMPLATE_GENERATING', payload: generating });
   }, []);
   const setTemplateError = useCallback((error: string | null) => {
     dispatch({ type: 'SET_TEMPLATE_ERROR', payload: error });
   }, []);

  const addNote = useCallback((noteData: Omit<NoteEntity, 'folderId' | 'isRenaming'>, activate: boolean = true) => {
      const note: NoteEntity = {
          ...noteData,
          folderId: state.activeFolderId || initialFolders[0].id, // Assign to active folder or default
          isRenaming: false,
      };
      dispatch({ type: 'ADD_NOTE', payload: { note, activate } });
  }, [state.activeFolderId]);

  const updateNoteContent = useCallback((noteId: string, content: Descendant[]) => {
    dispatch({ type: 'UPDATE_NOTE_CONTENT', payload: { noteId, content } });
  }, []);
  const renameNote = useCallback((noteId: string, newName: string) => {
    dispatch({ type: 'RENAME_NOTE', payload: { noteId, newName } });
  }, []);
   const setNoteRenaming = useCallback((noteId: string, isRenaming: boolean) => {
    dispatch({ type: 'SET_NOTE_RENAMING', payload: { noteId, isRenaming } });
  }, []);
  const activateTab = useCallback((tabId: string) => {
    dispatch({ type: 'ACTIVATE_TAB', payload: { tabId } });
  }, []);
  const addTab = useCallback((noteId: string) => {
     dispatch({ type: 'ADD_TAB', payload: { noteId } });
  }, []);
  const closeTab = useCallback((tabId: string) => {
    dispatch({ type: 'CLOSE_TAB', payload: { tabId } });
  }, []);

   const handleNewNote = useCallback(() => {
    const newNoteBase: Omit<NoteEntity, 'folderId' | 'isRenaming'> = {
      id: `note-new-${Date.now()}`,
      title: 'Untitled Note',
      type: 'note',
      content: createEmptyContent(), // Use newly created empty content
    };
    addNote(newNoteBase, true); // Use the addNote helper
  }, [addNote]); // Depends on addNote helper

  const addFolder = useCallback((folderData: Omit<FolderData, 'id' | 'noteIds' | 'isActive' | 'isExpanded' | 'isRenaming'>) => {
    const newFolder: FolderData = {
        ...folderData,
      id: `folder-${Date.now()}`,
        noteIds: [],
        isActive: false, // Don't activate new folders by default
        isExpanded: true,
        isRenaming: false,
     };
     dispatch({ type: 'ADD_FOLDER', payload: { folder: newFolder } });
  }, []);

   const handleNewFolder = useCallback(() => {
      addFolder({ name: `New Folder` }); // Use the addFolder helper
   }, [addFolder]);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    dispatch({ type: 'RENAME_FOLDER', payload: { folderId, newName } });
  }, []);
  const setFolderRenaming = useCallback((folderId: string, isRenaming: boolean) => {
    dispatch({ type: 'SET_FOLDER_RENAMING', payload: { folderId, isRenaming } });
  }, []);
  const setActiveFolder = useCallback((folderId: string) => {
    dispatch({ type: 'SET_ACTIVE_FOLDER', payload: { folderId } });
  }, []);
  const toggleFolderExpanded = useCallback((folderId: string) => {
    // Note: We need to stop propagation in the calling component (FolderItem)
    dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', payload: { folderId } });
  }, []);

  // --- Template Generation Flow ---

  const initiateTemplateGeneration = useCallback((templateType: TemplateType, sourceNoteId: string) => {
    dispatch({ type: 'INITIATE_TEMPLATE_GENERATION', payload: { templateType, sourceNoteId } });
  }, []);

  // handleTemplateSelect triggers the modal
  const handleTemplateSelect = useCallback((templateType: TemplateType) => {
    console.log('handleTemplateSelect called with:', { templateType });
    const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
    const sourceNote = activeTab ? state.notesById[activeTab.noteId] : null;

    if (sourceNote && sourceNote.type === 'note') {
      console.log('Setting template state for source note:', sourceNote.id);
      initiateTemplateGeneration(templateType, sourceNote.id);
    } else {
      console.warn('Cannot generate template: no active note selected or selected item is already a template');
      // Optionally show a user notification here
    }
  }, [state.activeTabId, state.tabs, state.notesById, initiateTemplateGeneration]);

  // confirmTemplateGeneration now performs the generation
   const confirmTemplateGeneration = useCallback(async () => {
     const { pendingSourceNoteId, selectedTemplateType } = state;
     console.log('Confirming template generation for:', { pendingSourceNoteId, selectedTemplateType });

     if (!pendingSourceNoteId || !selectedTemplateType) {
        console.error("Cannot generate template: Missing source note ID or template type.");
        setTemplateError("Missing source information for template generation.");
        dispatch({ type: 'CANCEL_TEMPLATE_GENERATION' }); // Clear modal state
        return;
     }

     const sourceNote = state.notesById[pendingSourceNoteId];
     if (!sourceNote) {
        console.error("Cannot generate template: Source note not found.");
        setTemplateError("Source note not found.");
        dispatch({ type: 'CANCEL_TEMPLATE_GENERATION' });
        return;
     }

     setTemplateGenerating(true);
     setTemplateError(null);

     try {
        // 1. Get source text content
        const sourceText = slateToPlainText(sourceNote.content);

        const llmService = LLMServiceFactory.getService(); // Use static create
        const generatedText = await llmService.generateTemplate(sourceText, selectedTemplateType);

        // 3. Create the new NoteEntity
        const generatedNote: NoteEntity = {
            id: `template-${selectedTemplateType}-${sourceNote.id}-${Date.now()}`,
            title: `${selectedTemplateType} for ${sourceNote.title}`,
            content: textToSlateValue(generatedText), // Convert generated text to Slate format
          type: 'template',
          templateType: selectedTemplateType,
            sourceNoteId: sourceNote.id,
            folderId: sourceNote.folderId, // Place in same folder as source
            isRenaming: false,
        };

        // 4. Dispatch action to add the note and update state
        // The reducer handles resetting isGenerating, showTemplateConfirmation etc.
        dispatch({ type: 'CONFIRM_TEMPLATE_GENERATION', payload: { generatedNote } });

      } catch (error) {
        console.error('Error generating template:', error);
        setTemplateError(error instanceof Error ? error.message : 'Failed to generate template content');
        // Keep the modal open by not dispatching CANCEL_TEMPLATE_GENERATION? Or cancel?
        // Let's keep modal open and show error for now.
        // The SET_TEMPLATE_ERROR action already sets isGenerating to false in the reducer.
     }
   }, [state.pendingSourceNoteId, state.selectedTemplateType, state.notesById, setTemplateGenerating, setTemplateError, dispatch]); // Added dispatch

   // NEW: Function for automatic generation without modal
   const generateAndAddTemplate = useCallback(async (templateType: TemplateType, sourceNoteId: string) => {
       console.log('[AUTO-GEN] Starting automatic generation:', { templateType, sourceNoteId });

       // Log the state being checked
       console.log('[AUTO-GEN] Checking against notesById:', Object.keys(state.notesById));

       // Check if a template for this source note already exists
       const existingTemplate = Object.values(state.notesById).find(
         note => note.type === 'template' && note.sourceNoteId === sourceNoteId
       );

       if (existingTemplate) {
        //  console.log(`[AUTO-GEN] Template already exists for source note ${sourceNoteId} (Template ID: ${existingTemplate.id}). Skipping generation.`);
         // dispatch({ type: 'ACTIVATE_TAB', payload: { tabId: existingTemplate.id } });
         return;
       }

       const sourceNote = state.notesById[sourceNoteId];
       if (!sourceNote) {
           console.error("[AUTO-GEN] Cannot generate: Source note not found.", sourceNoteId);
           setTemplateError("Source note not found for automatic generation.");
           return;
       }

       dispatch({ type: 'SET_TEMPLATE_GENERATING', payload: true });
       dispatch({ type: 'SET_TEMPLATE_ERROR', payload: null });

       try {
           const sourceText = slateToPlainText(sourceNote.content);
           const llmService = LLMServiceFactory.getService();
           const generatedText = await llmService.generateTemplate(sourceText, templateType);

           const generatedNote: NoteEntity = {
               id: `template-${templateType}-${sourceNote.id}-${Date.now()}`,
               title: `${templateType} for ${sourceNote.title}`,
               content: textToSlateValue(generatedText),
               type: 'template',
               templateType: templateType,
               sourceNoteId: sourceNote.id,
               folderId: sourceNote.folderId,
               isRenaming: false,
           };

            console.log('[AUTO-GEN] Generated note entity:', generatedNote);
            // Dispatch the existing confirm action - its reducer handles adding the note
            // and resetting generation state (isGenerating = false)
           dispatch({ type: 'CONFIRM_TEMPLATE_GENERATION', payload: { generatedNote } });
           console.log('[AUTO-GEN] Dispatched CONFIRM_TEMPLATE_GENERATION.');

       } catch (error) {
           console.error('[AUTO-GEN] Error generating template:', error);
           // Use SET_TEMPLATE_ERROR action, its reducer sets isGenerating to false
           dispatch({ type: 'SET_TEMPLATE_ERROR', payload: error instanceof Error ? error.message : 'Failed to automatically generate template content' });
       }
   }, [state.notesById, dispatch, setTemplateError]); // Dependencies: notesById, dispatch, setTemplateError

  const cancelTemplateGeneration = useCallback(() => {
    dispatch({ type: 'CANCEL_TEMPLATE_GENERATION' });
  }, [dispatch]); // Added dispatch

  const setLoadingContent = useCallback((loading: boolean) => {
     dispatch({ type: 'SET_LOADING_CONTENT', payload: loading });
   }, [dispatch]); // Added dispatch
   const initializeState = useCallback((notes: NoteEntity[], folders: FolderData[]) => {
     dispatch({ type: 'INITIALIZE_STATE', payload: { notes, folders } });
   }, [dispatch]); // Added dispatch

  const getTemplateButtonClass = useCallback((buttonTemplateType: TemplateType) => {
        const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
        const activeNote = activeTab ? state.notesById[activeTab.noteId] : null;
    
        if (activeNote?.type === 'template' && activeNote?.templateType === buttonTemplateType) {
        return 'bg-storai-teal text-white'; // Active template matches button
    }
    
        if (state.isGenerating) {
        return 'bg-gray-100 text-gray-400 cursor-not-allowed'; // Disabled during generation
    }
    
        // Default style
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }, [state.activeTabId, state.tabs, state.notesById, state.isGenerating]);

  const deleteNote = useCallback((noteId: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: { noteId } });
  }, [dispatch]);

  const contextValue = useMemo(() => ({
    state,
    // Helper functions exposed to consumers
    addNote,
    updateNoteContent,
    renameNote,
    setNoteRenaming,
    activateTab,
    addTab,
    closeTab,
    handleNewNote, // Expose the specific UI action handler
    addFolder,
    renameFolder,
    setFolderRenaming,
    setActiveFolder,
    toggleFolderExpanded,
    handleNewFolder, // Expose the specific UI action handler
    initiateTemplateGeneration, // For manual modal flow
    confirmTemplateGeneration,  // For manual modal flow
    generateAndAddTemplate,     // NEW: For automatic flow
    cancelTemplateGeneration,
    setTemplateGenerating,
    setTemplateError,
    setLoadingContent,
    initializeState,
    getTemplateButtonClass,
    handleTemplateSelect, // Expose UI interaction handler
    deleteNote,
  }), [
      state, // State is the primary dependency
      addNote, updateNoteContent, renameNote, setNoteRenaming, activateTab, addTab, closeTab, handleNewNote,
      addFolder, renameFolder, setFolderRenaming, setActiveFolder, toggleFolderExpanded, handleNewFolder,
      initiateTemplateGeneration, confirmTemplateGeneration, generateAndAddTemplate, // Added generateAndAddTemplate
      cancelTemplateGeneration, setTemplateGenerating, setTemplateError, setLoadingContent,
      initializeState, getTemplateButtonClass, handleTemplateSelect, deleteNote
  ]);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook remains the same
export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};