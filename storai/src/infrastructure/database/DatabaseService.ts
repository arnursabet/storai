import { IDatabaseService } from '../../domain/ports/IDatabaseService';
import { DatabaseServiceFactory } from './DatabaseServiceFactory';
import { isDesktop, isWeb, logPlatformInfo } from '../platform/platformDetection';

/**
 * Service for handling database operations
 * This is a facade for the appropriate platform-specific implementation
 */
export class DatabaseService implements IDatabaseService {
  private static instance: DatabaseService | null = null;
  
  /**
   * Get DatabaseService instance (singleton)
   */
  public static getInstance(): DatabaseService {
    if (!this.instance) {
      this.instance = new DatabaseService();
    }
    return this.instance;
  }

  /**
   * Initialize the database service
   */
  public async initialize(): Promise<void> {
    logPlatformInfo();
    console.log('Initializing database service...');
    
    try {
      // Debug SQL plugin imports
      console.log('Attempting to import SQL plugin...');
      try {
        // Import the module
        const SqlPluginImport = await import('@tauri-apps/plugin-sql');
        console.log('SQL Plugin import successful:', SqlPluginImport);
        
        // Try different ways to access the Database class
        let DatabaseClass = null;
        
        // Check all possible formats the import might have
        if (typeof SqlPluginImport === 'function') {
          // If the import itself is the Database constructor
          DatabaseClass = SqlPluginImport;
        } else if (SqlPluginImport.Database) {
          // If it has a named export Database
          DatabaseClass = SqlPluginImport.Database;
        } else if (SqlPluginImport.default) {
          // If it has a default export
          if (typeof SqlPluginImport.default === 'function') {
            // If the default export is the Database constructor
            DatabaseClass = SqlPluginImport.default;
          } else if (SqlPluginImport.default.Database) {
            // If the default export has a Database property
            DatabaseClass = SqlPluginImport.default.Database;
          }
        }
        
        console.log('Database class found:', DatabaseClass);
        console.log('Database class type:', typeof DatabaseClass);
        if (DatabaseClass) {
          console.log('Database.load exists:', typeof DatabaseClass.load === 'function');
          
          // Test a direct instantiation if it's a constructor
          if (typeof DatabaseClass === 'function') {
            try {
              console.log('Testing Database instantiation and load method:');
              const testDB = new DatabaseClass('test-db');
              console.log('Database instance created:', testDB);
              if (typeof testDB.load === 'function') {
                console.log('Instance load method exists');
              }
            } catch (e) {
              console.error('Error testing Database instantiation:', e);
            }
          }
        }
      } catch (importError) {
        console.error('Error importing SQL plugin:', importError);
      }
      
      // Initialize through factory
      await DatabaseServiceFactory.initialize();
      console.log('Database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }
  
  /**
   * Execute a database query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async execute<T = any>(query: string, params?: any[]): Promise<T> {
    return DatabaseServiceFactory.getService().execute<T>(query, params);
  }
  
  /**
   * Get single result from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async getOne<T = any>(query: string, params?: any[]): Promise<T | null> {
    return DatabaseServiceFactory.getService().getOne<T>(query, params);
  }
  
  /**
   * Get multiple results from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async getMany<T = any>(query: string, params?: any[]): Promise<T[]> {
    return DatabaseServiceFactory.getService().getMany<T>(query, params);
  }
  
  /**
   * Static helper methods for platform detection
   */
  
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
  
  /**
   * Static helper methods for database operations
   */
  
  /**
   * Initialize the database service (static helper)
   */
  public static async initializeDatabase(): Promise<void> {
    await this.getInstance().initialize();
  }
  
  /**
   * Execute a database query (static helper)
   */
  public static async executeQuery<T = any>(query: string, params?: any[]): Promise<T> {
    return this.getInstance().execute<T>(query, params);
  }
  
  /**
   * Get single result from a query (static helper)
   */
  public static async getOneResult<T = any>(query: string, params?: any[]): Promise<T | null> {
    return this.getInstance().getOne<T>(query, params);
  }
  
  /**
   * Get multiple results from a query (static helper)
   */
  public static async getManyResults<T = any>(query: string, params?: any[]): Promise<T[]> {
    return this.getInstance().getMany<T>(query, params);
  }
} 