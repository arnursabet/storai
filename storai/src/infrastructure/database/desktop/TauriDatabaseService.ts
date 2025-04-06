import { IDatabaseService } from '../../../domain/ports/IDatabaseService';

/**
 * Tauri-specific implementation of database service for desktop platform
 */
export class TauriDatabaseService implements IDatabaseService {
  private db: any = null;
  
  /**
   * Initialize the database
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Tauri database service...');
      
      // Import the SQL plugin with better handling for different import structures
      console.log('Importing SQL plugin...');
      const SqlPluginImport = await import('@tauri-apps/plugin-sql');
      console.log('SQL Plugin imported:', SqlPluginImport);
      
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
      
      if (!DatabaseClass) {
        console.error('SQL Plugin structure:', SqlPluginImport);
        throw new Error('Could not find Database class in SQL plugin');
      }
      
      console.log('Database class found:', DatabaseClass);
      console.log('Database.load exists:', typeof DatabaseClass.load === 'function');
      
      // Get app data directory for the database path
      const { appDataDir } = await import('@tauri-apps/api/path');
      const { join } = await import('@tauri-apps/api/path');
      
      // Set up the database path in the app data directory
      const appDataDirPath = await appDataDir();
      const dbPath = await join(appDataDirPath, 'storai.db');
      
      console.log(`Database path: ${dbPath}`);
      
      // Load the database using the proper API pattern
      this.db = await DatabaseClass.load(`sqlite:${dbPath}`);
      console.log('Database loaded successfully');
      
      console.log('Tauri database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Tauri database service:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }
  
  /**
   * Execute a database query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async execute<T = any>(query: string, params: any[] = []): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      return await this.db.execute(query, params);
    } catch (error) {
      console.error(`Query execution failed: ${query}`, error);
      throw error;
    }
  }
  
  /**
   * Get single result from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async getOne<T = any>(query: string, params: any[] = []): Promise<T | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = await this.db.execute(query, params);
      
      if (result && result.rows && result.rows.length > 0) {
        return result.rows[0] as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Query execution failed: ${query}`, error);
      throw error;
    }
  }
  
  /**
   * Get multiple results from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async getMany<T = any>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = await this.db.execute(query, params);
      
      if (result && result.rows) {
        return result.rows as T[];
      }
      
      return [];
    } catch (error) {
      console.error(`Query execution failed: ${query}`, error);
      throw error;
    }
  }
} 