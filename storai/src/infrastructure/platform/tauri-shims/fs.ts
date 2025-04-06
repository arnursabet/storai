/**
 * Mock implementation of Tauri's fs plugin for web environment
 */

interface WriteFileOptions {
  path: string;
  contents: string | Uint8Array;
}

/**
 * Mock implementation of exists function
 */
export async function exists(path: string): Promise<boolean> {
  console.log(`[Tauri Shim] 'exists' called with: ${path}`);
  // In web mode, we'll simulate that standard paths exist
  return path.includes('/mock-app-data-dir');
}

/**
 * Mock implementation of readTextFile function
 */
export async function readTextFile(path: string): Promise<string> {
  console.log(`[Tauri Shim] 'readTextFile' called with: ${path}`);
  return '[Mocked file content for web mode]';
}

/**
 * Mock implementation of writeFile function
 */
export async function writeFile(options: WriteFileOptions): Promise<void> {
  const { path, contents } = options;
  console.log(`[Tauri Shim] 'writeFile' called for path: ${path}`, 
    typeof contents === 'string' 
      ? `Content length: ${contents.length}`
      : `Binary content length: ${contents.byteLength}`);
  
  // No-op in web environment
  return;
}

/**
 * Mock implementation of removeFile function
 */
export async function removeFile(path: string): Promise<void> {
  console.log(`[Tauri Shim] 'removeFile' called with: ${path}`);
  // No-op in web environment
  return;
}

/**
 * Mock implementation of createDir function
 */
export async function createDir(path: string, recursive: boolean = false): Promise<void> {
  console.log(`[Tauri Shim] 'createDir' called with: ${path}, recursive: ${recursive}`);
  // No-op in web environment
  return;
}

/**
 * Mock implementation of readDir function (for compatibility even though it's not exported in the real module)
 */
export async function readDir(path: string): Promise<any[]> {
  console.log(`[Tauri Shim] 'readDir' called with: ${path}`);
  // Return empty array as a fallback
  return [];
}

// Add other filesystem functions as needed 