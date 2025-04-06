import { nanoid } from 'nanoid';
// Import types only for type checking
import type { IFileService, UploadedFile } from '../../../domain/ports/IFileService';

/**
 * Tauri-specific implementation of FileService for desktop platform
 */
export class TauriFileService implements IFileService {
  private storagePath: string | null = null;

  /**
   * Initialize the file service
   */
  public async initialize(): Promise<void> {
    try {
      // Dynamically import Tauri APIs
      const { appDataDir } = await import('@tauri-apps/api/path');
      const { exists } = await import('@tauri-apps/plugin-fs');
      const { invoke } = await import('@tauri-apps/api/tauri');
      
      this.storagePath = await appDataDir();
      console.log(`Tauri FileService initialized at: ${this.storagePath}`);
      
      // Create storage directory if it doesn't exist
      const { join } = await import('@tauri-apps/api/path');
      const uploadDir = await join(this.storagePath, 'uploads');
      if (!(await exists(uploadDir))) {
        await invoke('create_dir_all', { dir: uploadDir });
      }
    } catch (error) {
      console.error('Failed to initialize TauriFileService:', error);
    }
  }
  
  /**
   * Upload a file
   * @param file The file to upload
   * @returns The file information including its path and generated ID
   */
  public async uploadFile(file: File): Promise<UploadedFile> {
    if (!this.storagePath) {
      throw new Error('FileService not initialized');
    }
    
    try {
      // Dynamically import Tauri APIs
      const { join } = await import('@tauri-apps/api/path');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      
      // Generate a unique ID
      const uniqueId = nanoid(10);
      const fileName = `${uniqueId}_${file.name}`;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Save the file
      const uploadPath = await join(this.storagePath, 'uploads', fileName);
      
      // Fix: Use writeFile with the proper signature
      // Note: In newer versions of @tauri-apps/plugin-fs, writeFile accepts a path and contents separately
      try {
        await writeFile(uploadPath, uint8Array);
      } catch (err) {
        console.error('Error writing file:', err);
        throw err;
      }
      
      // Create an uploaded file object
      const uploadedFile: UploadedFile = {
        id: uniqueId,
        name: file.name,
        path: uploadPath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      console.log(`File uploaded: ${file.name}`);
      return uploadedFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file
   * @param filePath The full path to the file
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      // Dynamically import Tauri APIs
      const { exists, removeFile } = await import('@tauri-apps/plugin-fs');
      
      if (await exists(filePath)) {
        await removeFile(filePath);
        console.log(`File deleted: ${filePath}`);
      } else {
        console.warn(`File not found for deletion: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * List all uploaded files
   * @returns Array of UploadedFile objects
   */
  public async listFiles(): Promise<UploadedFile[]> {
    if (!this.storagePath) {
      throw new Error('FileService not initialized');
    }
    
    try {
      // Dynamically import Tauri APIs
      const { join } = await import('@tauri-apps/api/path');
      const { exists } = await import('@tauri-apps/plugin-fs');
      const { invoke } = await import('@tauri-apps/api/tauri');
      
      const uploadDir = await join(this.storagePath, 'uploads');
      
      // Check if directory exists
      if (!(await exists(uploadDir))) {
        return [];
      }
      
      // Use custom command to read directory since there's an issue with readDir
      const entries = await invoke('read_dir', { dir: uploadDir });
      const files: UploadedFile[] = [];
      
      // Parse file entries
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          // Assuming entry is an object with name and path properties
          const name = entry.name || '';
          const path = entry.path || '';
          
          // Skip non-file entries or hidden files
          if (!name || name.startsWith('.')) continue;
          
          // Parse the ID from the filename (assumes format: {id}_{name})
          const idMatch = name.match(/^([a-zA-Z0-9]+)_(.+)$/);
          const id = idMatch ? idMatch[1] : nanoid(10);
          const originalName = idMatch ? idMatch[2] : name;
          
          files.push({
            id,
            name: originalName,
            path,
            // These would need to be retrieved from file metadata
            size: 0, // Placeholder
            type: '', // Placeholder
            uploadedAt: new Date().toISOString()
          });
        }
      }
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
  
  /**
   * Read file content as text
   * @param filePath The full path to the file
   * @returns The file content as text
   */
  public async readFileAsText(filePath: string): Promise<string> {
    try {
      // Dynamically import Tauri APIs
      const { exists, readTextFile } = await import('@tauri-apps/plugin-fs');
      
      if (!(await exists(filePath))) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      return await readTextFile(filePath);
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
      throw error;
    }
  }
} 