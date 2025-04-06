import { DatabaseService, Folder, Note, Upload } from "../../infrastructure/storage/Database";
import { TemplateType } from "../../domain/entities/Template";

/**
 * NotesManagementUseCase handles CRUD operations and business logic
 * for managing clinical notes and folders
 */
export class NotesManagementUseCase {
  /**
   * Create a new folder
   */
  static async createFolder(name: string): Promise<string> {
    if (!name || name.trim() === '') {
      throw new Error("Folder name cannot be empty");
    }
    
    try {
      return DatabaseService.createFolder(name.trim());
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }
  
  /**
   * Get all folders
   */
  static async getAllFolders(): Promise<Folder[]> {
    try {
      return DatabaseService.getFolders();
    } catch (error) {
      console.error("Error getting folders:", error);
      throw error;
    }
  }
  
  /**
   * Create a new note
   */
  static async createNote(
    folderId: string,
    title: string,
    content: string,
    templateType?: TemplateType
  ): Promise<string> {
    if (!folderId) {
      throw new Error("Folder ID is required");
    }
    
    if (!title || title.trim() === '') {
      throw new Error("Note title cannot be empty");
    }
    
    try {
      return DatabaseService.createNote({
        folderId,
        title: title.trim(),
        content,
        templateType,
      });
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }
  
  /**
   * Get notes in a folder
   */
  static async getNotesByFolder(folderId: string): Promise<Note[]> {
    if (!folderId) {
      throw new Error("Folder ID is required");
    }
    
    try {
      return DatabaseService.getNotesByFolder(folderId);
    } catch (error) {
      console.error("Error getting notes by folder:", error);
      throw error;
    }
  }
  
  /**
   * Update a note
   */
  static async updateNote(
    noteId: string,
    data: {
      title?: string;
      content?: string;
      templateType?: TemplateType;
    }
  ): Promise<void> {
    if (!noteId) {
      throw new Error("Note ID is required");
    }
    
    // Validate data if present
    if (data.title !== undefined && data.title.trim() === '') {
      throw new Error("Note title cannot be empty");
    }
    
    // Trim title if present
    const updatedData = { ...data };
    if (updatedData.title) {
      updatedData.title = updatedData.title.trim();
    }
    
    try {
      return DatabaseService.updateNote(noteId, updatedData);
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }
  
  /**
   * Save an uploaded file
   */
  static async saveUpload(
    name: string,
    path: string,
    size: number,
    noteId?: string
  ): Promise<string> {
    if (!name || name.trim() === '') {
      throw new Error("File name cannot be empty");
    }
    
    if (!path) {
      throw new Error("File path is required");
    }
    
    if (size <= 0) {
      throw new Error("File size must be greater than 0");
    }
    
    try {
      return DatabaseService.saveUpload({
        name,
        path,
        size,
        noteId,
      });
    } catch (error) {
      console.error("Error saving upload:", error);
      throw error;
    }
  }
  
  /**
   * Get uploads associated with a note
   */
  static async getUploadsByNote(noteId: string): Promise<Upload[]> {
    if (!noteId) {
      throw new Error("Note ID is required");
    }
    
    try {
      return DatabaseService.getUploadsByNote(noteId);
    } catch (error) {
      console.error("Error getting uploads by note:", error);
      throw error;
    }
  }
} 