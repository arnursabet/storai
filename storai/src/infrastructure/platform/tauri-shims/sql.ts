/**
 * Mock implementation of Tauri's SQL plugin for web environment
 */

// Create a lightweight in-memory database for web environment
const inMemoryDatabases: Record<string, any> = {};

/**
 * Database class to mimic Tauri's SQL plugin Database class
 */
class Database {
  private dbName: string;
  private tables: Record<string, any[]> = {};
  private loaded: boolean = false;

  constructor(dbPath: string) {
    this.dbName = dbPath;
    console.log(`[Tauri SQL Shim] Creating database instance for: ${dbPath}`);
  }

  /**
   * Static method to load a database by URL
   * 
   * @param url The database URL (e.g. 'sqlite:test.db')
   * @returns A Database instance
   */
  static async load(url: string): Promise<Database> {
    console.log(`[Tauri SQL Shim] Database.load called with URL: ${url}`);
    const db = new Database(url);
    await db.load();
    return db;
  }

  /**
   * Load the database
   */
  async load(): Promise<void> {
    console.log(`[Tauri SQL Shim] Loading database: ${this.dbName}`);
    
    // Check if we already have this database in memory
    if (!inMemoryDatabases[this.dbName]) {
      inMemoryDatabases[this.dbName] = {
        tables: {},
        lastId: 0
      };
    }
    
    this.tables = inMemoryDatabases[this.dbName].tables;
    this.loaded = true;
    return Promise.resolve();
  }

  /**
   * Execute a SQL statement
   */
  async execute(query: string, bindValues?: any[]): Promise<any> {
    console.log(`[Tauri SQL Shim] Executing query: ${query}`, bindValues);
    
    // Very basic parsing to simulate SQL behavior
    const normalizedQuery = query.trim().toLowerCase();
    
    if (normalizedQuery.startsWith('create table')) {
      return this.mockCreateTable(query);
    } else if (normalizedQuery.startsWith('insert into')) {
      return this.mockInsert(query, bindValues);
    } else if (normalizedQuery.startsWith('select')) {
      return this.mockSelect(query);
    } else if (normalizedQuery.startsWith('update')) {
      return this.mockUpdate(query, bindValues);
    } else if (normalizedQuery.startsWith('delete from')) {
      return this.mockDelete(query);
    }
    
    // Default mock response
    return Promise.resolve({ rowsAffected: 0, lastInsertId: null });
  }

  /**
   * Mock implementation for CREATE TABLE
   */
  private mockCreateTable(query: string): Promise<any> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/create table\s+([^\s(]+)/i);
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      if (!this.tables[tableName]) {
        this.tables[tableName] = [];
        console.log(`[Tauri SQL Shim] Created table: ${tableName}`);
      }
    }
    
    return Promise.resolve({ rowsAffected: 0 });
  }

  /**
   * Mock implementation for INSERT
   */
  private mockInsert(query: string, bindValues?: any[]): Promise<any> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/insert into\s+([^\s(]+)/i);
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      // Create table if it doesn't exist
      if (!this.tables[tableName]) {
        this.tables[tableName] = [];
      }
      
      // Generate a new ID
      const newId = ++inMemoryDatabases[this.dbName].lastId;
      
      // Create a simple object to insert with index signature to allow dynamic properties
      const newRow: { id: number; [key: string]: any } = { id: newId };
      
      // If we have bind values, add them with generic keys
      if (bindValues && bindValues.length > 0) {
        bindValues.forEach((value, index) => {
          newRow[`field_${index}`] = value;
        });
      }
      
      this.tables[tableName].push(newRow);
      console.log(`[Tauri SQL Shim] Inserted row into table: ${tableName}`, newRow);
      
      return Promise.resolve({ 
        rowsAffected: 1, 
        lastInsertId: newId 
      });
    }
    
    return Promise.resolve({ rowsAffected: 0, lastInsertId: null });
  }

  /**
   * Mock implementation for SELECT
   */
  private mockSelect(query: string): Promise<{ rows: any[] }> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/from\s+([^\s]+)/i);
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (this.tables[tableName]) {
        console.log(`[Tauri SQL Shim] Selected from table: ${tableName}, returning ${this.tables[tableName].length} rows`);
        return Promise.resolve({ 
          rows: [...this.tables[tableName]] 
        });
      }
    }
    
    return Promise.resolve({ rows: [] });
  }

  /**
   * Mock implementation for UPDATE
   */
  private mockUpdate(query: string, bindValues?: any[]): Promise<any> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/update\s+([^\s]+)/i);
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (this.tables[tableName]) {
        console.log(`[Tauri SQL Shim] Updated table: ${tableName}`);
        return Promise.resolve({ 
          rowsAffected: this.tables[tableName].length 
        });
      }
    }
    
    return Promise.resolve({ rowsAffected: 0 });
  }

  /**
   * Mock implementation for DELETE
   */
  private mockDelete(query: string): Promise<any> {
    // Extract table name with a simple regex
    const tableMatch = query.match(/delete from\s+([^\s]+)/i);
    if (tableMatch && tableMatch[1]) {
      const tableName = tableMatch[1];
      
      if (this.tables[tableName]) {
        const count = this.tables[tableName].length;
        this.tables[tableName] = [];
        console.log(`[Tauri SQL Shim] Deleted ${count} rows from table: ${tableName}`);
        return Promise.resolve({ 
          rowsAffected: count 
        });
      }
    }
    
    return Promise.resolve({ rowsAffected: 0 });
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    console.log(`[Tauri SQL Shim] Closing database: ${this.dbName}`);
    return Promise.resolve();
  }
}

// Export similar to how Tauri's plugin works
export { Database };

// For compatibility with default imports
export default Database; 