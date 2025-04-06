// Type definitions for Tauri APIs
declare module '@tauri-apps/api/path' {
  export function appDir(): Promise<string>;
  export function appDataDir(): Promise<string>;
  export function audioDir(): Promise<string>;
  export function cacheDir(): Promise<string>;
  export function configDir(): Promise<string>;
  export function dataDir(): Promise<string>;
  export function desktopDir(): Promise<string>;
  export function documentDir(): Promise<string>;
  export function downloadDir(): Promise<string>;
  export function executableDir(): Promise<string>;
  export function fontDir(): Promise<string>;
  export function homeDir(): Promise<string>;
  export function localDataDir(): Promise<string>;
  export function pictureDir(): Promise<string>;
  export function publicDir(): Promise<string>;
  export function resourceDir(): Promise<string>;
  export function resolveResource(resourcePath: string): Promise<string>;
  export function runtimeDir(): Promise<string>;
  export function templateDir(): Promise<string>;
  export function videoDir(): Promise<string>;
  export function basename(path: string, ext?: string): Promise<string>;
  export function dirname(path: string): Promise<string>;
  export function extname(path: string): Promise<string>;
  export function isAbsolute(path: string): Promise<boolean>;
  export function join(...paths: string[]): Promise<string>;
  export function normalize(path: string): Promise<string>;
  export function resolve(path: string): Promise<string>;
}

declare module '@tauri-apps/plugin-fs' {
  export function exists(path: string): Promise<boolean>;
  export function create(path: string, options?: { dir?: boolean; recursive?: boolean }): Promise<void>;
  export function readTextFile(path: string, options?: { encoding?: string }): Promise<string>;
  export function writeFile(path: string, data: string | ArrayBuffer): Promise<void>;
  export function writeTextFile(path: string, data: string, options?: { encoding?: string }): Promise<void>;
  export function removeFile(path: string): Promise<void>;
  export function removeDir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function copyFile(source: string, destination: string): Promise<void>;
  export function renameFile(oldPath: string, newPath: string): Promise<void>;
  export function metadata(path: string): Promise<{
    isDir: boolean;
    isFile: boolean;
    readonly: boolean;
    size: number;
    created: number;
    modified: number;
    accessed: number;
  }>;
} 