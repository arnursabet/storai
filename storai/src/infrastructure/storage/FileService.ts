import { UploadedFile } from '../../domain/ports/IFileService';
import { FileServiceFactory } from './FileServiceFactory';
import { isDesktop, isWeb, logPlatformInfo } from '../platform/platformDetection';

/**
 * Service for handling file operations
 * This is a proxy to the appropriate platform-specific implementation
 */
export class FileService {
  /**
   * Initialize the file service
   */
  public static async initialize(): Promise<void> {
    logPlatformInfo();
    return FileServiceFactory.initialize();
  }
  
  /**
   * Upload a file
   * @param file The file to upload
   * @returns The file information including its path and generated ID
   */
  public static async uploadFile(file: File): Promise<UploadedFile> {
    return FileServiceFactory.getService().uploadFile(file);
  }
  
  /**
   * Delete a file
   * @param filePath The full path to the file
   */
  public static async deleteFile(filePath: string): Promise<void> {
    return FileServiceFactory.getService().deleteFile(filePath);
  }
  
  /**
   * List all uploaded files
   * @returns Array of UploadedFile objects
   */
  public static async listFiles(): Promise<UploadedFile[]> {
    return FileServiceFactory.getService().listFiles();
  }
  
  /**
   * Read file content as text
   * @param filePath The full path to the file
   * @returns The file content as text
   */
  public static async readFileAsText(filePath: string): Promise<string> {
    return FileServiceFactory.getService().readFileAsText(filePath);
  }
  
  /**
   * Check if the app is running in desktop mode
   */
  public static isDesktopMode(): boolean {
    return isDesktop();
  }
  
  /**
   * Check if the app is running in web mode
   */
  public static isWebMode(): boolean {
    return isWeb();
  }
} 