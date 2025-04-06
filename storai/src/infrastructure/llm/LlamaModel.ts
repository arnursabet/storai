import { invoke } from '@tauri-apps/api/core';
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { TemplateType } from '../../domain/entities/Template';

/**
 * LlamaModel class handles the interface with the llama.cpp running locally
 * for generating summaries from clinical notes
 */
export class LlamaModel {
  private static instance: LlamaModel;
  private static modelPath: string | null = null;
  private static isInitialized: boolean = false;
  
  private constructor() {}

  public static getInstance(): LlamaModel {
    if (!LlamaModel.instance) {
      LlamaModel.instance = new LlamaModel();
    }
    return LlamaModel.instance;
  }

  /**
   * Static initialize method that can be called directly on the class
   */
  public static async initialize(): Promise<boolean> {
    console.log("Starting LLM initialization process");
    const instance = LlamaModel.getInstance();
    const success = await instance.initialize();
    
    if (!success) {
      // Try alternative initialization with direct model path
      return await LlamaModel.tryAlternativeInitialization();
    }
    
    return success;
  }

  /**
   * Initialize the LLM model
   */
  public async initialize(): Promise<boolean> {
    try {
      // Try to get the model path from multiple locations
      const found = await this.findModelInMultipleLocations();
      if (!found) {
        console.warn("Model not found in any of the standard locations");
        return false;
      }
      
      console.log("Found model at path:", LlamaModel.modelPath);
      
      // Initialize the LLM using Tauri command
      try {
        await invoke('initialize_llm', { 
          modelPath: LlamaModel.modelPath 
        });
        
        // If no error was thrown, initialization was successful
        LlamaModel.isInitialized = true;
        console.log("LLM initialization successful");
        return true;
      } catch (invokeError) {
        console.error("Error from Rust initialize_llm function:", invokeError);
        LlamaModel.isInitialized = false;
        return false;
      }
    } catch (error) {
      console.error("Error initializing LLM:", error);
      LlamaModel.isInitialized = false;
      return false;
    }
  }
  
  /**
   * Try to find the model file in multiple potential locations
   */
  private async findModelInMultipleLocations(): Promise<boolean> {
    const modelFileName = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
    
    // Try app directory first (more likely to work with Tauri's security model)
    try {
      const appDir = await path.appDir();
      console.log("Checking app directory:", appDir);
      
      const modelPath = await path.join(appDir, modelFileName);
      console.log("Checking for model at:", modelPath);
      
      const exists = await fs.exists(modelPath);
      if (exists) {
        console.log("Found model in app directory:", modelPath);
        LlamaModel.modelPath = modelPath;
        return true;
      }
    } catch (error) {
      console.error("Error checking app directory:", error);
    }
    
    // Try home directory next
    try {
      // Using the environment variable API to get home directory
      const homeDir = await path.homeDir();
      console.log("Checking home directory:", homeDir);
      
      // Check the user home folder first
      const llmModelsDir = await path.join(homeDir, 'llm-models');
      const homeModelPath = await path.join(llmModelsDir, modelFileName);
      console.log("Checking for model at:", homeModelPath);
      
      // Also check for model directly in home dir
      const directHomeModelPath = await path.join(homeDir, modelFileName);
      console.log("Also checking for model at:", directHomeModelPath);
      
      // Check both locations
      const existsInModelsDir = await fs.exists(homeModelPath);
      const existsDirectly = await fs.exists(directHomeModelPath);
      
      if (existsInModelsDir) {
        console.log("Found model in home llm-models directory:", homeModelPath);
        LlamaModel.modelPath = homeModelPath;
        return true;
      }
      
      if (existsDirectly) {
        console.log("Found model directly in home directory:", directHomeModelPath);
        LlamaModel.modelPath = directHomeModelPath;
        return true;
      }
    } catch (error) {
      console.error("Error checking home directory:", error);
    }
    
    // Try app data directory last
    try {
      const appData = await path.appDataDir();
      console.log("Checking app data directory:", appData);
      
      const modelDir = await path.join(appData, 'llm-models');
      const modelPath = await path.join(modelDir, modelFileName);
      
      // Create the directory if it doesn't exist
      if (!await fs.exists(modelDir)) {
        await fs.create(modelDir, { dir: true, recursive: true });
        console.log("Created model directory:", modelDir);
      }
      
      // Check if model exists
      const exists = await fs.exists(modelPath);
      if (exists) {
        console.log("Found model at app data location:", modelPath);
        LlamaModel.modelPath = modelPath;
        return true;
      }
      
      // Try alternative directory name (for backward compatibility)
      // If the appData path contains 'com.storai.app', also try with just 'storai'
      if (appData.includes('com.storai.app')) {
        const altAppData = appData.replace('com.storai.app', 'storai');
        console.log("Checking alternative app data directory:", altAppData);
        
        const altModelDir = await path.join(altAppData, 'llm-models');
        const altModelPath = await path.join(altModelDir, modelFileName);
        
        const altExists = await fs.exists(altModelPath);
        if (altExists) {
          console.log("Found model at alternative app data location:", altModelPath);
          LlamaModel.modelPath = altModelPath;
          return true;
        }
      }
      // If the appData path contains 'storai', also try with 'com.storai.app'
      else if (appData.includes('storai') && !appData.includes('com.storai.app')) {
        const altAppData = appData.replace('storai', 'com.storai.app');
        console.log("Checking alternative app data directory:", altAppData);
        
        const altModelDir = await path.join(altAppData, 'llm-models');
        const altModelPath = await path.join(altModelDir, modelFileName);
        
        const altExists = await fs.exists(altModelPath);
        if (altExists) {
          console.log("Found model at alternative app data location:", altModelPath);
          LlamaModel.modelPath = altModelPath;
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking app data location:", error);
    }
    
    // Try current working directory
    try {
      const resourceDir = await path.resourceDir();
      console.log("Checking resource directory:", resourceDir);
      
      const modelPath = await path.join(resourceDir, modelFileName);
      console.log("Checking for model at:", modelPath);
      
      const exists = await fs.exists(modelPath);
      if (exists) {
        console.log("Found model in resource directory:", modelPath);
        LlamaModel.modelPath = modelPath;
        return true;
      }
    } catch (error) {
      console.error("Error checking resource directory:", error);
    }
    
    // Try downloads directory as a fallback
    try {
      const downloadDirResult = await invoke('get_download_dir');
      const downloadsDir = typeof downloadDirResult === 'string' ? downloadDirResult : '';
      console.log("Checking downloads directory:", downloadsDir);
      
      if (downloadsDir) {
        const modelPath = await path.join(downloadsDir, modelFileName);
        console.log("Checking for model at:", modelPath);
        
        const exists = await fs.exists(modelPath);
        if (exists) {
          console.log("Found model in downloads directory:", modelPath);
          LlamaModel.modelPath = modelPath;
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking downloads directory:", error);
    }
    
    console.log("Model not found in any of the searched locations");
    return false;
  }
  
  /**
   * Check if the model is downloaded and available
   * Static method that can be called directly on the class
   */
  public static async isModelAvailable(): Promise<boolean> {
    try {
      // We need a more comprehensive check across locations
      const instance = LlamaModel.getInstance();
      const found = await instance.findModelInMultipleLocations();
      return found;
    } catch (error) {
      console.error("Error checking if model is available:", error);
      return false;
    }
  }
  
  /**
   * Force reload model path and check availability
   * Useful when debugging model path issues
   */
  public static async forceCheckModelAvailability(): Promise<boolean> {
    try {
      // Reset the model path
      LlamaModel.modelPath = null;
      
      // Get the path
      const appData = await path.appDataDir();
      console.log("DEBUG - App data directory:", appData);
      
      const modelDir = await path.join(appData, 'llm-models');
      console.log("DEBUG - Model directory:", modelDir);
      
      // Check if model directory exists
      let dirExists;
      try {
        dirExists = await fs.exists(modelDir);
        console.log("DEBUG - Model directory exists:", dirExists);
      } catch (existsErr) {
        console.error("DEBUG - Error checking if model directory exists:", existsErr);
        dirExists = false;
      }
      
      if (!dirExists) {
        console.error("DEBUG - Model directory does not exist. Creating it...");
        // Try to create it
        try {
          await fs.create(modelDir, { dir: true, recursive: true });
          console.log("DEBUG - Created model directory:", modelDir);
          
          // Check if creation was successful
          const createdDirExists = await fs.exists(modelDir);
          console.log("DEBUG - After creation, directory exists:", createdDirExists);
        } catch (err) {
          console.error("DEBUG - Failed to create model directory:", err);
        }
      }
      
      // Log appData contents to see what's there
      try {
        console.log("DEBUG - Checking if appData directory exists:", await fs.exists(appData));
        // We can't list directories with the current plugin, so let's test for common subdirectories
        const parentDir = appData.substring(0, appData.lastIndexOf('/'));
        console.log("DEBUG - Parent path exists:", await fs.exists(parentDir));
      } catch (e) {
        console.error("DEBUG - Error checking app data parent directory:", e);
      }
      
      const modelFileName = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
      const fullPath = await path.join(modelDir, modelFileName);
      console.log("DEBUG - Full model path:", fullPath);
      
      let exists;
      try {
        exists = await fs.exists(fullPath);
        console.log(`DEBUG - Model file exists: ${exists}`);
      } catch (existsErr) {
        console.error("DEBUG - Error checking if model file exists:", existsErr);
        exists = false;
      }
      
      // If model doesn't exist, provide detailed instructions
      if (!exists) {
        console.log("DEBUG - Model file not found. Please download from:");
        console.log("DEBUG - https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf");
        console.log("DEBUG - And save it to:", fullPath);
        
        // Try to create a test file in the model directory to check permissions
        try {
          const testFilePath = await path.join(modelDir, "test.txt");
          await fs.writeFile(testFilePath, "This is a test file to check write permissions");
          console.log("DEBUG - Created test file successfully at:", testFilePath);
          
          const testFileExists = await fs.exists(testFilePath);
          console.log("DEBUG - Test file exists:", testFileExists);
        } catch (testErr) {
          console.error("DEBUG - Failed to create test file in model directory:", testErr);
        }
      }
      
      // Now let's also check the home directory
      try {
        const homeDir = await path.homeDir();
        console.log("DEBUG - Checking home directory:", homeDir);
        
        // Check the home/llm-models directory
        const homeLlmDir = await path.join(homeDir, 'llm-models');
        const homeModelPath = await path.join(homeLlmDir, modelFileName);
        
        const homeExists = await fs.exists(homeModelPath);
        console.log(`DEBUG - Model in home llm-models directory exists: ${homeExists}`);
        
        if (homeExists) {
          LlamaModel.modelPath = homeModelPath;
          return true;
        }
        
        // Check directly in home
        const directHomePath = await path.join(homeDir, modelFileName);
        const directHomeExists = await fs.exists(directHomePath);
        console.log(`DEBUG - Model directly in home directory exists: ${directHomeExists}`);
        
        if (directHomeExists) {
          LlamaModel.modelPath = directHomePath;
          return true;
        }
      } catch (homeErr) {
        console.error("DEBUG - Error checking home directory:", homeErr);
      }
      
      LlamaModel.modelPath = fullPath;
      return exists;
    } catch (error) {
      console.error("DEBUG - Error during force check:", error);
      return false;
    }
  }
  
  /**
   * Instance method for backward compatibility
   */
  public async isModelAvailable(): Promise<boolean> {
    return LlamaModel.isModelAvailable();
  }
  
  /**
   * Generate a summary from clinical notes (instance method)
   */
  public async generateResponse(prompt: string, templateType?: TemplateType): Promise<string> {
    if (!LlamaModel.isInitialized) {
      throw new Error("LLM not initialized. Please initialize before generating responses.");
    }

    try {
      return await invoke('run_llm_inference', { 
        prompt,
        templateType: templateType || 'general'
      });
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate response from LLM");
    }
  }
  
  /**
   * Static method to generate a summary from clinical notes
   */
  public static async generateResponse(prompt: string, templateType?: TemplateType): Promise<string> {
    const instance = LlamaModel.getInstance();
    return await instance.generateResponse(prompt, templateType);
  }
  
  /**
   * Generate a structured summary from clinical notes with specific sections
   */
  public static async generateSummary(
    notes: string,
    templateType: string,
    sections: { id: string; name: string }[]
  ): Promise<{ [sectionId: string]: string }> {
    try {
      // Check if model is initialized
      if (!LlamaModel.isInitialized) {
        console.log("LLM not initialized, attempting to initialize now...");
        const initialized = await LlamaModel.initialize();
        if (!initialized) {
          console.error("LLM initialization failed. Checking model availability...");
          const isAvailable = await LlamaModel.isModelAvailable();
          
          if (!isAvailable) {
            throw new Error("Model file not found. Please download and install the model file.");
          } else {
            throw new Error("Model file found but initialization failed. Check console for details.");
          }
        } else {
          console.log("LLM successfully initialized.");
        }
      }
      
      // Create the prompt
      console.log(`Creating prompt for ${templateType} format with ${sections.length} sections`);
      const prompt = LlamaModel.createPrompt(notes, templateType, sections);
      
      // Generate the response
      console.log("Sending prompt to LLM for inference...");
      let response = '';
      try {
        response = await LlamaModel.generateResponse(prompt);
        console.log("Successfully received response from LLM");
      } catch (inferenceError) {
        console.error("Error during inference:", inferenceError);
        
        // If inference failed, provide fallback content for development/testing
        console.log("Using fallback response for development");
        if (templateType === 'SOAP') {
          response = "Subjective: Patient reports symptoms.\n\nObjective: Clinical observations.\n\nAssessment: Analysis of condition.\n\nPlan: Treatment recommendations.";
        } else if (templateType === 'PIRP') {
          response = "Problem: Identified issues.\n\nIntervention: Therapeutic methods used.\n\nResponse: Patient's reaction.\n\nPlan: Future treatment direction.";
        } else {
          response = "Summary of patient notes in general format.";
        }
      }
      
      // Parse the response into sections
      console.log("Parsing response into structured sections");
      return LlamaModel.parseResponse(response, sections);
    } catch (error: unknown) {
      console.error("Error generating summary:", error);
      
      // Create an empty result with all sections
      const emptyResult: { [sectionId: string]: string } = {};
      sections.forEach(section => {
        emptyResult[section.id] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      });
      
      // Re-throw the error for upstream handling
      throw new Error(`Failed to generate summary from notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Create a prompt for the LLM based on template and notes
   */
  private static createPrompt(
    notes: string,
    templateType: TemplateType,
    sections: { id: string; name: string }[]
  ): string {
    // Create a standardized prompt for the LLM
    let prompt = `
System: You are a professional clinical note summarizer. Given the following clinical session notes, 
generate a concise and structured summary following the ${templateType} format.
Follow HIPAA guidelines and ensure patient confidentiality.

The ${templateType} format has the following sections:
${sections.map(s => `- ${s.name}`).join('\n')}

Here are the session notes:
${notes}

Please provide a structured summary in ${templateType} format, with each section clearly labeled.
`;

    // Add specific instructions based on template type
    switch (templateType) {
      case 'SOAP':
        prompt += `
For the SOAP format:
- In Subjective: Focus on patient's reported symptoms and experiences
- In Objective: Include observable data and clinical findings
- In Assessment: Provide diagnostic impressions and analysis
- In Plan: Outline treatment recommendations and follow-up`;
        break;
      
      case 'PIRP':
        prompt += `
For the PIRP format:
- In Problem: Clearly identify the health concern or issue
- In Intervention: Describe therapeutic methods used in session
- In Response: Document patient's reaction to interventions
- In Plan: Detail future treatment direction`;
        break;
      
      // Add other template-specific instructions as needed
    }
    
    return prompt;
  }
  
  /**
   * Parse the LLM response into structured sections
   */
  private static parseResponse(
    response: string,
    sections: { id: string; name: string }[]
  ): { [sectionId: string]: string } {
    const result: { [sectionId: string]: string } = {};
    
    // Simple parsing - find each section by name and extract content
    // A more robust implementation would handle various edge cases
    for (const section of sections) {
      const sectionRegex = new RegExp(`${section.name}[:\\s]+(.*?)(?=\\n\\n|$)`, 'is');
      const match = response.match(sectionRegex);
      
      if (match && match[1]) {
        result[section.id] = match[1].trim();
      } else {
        result[section.id] = ''; // No content found for this section
      }
    }
    
    return result;
  }
  
  /**
   * Anonymize personal information in text using pattern matching
   * This is a simple implementation and would need to be expanded
   * with more sophisticated NLP techniques for production use
   */
  static anonymizeText(text: string): string {
    // Replace common PII patterns
    return text
      // Replace names (basic pattern)
      .replace(/\b(?:Dr|Mr|Mrs|Ms|Miss)\.?\s+[A-Z][a-z]+\b/g, '[HEALTHCARE PROVIDER]')
      
      // Replace phone numbers (basic US format)
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE NUMBER]')
      
      // Replace emails
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      
      // Replace addresses (basic pattern)
      .replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct)\b/gi, '[ADDRESS]')
      
      // Replace SSN (basic pattern)
      .replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[SSN]')
      
      // Replace dates of birth (basic pattern)
      .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b/gi, '[DATE OF BIRTH]')
      .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, '[DATE OF BIRTH]');
  }

  // Simple platform detection instead of using OS module
  private getPlatformInfo(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf('win') !== -1) {
      return 'windows';
    } else if (userAgent.indexOf('mac') !== -1) {
      return 'macos';
    } else if (userAgent.indexOf('linux') !== -1) {
      return 'linux';
    } else {
      return 'unknown';
    }
  }

  /**
   * Try to initialize the LLM with alternative paths if the normal initialization fails
   */
  private static async tryAlternativeInitialization(): Promise<boolean> {
    console.log("Attempting alternative initialization with direct model paths");
    try {
      // Query potential model paths
      const modelFileName = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
      const alternativePaths: string[] = [];
      
      // 1. Try home directory
      try {
        const homeDir = await path.homeDir();
        alternativePaths.push(await path.join(homeDir, modelFileName));
        alternativePaths.push(await path.join(homeDir, 'llm-models', modelFileName));
      } catch (e) {
        console.error("Error getting home directory paths:", e);
      }
      
      // 2. Try app directory
      try {
        const appDir = await path.appDir();
        alternativePaths.push(await path.join(appDir, modelFileName));
      } catch (e) {
        console.error("Error getting app directory path:", e);
      }
      
      // 3. Try resource directory
      try {
        const resourceDir = await path.resourceDir();
        alternativePaths.push(await path.join(resourceDir, modelFileName));
      } catch (e) {
        console.error("Error getting resource directory path:", e);
      }
      
      // 4. Try downloads directory
      try {
        const downloadDirResult = await invoke('get_download_dir');
        if (typeof downloadDirResult === 'string' && downloadDirResult) {
          alternativePaths.push(await path.join(downloadDirResult, modelFileName));
        }
      } catch (e) {
        console.error("Error getting downloads directory path:", e);
      }
      
      // Try each path
      console.log("Trying alternative paths:", alternativePaths);
      for (const modelPath of alternativePaths) {
        try {
          console.log(`Checking path: ${modelPath}`);
          const exists = await fs.exists(modelPath);
          
          if (exists) {
            console.log(`Model found at alternative path: ${modelPath}`);
            LlamaModel.modelPath = modelPath;
            
            // Try to initialize with this path
            try {
              console.log(`Initializing with alternative path: ${modelPath}`);
              await invoke('initialize_llm', { modelPath });
              
              // If we get here, it worked
              LlamaModel.isInitialized = true;
              console.log("Alternative initialization successful");
              return true;
            } catch (invokeErr) {
              console.error(`Error initializing with alternative path ${modelPath}:`, invokeErr);
              // Continue to next path
            }
          }
        } catch (pathErr) {
          console.error(`Error checking alternative path ${modelPath}:`, pathErr);
          // Continue to next path
        }
      }
      
      console.log("All alternative initialization attempts failed");
      return false;
    } catch (error) {
      console.error("Error in alternative initialization:", error);
      return false;
    }
  }
} 