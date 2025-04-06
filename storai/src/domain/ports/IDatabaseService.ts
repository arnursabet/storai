/**
 * Interface for database operations
 * This follows the port/adapter pattern from Clean Architecture
 */
export interface IDatabaseService {
  /**
   * Initialize the database
   */
  initialize(): Promise<void>;
  
  /**
   * Execute a database query
   * @param query SQL query string
   * @param params Query parameters
   */
  execute<T = any>(query: string, params?: any[]): Promise<T>;
  
  /**
   * Get single result from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  getOne<T = any>(query: string, params?: any[]): Promise<T | null>;
  
  /**
   * Get multiple results from a query
   * @param query SQL query string
   * @param params Query parameters
   */
  getMany<T = any>(query: string, params?: any[]): Promise<T[]>;
} 