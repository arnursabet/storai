/**
 * Mock implementation of Tauri's invoke function for web environment
 */

/**
 * Mock implementation of the Tauri invoke function
 * This provides a fallback when running in a browser
 */
export async function invoke(command: string, args?: any): Promise<any> {
  console.warn(`[Tauri Shim] 'invoke' called with command: ${command}`, args);
  
  // Handle specific commands with mock implementations
  switch (command) {
    case 'read_dir':
      return mockReadDir(args?.dir);
    case 'create_dir_all':
      return mockCreateDirAll(args?.dir);
    default:
      console.warn(`[Tauri Shim] Unhandled command: ${command}`);
      return null;
  }
}

/**
 * Mock implementation of read_dir command
 */
function mockReadDir(dir: string): any[] {
  console.log(`[Tauri Shim] Simulating 'read_dir' for: ${dir}`);
  // Return empty array as a fallback
  return [];
}

/**
 * Mock implementation of create_dir_all command
 */
function mockCreateDirAll(dir: string): void {
  console.log(`[Tauri Shim] Simulating 'create_dir_all' for: ${dir}`);
  // No-op in web environment
  return;
}

// Export any other functions or objects that might be imported from this module
export const convertFileSrc = (filePath: string): string => {
  console.warn(`[Tauri Shim] 'convertFileSrc' called with: ${filePath}`);
  // Return the original path as a fallback
  return filePath;
};

// Add other Tauri API functions as needed 