import CryptoJS from "crypto-js";
import Database from '@tauri-apps/plugin-sql';

// Define the encryption key (in a real app, this should be securely stored)
const ENCRYPTION_KEY = "storai-secure-encryption-key";
let db: any = null;

/**
 * Database service using Tauri's SQLite for storing notes with encryption
 */
export class DatabaseService {
  /**
   * Initialize the database
   */
  static async initialize(): Promise<void> {
    try {
      // Open or create the database
      db = await Database.load("sqlite:storai.db");
      
      // Create tables if they don't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS folders (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          folder_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          template_type TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS uploads (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          note_id TEXT,
          path TEXT NOT NULL,
          size INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE SET NULL
        );
      `);
      
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
  
  /**
   * Encrypt data
   */
  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }
  
  /**
   * Decrypt data
   */
  private static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  /**
   * Create a new folder
   */
  static async createFolder(name: string): Promise<string> {
    try {
      if (!db) await this.initialize();
      
      const id = crypto.randomUUID();
      const now = Date.now();
      
      await db.execute(
        `INSERT INTO folders (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [id, name, now, now]
      );
      
      return id;
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }
  
  /**
   * Get all folders
   */
  static async getFolders(): Promise<Folder[]> {
    try {
      if (!db) await this.initialize();
      
      const result = await db.select("SELECT * FROM folders ORDER BY created_at DESC");
      
      return result.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch (error) {
      console.error("Error getting folders:", error);
      throw error;
    }
  }
  
  /**
   * Create a new note
   */
  static async createNote(note: {
    folderId: string;
    title: string;
    content: string;
    templateType?: string;
  }): Promise<string> {
    try {
      if (!db) await this.initialize();
      
      // Check if the folder exists first
      const folderCheck = await db.select(
        "SELECT id FROM folders WHERE id = ?",
        [note.folderId]
      );
      
      if (!folderCheck || folderCheck.length === 0) {
        throw new Error(`Folder with ID ${note.folderId} does not exist`);
      }
      
      const id = crypto.randomUUID();
      const now = Date.now();
      const encryptedContent = this.encrypt(note.content);
      
      await db.execute(
        `INSERT INTO notes (id, folder_id, title, content, template_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          note.folderId,
          note.title,
          encryptedContent,
          note.templateType || null,
          now,
          now,
        ]
      );
      
      return id;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }
  
  /**
   * Get notes by folder ID
   */
  static async getNotesByFolder(folderId: string): Promise<Note[]> {
    try {
      if (!db) await this.initialize();
      
      const result = await db.select(
        "SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC",
        [folderId]
      );
      
      return result.map((row: any) => ({
        id: row.id as string,
        folderId: row.folder_id as string,
        title: row.title as string,
        content: this.decrypt(row.content as string),
        templateType: row.template_type as string | undefined,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number,
      }));
    } catch (error) {
      console.error("Error getting notes by folder:", error);
      throw error;
    }
  }
  
  /**
   * Update a note
   */
  static async updateNote(id: string, data: {
    title?: string;
    content?: string;
    templateType?: string;
  }): Promise<void> {
    try {
      if (!db) await this.initialize();
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (data.title !== undefined) {
        updates.push("title = ?");
        values.push(data.title);
      }
      
      if (data.content !== undefined) {
        updates.push("content = ?");
        values.push(this.encrypt(data.content));
      }
      
      if (data.templateType !== undefined) {
        updates.push("template_type = ?");
        values.push(data.templateType);
      }
      
      if (updates.length === 0) {
        return;
      }
      
      updates.push("updated_at = ?");
      values.push(Date.now());
      values.push(id);
      
      await db.execute(
        `UPDATE notes
         SET ${updates.join(", ")}
         WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }
  
  /**
   * Save an uploaded file reference
   */
  static async saveUpload(upload: {
    name: string;
    noteId?: string;
    path: string;
    size: number;
  }): Promise<string> {
    try {
      if (!db) await this.initialize();
      
      const id = crypto.randomUUID();
      const now = Date.now();
      
      await db.execute(
        `INSERT INTO uploads (id, name, note_id, path, size, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          upload.name,
          upload.noteId || null,
          upload.path,
          upload.size,
          now,
        ]
      );
      
      return id;
    } catch (error) {
      console.error("Error saving upload:", error);
      throw error;
    }
  }
  
  /**
   * Get uploads by note ID
   */
  static async getUploadsByNote(noteId: string): Promise<Upload[]> {
    try {
      if (!db) await this.initialize();
      
      const result = await db.select(
        "SELECT * FROM uploads WHERE note_id = ? ORDER BY created_at DESC",
        [noteId]
      );
      
      return result.map((row: any) => ({
        id: row.id as string,
        name: row.name as string,
        noteId: row.note_id as string | undefined,
        path: row.path as string,
        size: row.size as number,
        createdAt: row.created_at as number,
      }));
    } catch (error) {
      console.error("Error getting uploads by note:", error);
      throw error;
    }
  }
  
  /**
   * Debug function to list all folders and their IDs
   */
  static async debugFolders(): Promise<void> {
    try {
      if (!db) await this.initialize();
      
      const result = await db.select("SELECT * FROM folders");
      console.log("All folders in database:", result);
      
      return result;
    } catch (error) {
      console.error("Error debugging folders:", error);
      throw error;
    }
  }
}

// Types for database entities
export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  content: string;
  templateType?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Upload {
  id: string;
  name: string;
  noteId?: string;
  path: string;
  size: number;
  createdAt: number;
} 