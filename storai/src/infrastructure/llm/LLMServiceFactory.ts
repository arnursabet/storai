import { ILLMService } from '../../domain/ports/ILLMService';
import { OpenAIService } from './OpenAIService';

/**
 * Factory class to get the appropriate LLM service implementation
 */
export class LLMServiceFactory {
  private static instance: ILLMService | null = null;
  
  /**
   * Get the appropriate LLM service implementation
   * Using environment variables for API key
   * 
   * @param apiKey - Optional API key (ignored, using environment variables)
   * @returns The LLM service instance
   */
  public static getService(_apiKey?: string): ILLMService {
    if (!this.instance) {
      this.instance = new OpenAIService();
    }
    
    return this.instance;
  }
  
  /**
   * Reset the cached instance (useful for testing)
   */
  public static resetService(): void {
    this.instance = null;
  }
} 