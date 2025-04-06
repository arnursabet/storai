import { IDatabaseService } from '../../domain/ports/IDatabaseService';
import { isDesktop } from '../platform/platformDetection';
import { WebDatabaseService } from './web/WebDatabaseService';
import { TauriDatabaseService } from './desktop/TauriDatabaseService';

/**
 * Factory for creating the appropriate DatabaseService implementation
 * based on the current platform
 */
export class DatabaseServiceFactory {
  private static instance: IDatabaseService | null = null;
  
  /**
   * Get the appropriate database service implementation for the current platform
   */
  public static getService(): IDatabaseService {
    if (!this.instance) {
      if (isDesktop()) {
        console.log('Using Tauri DatabaseService for desktop platform');
        this.instance = new TauriDatabaseService();
      } else {
        console.log('Using Web DatabaseService for browser platform');
        this.instance = new WebDatabaseService();
      }
    }
    
    return this.instance;
  }
  
  /**
   * Initialize the database service
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