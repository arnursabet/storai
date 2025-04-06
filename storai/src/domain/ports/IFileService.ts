/**
 * Interface representing an uploaded file
 */
export interface UploadedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
}

/**
 * Platform-agnostic interface for file operations
 * This follows the port/adapter pattern from Clean Architecture
 */
export interface IFileService {
  /**
   * Initialize the file service
   */
  initialize(): Promise<void>;
  
  /**
   * Upload a file
   * @param file The file to upload
   * @returns The file information including its path and generated ID
   */
  uploadFile(file: File): Promise<UploadedFile>;
  
  /**
   * Delete a file
   * @param filePath The full path to the file
   */
  deleteFile(filePath: string): Promise<void>;
  
  /**
   * List all uploaded files
   * @returns Array of UploadedFile objects
   */
  listFiles(): Promise<UploadedFile[]>;
  
  /**
   * Read file content as text
   * @param filePath The full path to the file
   * @returns The file content as text
   */
  readFileAsText(filePath: string): Promise<string>;
} 