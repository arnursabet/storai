import { useState, useCallback } from 'react';
import { LLMServiceFactory } from '../../infrastructure/llm/LLMServiceFactory';
import { TemplateType } from '../../domain/entities/Template';

/**
 * Hook for handling template generation using LLM service
 */
export function useTemplateGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Generates a template from the provided content using OpenAI
   * 
   * @param content - Source content for template generation
   * @param templateType - Type of template to generate
   * @returns The generated template content
   */
  const generateTemplate = useCallback(async (content: string, templateType: TemplateType): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const llmService = LLMServiceFactory.getService();
      const generatedContent = await llmService.generateTemplate(content, templateType);
      return generatedContent;
    } catch (error) {
      const errorMessage = `Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  /**
   * Configure the API key for the LLM service
   * This is now a no-op since we're using environment variables exclusively,
   * but we keep the function for backward compatibility
   * 
   * @param apiKey - The API key to use (ignored)
   */
  const setApiKey = useCallback((_apiKey: string) => {
    // No longer needed as we use environment variables
    console.info('API key configuration via UI is disabled. Using environment variables instead.');
    return true;
  }, []);
  
  return {
    generateTemplate,
    setApiKey,
    isGenerating,
    error
  };
} 