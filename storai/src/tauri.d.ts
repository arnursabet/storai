// Type declarations for Tauri API modules
declare module '@tauri-apps/api/tauri' {
  export function invoke(cmd: string, args?: Record<string, unknown>): Promise<any>;
}

declare module '@tauri-apps/api/fs' {
  export function exists(path: string): Promise<boolean>;
  export function createDir(path: string, options?: { recursive: boolean }): Promise<void>;
}

declare module '@tauri-apps/plugin-fs' {
  export function exists(path: string): Promise<boolean>;
  export function create(path: string, options?: { dir?: boolean; recursive?: boolean }): Promise<void>;
}

declare module '@tauri-apps/api/path' {
  export function appDataDir(): Promise<string>;
  export function join(...paths: string[]): Promise<string>;
}

declare module '@tauri-apps/api/os' {
  export function platform(): Promise<string>;
}

declare module '@tauri-apps/api/core' {
  export function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
} 