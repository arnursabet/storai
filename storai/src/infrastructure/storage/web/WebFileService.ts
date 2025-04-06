import { nanoid } from 'nanoid';
import { IFileService, UploadedFile } from '../../../domain/ports/IFileService';
import localforage from 'localforage';

/**
 * Web-specific implementation of FileService for browser platform
 * Uses IndexedDB via localforage for storage
 */
export class WebFileService implements IFileService {
  private static FILE_STORE = 'files';
  private static FILE_META_STORE = 'file_metadata';
  
  /**
   * Initialize the file service
   */
  public async initialize(): Promise<void> {
    try {
      // Configure localforage
      localforage.config({
        name: 'StoraiApp',
        storeName: WebFileService.FILE_STORE
      });
      
      // Create a separate instance for metadata
      const metaStore = localforage.createInstance({
        name: 'StoraiApp',
        storeName: WebFileService.FILE_META_STORE
      });
      
      console.log('Web FileService initialized using IndexedDB');
    } catch (error) {
      console.error('Failed to initialize WebFileService:', error);
    }
  }
  
  /**
   * Upload a file
   * @param file The file to upload
   * @returns The file information including its path and generated ID
   */
  public async uploadFile(file: File): Promise<UploadedFile> {
    // Generate a unique ID
    const uniqueId = nanoid(10);
    const virtualPath = `/browser-storage/${uniqueId}_${file.name}`;
    
    // Read file as ArrayBuffer
    const fileContent = await this.readFileAsArrayBuffer(file);
    
    // Create an uploaded file object
    const uploadedFile: UploadedFile = {
      id: uniqueId,
      name: file.name,
      path: virtualPath,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };
    
    // Store file content
    await localforage.setItem(virtualPath, fileContent);
    
    // Store file metadata separately
    const metaStore = localforage.createInstance({
      name: 'StoraiApp',
      storeName: WebFileService.FILE_META_STORE
    });
    
    await metaStore.setItem(uniqueId, uploadedFile);
    
    console.log(`File uploaded to browser storage: ${file.name}`);
    return uploadedFile;
  }
  
  /**
   * Delete a file
   * @param filePath The virtual path to the file
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      // Remove file content
      await localforage.removeItem(filePath);
      
      // Extract ID from path to remove metadata
      const pathParts = filePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const idMatch = fileName.match(/^([a-zA-Z0-9]+)_(.+)$/);
      
      if (idMatch) {
        const id = idMatch[1];
        const metaStore = localforage.createInstance({
          name: 'StoraiApp',
          storeName: WebFileService.FILE_META_STORE
        });
        
        await metaStore.removeItem(id);
      }
      
      console.log(`File deleted from browser storage: ${filePath}`);
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
    try {
      const files: UploadedFile[] = [];
      const metaStore = localforage.createInstance({
        name: 'StoraiApp',
        storeName: WebFileService.FILE_META_STORE
      });
      
      // Iterate through all items in metadata store
      await metaStore.iterate((value: any, key: string) => {
        if (value && typeof value === 'object') {
          files.push(value as UploadedFile);
        }
      });
      
      return files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }
  
  /**
   * Read file content as text
   * @param filePath The virtual path to the file
   * @returns The file content as text
   */
  public async readFileAsText(filePath: string): Promise<string> {
    try {
      console.log('Reading file content from:', filePath);

      const fileContent = await localforage.getItem<ArrayBuffer>(filePath);

      console.log('File content:', fileContent);
      
      if (!fileContent) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Convert ArrayBuffer to text
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(fileContent);
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to read a File as ArrayBuffer
   */
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
} 