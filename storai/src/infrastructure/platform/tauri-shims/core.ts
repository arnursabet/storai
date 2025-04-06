/**
 * Shim for @tauri-apps/api/core module
 * This provides mocked implementations for web environment
 */

/**
 * Mock implementation of the invoke function for RPC calls to Rust
 */
export const invoke = async <T>(command: string, args?: Record<string, any>): Promise<T> => {
  console.log(`[Tauri Core Shim] invoke called with command: ${command}`, args);
  
  // Return null as the default value for invocations
  return null as unknown as T;
};

/**
 * Mock implementation of transformCallback function
 */
export const transformCallback = (callback: Function, once = false): number => {
  console.log(`[Tauri Core Shim] transformCallback called`, { once });
  return 0; // Return a mock handler ID
};

export default { invoke, transformCallback }; 