import { platform } from '@tauri-apps/api/os';

/**
 * Gets the OS type to help with platform-specific operations
 * Returns 'windows', 'macos', 'linux', or 'unknown'
 */
export async function getOSType(): Promise<string> {
  try {
    const osType = await platform();
    
    if (osType.toLowerCase().includes('win')) {
      return 'windows';
    } else if (osType.toLowerCase().includes('darwin') || osType.toLowerCase().includes('mac')) {
      return 'macos';
    } else if (osType.toLowerCase().includes('linux')) {
      return 'linux';
    } else {
      return 'unknown';
    }
  } catch (error) {
    console.error('Error detecting OS type:', error);
    return 'unknown';
  }
}

/**
 * Gets the appropriate path separator for the current OS
 * Returns '\\' for Windows, '/' for other platforms
 */
export async function getPathSeparator(): Promise<string> {
  const osType = await getOSType();
  return osType === 'windows' ? '\\' : '/';
} 