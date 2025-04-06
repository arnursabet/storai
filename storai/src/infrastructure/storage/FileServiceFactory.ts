import { IFileService } from '../../domain/ports/IFileService';
import { isDesktop } from '../platform/platformDetection';
import { WebFileService } from './web/WebFileService';
import { TauriFileService } from './desktop/TauriFileService';

/**
 * Factory for creating the appropriate FileService implementation
 * based on the current platform
 */
export class FileServiceFactory {
  private static instance: IFileService | null = null;
  
  /**
   * Get the appropriate file service implementation for the current platform
   */
  public static getService(): IFileService {
    if (!this.instance) {
      if (isDesktop()) {
        console.log('Using Tauri FileService for desktop platform');
        this.instance = new TauriFileService();
      } else {
        console.log('Using Web FileService for browser platform');
        this.instance = new WebFileService();
      }
    }
    
    return this.instance;
  }
  
  /**
   * Initialize the file service
   * This must be called before any other operations
   */
  public static async initialize(): Promise<void> {
    const service = this.getService();
    await service.initialize();
  }
  
  /**
   * Reset the instance (primarily for testing)
   */
  public static reset(): void {
    this.instance = null;
  }
} 