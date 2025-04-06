import { LlamaModel } from './LlamaModel';
import * as path from '@tauri-apps/api/path';
import * as fs from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

/**
 * Utility functions to help debug model installation issues
 */
export class ModelDebug {
  /**
   * Check the model installation and return detailed diagnostics
   */
  public static async checkModelInstallation(): Promise<{
    modelFound: boolean;
    modelPath: string;
    appDataDir: string;
    modelDir: string;
    dirExists: boolean;
    dirContents: string[];
    alternativeLocations: {path: string, exists: boolean}[];
    error?: string;
  }> {
    try {
      const result = {
        modelFound: false,
        modelPath: '',
        appDataDir: '',
        modelDir: '',
        dirExists: false,
        dirContents: [] as string[],
        alternativeLocations: [] as {path: string, exists: boolean}[],
      };
      
      const modelFileName = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
      
      // Get app data directory
      result.appDataDir = await path.appDataDir();
      
      // Get model directory
      result.modelDir = await path.join(result.appDataDir, 'llm-models');
      
      // Check if directory exists
      result.dirExists = await fs.exists(result.modelDir);
      
      // If directory doesn't exist, create it
      if (!result.dirExists) {
        try {
          await fs.create(result.modelDir, { dir: true, recursive: true });
          result.dirExists = true;
          console.log("Created model directory that didn't exist:", result.modelDir);
        } catch (createErr) {
          console.error("Error creating directory:", createErr);
          // Still continue with checks
        }
      }
      
      // Get model path
      result.modelPath = await path.join(result.modelDir, modelFileName);
      
      // Check if model exists
      result.modelFound = await fs.exists(result.modelPath);
      
      // Try alternative app data directory (for backward compatibility)
      try {
        let altAppDataDir = '';
        
        // If the app data dir contains 'com.storai.app', also try with just 'storai'
        if (result.appDataDir.includes('com.storai.app')) {
          altAppDataDir = result.appDataDir.replace('com.storai.app', 'storai');
        } 
        // If the app data dir contains 'storai' (but not 'com.storai.app'), try with 'com.storai.app'
        else if (result.appDataDir.includes('storai') && !result.appDataDir.includes('com.storai.app')) {
          altAppDataDir = result.appDataDir.replace('storai', 'com.storai.app');
        }
        
        if (altAppDataDir) {
          const altModelDir = await path.join(altAppDataDir, 'llm-models');
          const altModelPath = await path.join(altModelDir, modelFileName);
          const altExists = await fs.exists(altModelPath);
          
          result.alternativeLocations.push({
            path: altModelPath,
            exists: altExists
          });
          
          if (altExists) {
            result.modelFound = true;
          }
        }
      } catch (altErr) {
        console.error("Error checking alternative app data directory:", altErr);
      }
      
      // Get directory contents - note that @tauri-apps/plugin-fs doesn't support readDir
      // We'll have to rely on checking the specific file
      try {
        // Since we can't list contents, we'll just report the expected filename
        result.dirContents = [
          "Unable to list directory with Tauri plugin-fs",
          `Expected model file: ${modelFileName}`
        ];
        
        // Check if parent directories exist
        const parentDir = result.appDataDir;
        const parentDirExists = await fs.exists(parentDir);
        if (parentDirExists) {
          result.dirContents.push(`Parent directory (${parentDir}) exists: Yes`);
        } else {
          result.dirContents.push(`Parent directory (${parentDir}) exists: No`);
        }
      } catch (e) {
        console.error("Error checking directories:", e);
        result.dirContents = ["Error reading directory information"];
      }
      
      // Check alternative locations
      try {
        // Home directory - Check explicitly in llm-models folder
        const homeDir = await path.homeDir();
        
        // Check for model in home/llm-models directory
        const homeLlmDir = await path.join(homeDir, 'llm-models');
        const homeModelPath = await path.join(homeLlmDir, modelFileName);
        const homeModelExists = await fs.exists(homeModelPath);
        result.alternativeLocations.push({
          path: homeModelPath,
          exists: homeModelExists
        });
        
        // Also check directly in home directory
        const directHomePath = await path.join(homeDir, modelFileName);
        const directHomeExists = await fs.exists(directHomePath);
        result.alternativeLocations.push({
          path: directHomePath,
          exists: directHomeExists
        });
        
        // Check if model was found in any alternative location
        if (homeModelExists || directHomeExists) {
          result.modelFound = true;
        }
        
        // Downloads directory - use invoke fallback
        try {
          const downloadDirResult = await invoke('get_download_dir');
          const downloadsDir = typeof downloadDirResult === 'string' ? downloadDirResult : '';
          
          if (downloadsDir) {
            const downloadsModelPath = await path.join(downloadsDir, modelFileName);
            const downloadsModelExists = await fs.exists(downloadsModelPath);
            result.alternativeLocations.push({
              path: downloadsModelPath,
              exists: downloadsModelExists
            });
            
            if (downloadsModelExists) {
              result.modelFound = true;
            }
          }
        } catch (e) {
          console.error("Error checking downloads directory:", e);
        }
        
        // App directory
        try {
          const appDir = await path.appDir();
          const appModelPath = await path.join(appDir, modelFileName);
          const appModelExists = await fs.exists(appModelPath);
          result.alternativeLocations.push({
            path: appModelPath,
            exists: appModelExists
          });
          
          if (appModelExists) {
            result.modelFound = true;
          }
        } catch (e) {
          console.error("Error checking app directory:", e);
        }
      } catch (e) {
        console.error("Error checking alternative locations:", e);
      }
      
      return result;
    } catch (error) {
      console.error("Error in checkModelInstallation:", error);
      return {
        modelFound: false,
        modelPath: 'Error',
        appDataDir: 'Error',
        modelDir: 'Error',
        dirExists: false,
        dirContents: [],
        alternativeLocations: [],
        error: String(error),
      };
    }
  }
  
  /**
   * Generate shell commands to install the model on the current platform
   */
  public static async getInstallInstructions(): Promise<{
    platform: string;
    modelDir: string;
    downloadLink: string;
    commands: string[];
    manualSteps: string[];
  }> {
    const appDataDir = await path.appDataDir();
    const modelDir = await path.join(appDataDir, 'llm-models');
    const modelFileName = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
    const modelPath = await path.join(modelDir, modelFileName);
    
    // Check if spaces in path - this can cause issues
    const hasSpacesInPath = modelPath.includes(' ');
    
    // Also check home directory path
    const homeDir = await path.homeDir();
    const homeLlmDir = await path.join(homeDir, 'llm-models');
    const homeModelPath = await path.join(homeLlmDir, modelFileName);
    
    // Also check current directory
    const appDir = await path.appDir();
    const appDirModelPath = await path.join(appDir, modelFileName);
    
    // Determine platform
    const userAgent = navigator.userAgent.toLowerCase();
    let platform = 'unknown';
    
    if (userAgent.indexOf('win') !== -1) {
      platform = 'windows';
    } else if (userAgent.indexOf('mac') !== -1) {
      platform = 'macos';
    } else if (userAgent.indexOf('linux') !== -1) {
      platform = 'linux';
    }
    
    const downloadLink = 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
    
    let commands: string[] = [];
    let manualSteps: string[] = [];
    
    // Special instructions for paths with spaces
    const spaceWarning = hasSpacesInPath ? 
      "⚠️ Warning: Your application path contains spaces, which can cause issues. Consider using one of the alternative paths below." : "";
    
    if (platform === 'windows') {
      commands = [
        `mkdir -p "${modelDir}"`,
        `curl -L "${downloadLink}" -o "${modelPath}"`
      ];
      
      manualSteps = [
        "1. Download the model by clicking the link above",
        `2. Create the directory: ${modelDir}`,
        "   - Open Command Prompt as Administrator",
        `   - Run: mkdir "${modelDir}"`,
        `3. Move the downloaded file to: ${modelPath}`,
        "4. Restart the application",
        "",
        spaceWarning,
        "Alternative Installation Options (recommended):",
        `1. Home Directory: ${homeModelPath}`,
        `   - Create folder: mkdir "${homeLlmDir}"`,
        `   - Move the file: move Downloads\\${modelFileName} "${homeModelPath}"`,
        "",
        `2. App Directory: ${appDirModelPath}`,
        `   - Just copy the model file directly to: ${appDir}`
      ];
    } else if (platform === 'macos' || platform === 'linux') {
      commands = [
        `mkdir -p "${modelDir}"`,
        `curl -L "${downloadLink}" -o "${modelPath}"`
      ];
      
      manualSteps = [
        "1. Download the model by clicking the link above",
        `2. Create the directory: ${modelDir}`,
        "   - Open Terminal",
        `   - Run: mkdir -p "${modelDir}"`,
        `3. Move the downloaded file to the model directory:`,
        `   - Run: mv ~/Downloads/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf "${modelPath}"`,
        "4. Restart the application",
        "",
        spaceWarning,
        "Alternative Installation Options (recommended):",
        `1. Home Directory: ${homeModelPath}`,
        `   - Run: mkdir -p "${homeLlmDir}"`,
        `   - Run: mv ~/Downloads/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf "${homeModelPath}"`,
        "",
        `2. App Directory: ${appDirModelPath}`,
        `   - Just copy the model file directly to: ${appDir}`,
        `   - Run: mv ~/Downloads/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf "${appDirModelPath}"`
      ];
    } else {
      commands = [
        `Please manually create the directory: ${modelDir}`,
        `Then download the model from ${downloadLink}`,
        `And save it to ${modelPath}`
      ];
      
      manualSteps = [
        "1. Download the model by clicking the link above",
        `2. Create the directory: ${modelDir}`,
        `3. Save the downloaded file with exactly this name: ${modelFileName}`,
        `4. Move the file to: ${modelPath}`,
        "5. Restart the application",
        "",
        spaceWarning,
        "Alternative Installation Options (recommended):",
        `1. Home Directory: ${homeModelPath}`,
        `2. App Directory: ${appDirModelPath}`
      ];
    }
    
    return {
      platform,
      modelDir,
      downloadLink,
      commands,
      manualSteps
    };
  }
} 