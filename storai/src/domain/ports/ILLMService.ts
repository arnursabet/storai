import { TemplateType } from '../entities/Template';

/**
 * Interface for LLM (Large Language Model) service integration
 * This defines the contract for any LLM provider implementation
 */
export interface ILLMService {
  /**
   * Generates a template based on the provided note content and template type
   * 
   * @param noteContent - The original patient note content to analyze
   * @param templateType - The type of template to generate (SOAP, PIRP, etc.)
   * @returns Promise containing the generated template content
   */
  generateTemplate(noteContent: string, templateType: TemplateType): Promise<string>;
} 