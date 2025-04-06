/**
 * General shim for Tauri API module
 * This provides fallbacks for any imports from @tauri-apps/api
 */

// Re-export tauri functions
import * as tauriModule from './tauri';
export const tauri = tauriModule;

// Re-export path functions
import * as pathModule from './path';
export const path = pathModule;

// Export invoke function for core
export const invoke = async (command: string, args?: Record<string, any>): Promise<any> => {
  console.log(`[Tauri API Shim] invoke called with command: ${command}`, args);
  return null;
};

// Export core module
export const core = {
  invoke
};

// Mocked fs module
export const fs = {
  exists: async (path: string): Promise<boolean> => {
    console.log(`[Tauri API Shim] fs.exists called with: ${path}`);
    return true;
  },
  readTextFile: async (path: string): Promise<string> => {
    console.log(`[Tauri API Shim] fs.readTextFile called with: ${path}`);
    return "[Mocked file content]";
  },
  writeTextFile: async (path: string, contents: string): Promise<void> => {
    console.log(`[Tauri API Shim] fs.writeTextFile called with: ${path}, content length: ${contents.length}`);
  },
  removeFile: async (path: string): Promise<void> => {
    console.log(`[Tauri API Shim] fs.removeFile called with: ${path}`);
  },
  createDir: async (path: string, recursive?: boolean): Promise<void> => {
    console.log(`[Tauri API Shim] fs.createDir called with: ${path}, recursive: ${recursive}`);
  },
  readDir: async (path: string): Promise<any[]> => {
    console.log(`[Tauri API Shim] fs.readDir called with: ${path}`);
    return [];
  },
};

// Mocked dialog module
export const dialog = {
  open: async (options?: any): Promise<string | string[] | null> => {
    console.log(`[Tauri API Shim] dialog.open called with:`, options);
    return null;
  },
  save: async (options?: any): Promise<string | null> => {
    console.log(`[Tauri API Shim] dialog.save called with:`, options);
    return null;
  },
};

// Mocked shell module
export const shell = {
  open: async (path: string): Promise<void> => {
    console.log(`[Tauri API Shim] shell.open called with: ${path}`);
    // In web, try to open the URL in a new tab if it's a valid URL
    if (path.startsWith('http')) {
      // Use the global window object, not our exported window module
      globalThis.window.open(path, '_blank');
    }
  },
};

// Mocked app module
export const app = {
  getVersion: async (): Promise<string> => {
    console.log(`[Tauri API Shim] app.getVersion called`);
    return "1.0.0-web";
  },
  getName: async (): Promise<string> => {
    console.log(`[Tauri API Shim] app.getName called`);
    return "StorAI Web";
  },
};

// Mocked window module
export const window = {
  appWindow: {
    maximize: async (): Promise<void> => {
      console.log(`[Tauri API Shim] window.appWindow.maximize called`);
    },
    minimize: async (): Promise<void> => {
      console.log(`[Tauri API Shim] window.appWindow.minimize called`);
    },
    close: async (): Promise<void> => {
      console.log(`[Tauri API Shim] window.appWindow.close called`);
    },
    setTitle: async (title: string): Promise<void> => {
      console.log(`[Tauri API Shim] window.appWindow.setTitle called with: ${title}`);
      document.title = title;
    },
  },
};

// Export other modules as needed 