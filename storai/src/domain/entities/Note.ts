export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface NoteRepository {
    getNotes(): Promise<Note[]>;
    getNoteById(id: string): Promise<Note | null>;
    saveNote(note: Note): Promise<void>;
    deleteNote(id: string): Promise<void>;
  } 