/**
 * Mock implementation of Tauri's path module for web environment
 */

/**
 * Mock implementation of Tauri's join function
 */
export async function join(...paths: string[]): Promise<string> {
  console.log(`[Tauri Shim] 'join' called with:`, paths);
  return paths.join('/').replace(/\/+/g, '/');
}

/**
 * Mock implementation of Tauri's appDataDir function
 */
export async function appDataDir(): Promise<string> {
  console.log(`[Tauri Shim] 'appDataDir' called`);
  return '/mock-app-data-dir';
}

/**
 * Mock implementation of Tauri's resolve function
 */
export async function resolve(path: string): Promise<string> {
  console.log(`[Tauri Shim] 'resolve' called with: ${path}`);
  return path;
}

/**
 * Mock implementation of Tauri's dirname function
 */
export async function dirname(path: string): Promise<string> {
  console.log(`[Tauri Shim] 'dirname' called with: ${path}`);
  const lastSlashIndex = path.lastIndexOf('/');
  return lastSlashIndex === -1 ? '.' : path.substring(0, lastSlashIndex);
}

/**
 * Mock implementation of Tauri's basename function
 */
export async function basename(path: string): Promise<string> {
  console.log(`[Tauri Shim] 'basename' called with: ${path}`);
  const lastSlashIndex = path.lastIndexOf('/');
  return lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);
}

/**
 * Mock implementation of Tauri's extname function
 */
export async function extname(path: string): Promise<string> {
  console.log(`[Tauri Shim] 'extname' called with: ${path}`);
  const lastDotIndex = path.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : path.substring(lastDotIndex);
}

// Add other path functions as needed 