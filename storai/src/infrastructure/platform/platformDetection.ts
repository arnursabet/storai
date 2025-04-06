/**
 * Platform detection utilities
 */

// Cache the platform detection result to avoid repeated checks
let _isDesktopCache: boolean | null = null;

/**
 * Check if the app is running in Tauri desktop environment
 */
export const isDesktop = (): boolean => {
  // Return cached result if available
  // if (_isDesktopCache !== null) {
  //   return _isDesktopCache;
  // }
  
  // try {
  //   // Check if window exists (in case of SSR)
  //   if (typeof window === 'undefined') {
  //     _isDesktopCache = false;
  //     return false;
  //   }
    
  //   // Check for Tauri global object
  //   _isDesktopCache = 'object' === typeof (window as any).__TAURI__;
  //   return _isDesktopCache;
  // } catch (error) {
  //   // If there's any error, we're not in Tauri
  //   console.warn('Error detecting platform:', error);
  //   _isDesktopCache = false;
  //   return false;
  // }
  return false;
};

/**
 * Check if the app is running in a browser environment
 */
export const isWeb = (): boolean => {
  return !isDesktop();
};

/**
 * A platform definition with capabilities
 */
export enum Platform {
  Desktop = 'desktop',
  Web = 'web'
}

/**
 * Get the current platform
 */
export const getCurrentPlatform = (): Platform => {
  // return isDesktop() ? Platform.Desktop : Platform.Web;
  return Platform.Web;
};

/**
 * Check if the code is running in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

/**
 * Check if we're running with Mock data
 */
export const isMockMode = (): boolean => {
  return isWeb() || (typeof window !== 'undefined' && (window as any).MOCK_MODE === true);
};

/**
 * Log the current platform
 */
export const logPlatformInfo = (): void => {
  const platform = getCurrentPlatform();
  console.log(`Application running on: ${platform} platform in ${isDevelopment() ? 'development' : 'production'} mode`);
  
  // Log additional environment information
  if (isDesktop()) {
    console.log('Tauri environment detected');
    
    // Try to get Tauri version if possible
    try {
      const tauriVersion = (window as any).__TAURI_METADATA__?.version || 'unknown';
      console.log(`Tauri version: ${tauriVersion}`);
    } catch (e) {
      // Ignore errors
    }
  } else {
    console.log('Web browser environment detected');
    
    // Log browser information if available
    if (typeof navigator !== 'undefined') {
      console.log(`User agent: ${navigator.userAgent}`);
    }
  }
  
  if (isMockMode()) {
    console.log('Running in MOCK mode - using simulated data');
  }
}; 