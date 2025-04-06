import { IDatabaseService } from '../../../domain/ports/IDatabaseService';
import localforage from 'localforage';

/**
 * Web-specific implementation of database service for browser platform
 * This uses IndexedDB via localforage for storage
 */
export class WebDatabaseService implements IDatabaseService {
  private static DB_NAME = 'StoraiDB';
  private static TABLES_INFO = 'tables_info';
  private tables: Set<string> = new Set();
  private initialized: boolean = false;
  
  /**
   * Initialize the database
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Web database service using IndexedDB...');
      
      // Try loading the SQL plugin to see if our shim is working
      try {
        // Import the module
        const SqlPluginImport = await import('@tauri-apps/plugin-sql');
        console.log('SQL Plugin import in WebDatabaseService successful:', SqlPluginImport);
        
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
        
        console.log('WebDatabaseService - Database class found:', DatabaseClass);
        if (DatabaseClass) {
          console.log('WebDatabaseService - Database.load exists:', typeof DatabaseClass.load === 'function');
        }
      } catch (importError) {
        console.error('Error importing SQL plugin in WebDatabaseService:', importError);
      }
      
      // Configure localforage
      localforage.config({
        name: WebDatabaseService.DB_NAME,
        version: 1.0,
        driver: [
          localforage.INDEXEDDB,
          localforage.WEBSQL,
          localforage.LOCALSTORAGE
        ],
        description: 'StorAI Web Database'
      });
      
      // Load table information
      const tablesInfo = await localforage.getItem<string[]>(WebDatabaseService.TABLES_INFO) || [];
      this.tables = new Set(tablesInfo);
      
      console.log(`Web database initialized with ${this.tables.size} tables`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize web database service:', error);
      throw new Error(`Database initialization failed: ${error}`);
    }
  }
  
  /**
   * Execute a database query
   * @param query SQL query string
   * @param params Query parameters
   */
  public async execute<T = any>(query: string, params: any[] = []): Promise<T> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      console.log(`Executing query in web mode: ${query}`, params);
      const normalizedQuery = query.trim().toLowerCase();
      
      // Basic SQL parsing to execute the appropriate operation
      if (normalizedQuery.startsWith('create table')) {
        return await this.executeCreateTable(query) as unknown as T;
      } else if (normalizedQuery.startsWith('insert into')) {
        return await this.executeInsert(query, params) as unknown as T;
      } else if (normalizedQuery.startsWith('select')) {
        return await this.executeSelect(query, params) as unknown as T;
      } else if (normalizedQuery.startsWith('update')) {
        return await this.executeUpdate(query, params) as unknown as T;
      } else if (normalizedQuery.startsWith('delete from')) {
        return await this.executeDelete(query, params) as unknown as T;
      }
      
      throw new Error(`Unsupported SQL operation: ${query}`);
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
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = await this.execute<{ rows: T[] }>(query, params);
      
      if (result && result.rows && result.rows.length > 0) {
        return result.rows[0];
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
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = await this.execute<{ rows: T[] }>(query, params);
      
      if (result && result.rows) {
        return result.rows;
      }
      
      return [];
    } catch (error) {
      console.error(`Query execution failed: ${query}`, error);
      throw error;
    }
  }
  
  /**
   * Execute CREATE TABLE
   */
  private async executeCreateTable(query: string): Promise<{ rowsAffected: number }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/create table\s+([^\s(]+)/i);
    
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      // Initialize table storage if needed
      const tableStore = localforage.createInstance({
        name: WebDatabaseService.DB_NAME,
        storeName: tableName
      });
      
      // Update tables set
      this.tables.add(tableName);
      await localforage.setItem(WebDatabaseService.TABLES_INFO, Array.from(this.tables));
      
      console.log(`Created table: ${tableName}`);
      return { rowsAffected: 0 };
    }
    
    throw new Error(`Invalid CREATE TABLE query: ${query}`);
  }
  
  /**
   * Execute INSERT INTO
   */
  private async executeInsert(query: string, params: any[] = []): Promise<{ rowsAffected: number, lastInsertId: number }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/insert into\s+([^\s(]+)/i);
    
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (!this.tables.has(tableName)) {
        throw new Error(`Table does not exist: ${tableName}`);
      }
      
      // Get the table store
      const tableStore = localforage.createInstance({
        name: WebDatabaseService.DB_NAME,
        storeName: tableName
      });
      
      // Generate a unique ID for the new record
      const timestamp = Date.now();
      const id = params[0] || timestamp;
      
      // Create a record object using the parameters
      const record: Record<string, any> = { id };
      
      // Extract column names from the query
      const columnsMatch = query.match(/\(([^)]+)\)/);
      if (columnsMatch && columnsMatch[1]) {
        const columns = columnsMatch[1].split(',').map(c => c.trim());
        
        // Match columns with parameters
        for (let i = 0; i < columns.length; i++) {
          if (i + 1 < params.length) {
            record[columns[i]] = params[i + 1];
          }
        }
      } else {
        // If no columns specified, just use params as fields
        for (let i = 1; i < params.length; i++) {
          record[`field_${i}`] = params[i];
        }
      }
      
      // Store the record
      await tableStore.setItem(String(id), record);
      
      console.log(`Inserted record in table ${tableName}:`, record);
      return { rowsAffected: 1, lastInsertId: typeof id === 'number' ? id : 0 };
    }
    
    throw new Error(`Invalid INSERT query: ${query}`);
  }
  
  /**
   * Execute SELECT
   */
  private async executeSelect(query: string, params: any[] = []): Promise<{ rows: any[] }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/from\s+([^\s]+)/i);
    
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (!this.tables.has(tableName)) {
        console.warn(`Table does not exist: ${tableName}`);
        return { rows: [] };
      }
      
      // Get the table store
      const tableStore = localforage.createInstance({
        name: WebDatabaseService.DB_NAME,
        storeName: tableName
      });
      
      // Collect all records
      const rows: any[] = [];
      
      // Very simple WHERE clause handling
      const whereMatch = query.match(/where\s+([^;]+)/i);
      const hasWhere = whereMatch && whereMatch[1];
      
      if (hasWhere && params.length > 0) {
        // Just check if the ID matches
        const idMatch = whereMatch[1].match(/id\s*=\s*\?/i);
        if (idMatch && params[0]) {
          const record = await tableStore.getItem(String(params[0]));
          if (record) {
            rows.push(record);
          }
        } else {
          // For any other WHERE clause, we need to scan all records
          await tableStore.iterate((value, key) => {
            rows.push(value);
          });
          
          // Apply a very basic filter if possible
          // This is a simplified implementation that only handles basic conditions
        }
      } else {
        // No WHERE clause, return all records
        await tableStore.iterate((value, key) => {
          rows.push(value);
        });
      }
      
      console.log(`Selected ${rows.length} records from table ${tableName}`);
      return { rows };
    }
    
    throw new Error(`Invalid SELECT query: ${query}`);
  }
  
  /**
   * Execute UPDATE
   */
  private async executeUpdate(query: string, params: any[] = []): Promise<{ rowsAffected: number }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/update\s+([^\s]+)/i);
    
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (!this.tables.has(tableName)) {
        throw new Error(`Table does not exist: ${tableName}`);
      }
      
      // Get the table store
      const tableStore = localforage.createInstance({
        name: WebDatabaseService.DB_NAME,
        storeName: tableName
      });
      
      // Very simple WHERE clause handling
      const whereMatch = query.match(/where\s+([^;]+)/i);
      const hasWhere = whereMatch && whereMatch[1];
      
      if (hasWhere && params.length > 0) {
        // Just check if the ID matches
        const idMatch = whereMatch[1].match(/id\s*=\s*\?/i);
        if (idMatch && params[0]) {
          const record = await tableStore.getItem(String(params[0]));
          if (record) {
            // Update the record
            // Extract SET clause
            const setMatch = query.match(/set\s+([^;]+)\s+where/i);
            if (setMatch && setMatch[1]) {
              const setValues = setMatch[1].split(',').map(s => s.trim());
              
              // Update values in record
              for (let i = 0; i < setValues.length; i++) {
                const [column, placeholder] = setValues[i].split('=').map(s => s.trim());
                if (placeholder === '?' && i + 1 < params.length) {
                  (record as any)[column] = params[i + 1];
                }
              }
              
              await tableStore.setItem(String(params[0]), record);
              console.log(`Updated record in table ${tableName}:`, record);
              return { rowsAffected: 1 };
            }
          }
        }
      }
      
      // Default response
      return { rowsAffected: 0 };
    }
    
    throw new Error(`Invalid UPDATE query: ${query}`);
  }
  
  /**
   * Execute DELETE FROM
   */
  private async executeDelete(query: string, params: any[] = []): Promise<{ rowsAffected: number }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/delete from\s+([^\s]+)/i);
    
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (!this.tables.has(tableName)) {
        throw new Error(`Table does not exist: ${tableName}`);
      }
      
      // Get the table store
      const tableStore = localforage.createInstance({
        name: WebDatabaseService.DB_NAME,
        storeName: tableName
      });
      
      // Very simple WHERE clause handling
      const whereMatch = query.match(/where\s+([^;]+)/i);
      const hasWhere = whereMatch && whereMatch[1];
      
      if (hasWhere && params.length > 0) {
        // Just check if the ID matches
        const idMatch = whereMatch[1].match(/id\s*=\s*\?/i);
        if (idMatch && params[0]) {
          await tableStore.removeItem(String(params[0]));
          console.log(`Deleted record with ID ${params[0]} from table ${tableName}`);
          return { rowsAffected: 1 };
        }
      }
      
      // Default response
      return { rowsAffected: 0 };
    }
    
    throw new Error(`Invalid DELETE query: ${query}`);
  }
} 