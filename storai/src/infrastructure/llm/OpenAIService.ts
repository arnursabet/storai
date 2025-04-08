import { ILLMService } from '../../domain/ports/ILLMService';
import { TemplateType } from '../../domain/entities/Template';

/**
 * OpenAI-based implementation of the LLM service
 * Uses OpenAI API to generate templates from patient notes
 */
export class OpenAIService implements ILLMService {
  private apiKey: string;
  private apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  
  constructor(apiKey?: string) {
    const hasViteEnv = typeof import.meta !== 'undefined' && import.meta.env !== undefined;
    
    this.apiKey = apiKey || (hasViteEnv ? import.meta.env.VITE_OPENAI_API_KEY || '' : '')

    console.log(
      'Environment check:', {
       hasViteEnv,
       viteEnvKeys: hasViteEnv ? Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')) : 'N/A'
    });
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found in environment variables.');
    } else {
      console.info('OpenAI API key successfully loaded.');
    }
  }
  
  /**
   * Generates a formatted template based on patient notes
   * 
   * @param noteContent - The original patient note to analyze
   * @param templateType - The type of template to generate (SOAP, PIRP, etc.)
   * @returns The generated template content
   */
  async generateTemplate(noteContent: string, templateType: TemplateType): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables.');
    }
    
    try {
      // Create template-specific system prompt
      const systemPrompt = this.createSystemPrompt(templateType);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: noteContent }
          ],
          temperature: 0, // Lower temperature for more consistent outputs
          max_tokens: 2000, // Increased max tokens for longer responses
          presence_penalty: 0.1, // Slight penalty to avoid repeating the same content
          frequency_penalty: 0.2 // Penalty to encourage more varied word choice
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Failed to generate template';
      
    } catch (error) {
      console.error('Error generating template with OpenAI:', error);
      throw new Error(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Creates a system prompt based on the template type
   */
  private createSystemPrompt(templateType: TemplateType): string {
    const basePrompt = `You are a professional medical note writer. Analyze the patient notes and create a well-formatted ${templateType} note.
Format your response with clear sections and structure.
Present each section header on its own line with a colon at the end.
Do not provide any additional explanations, comments, or analysis outside the template itself.
Use only information present in the original notes.`;
    
    switch (templateType) {
      case 'SOAP':
        return `${basePrompt}
The SOAP note must have these specific sections:
Subjective: Patient's reported symptoms and concerns
Objective: Observable findings and measurements
Assessment: Clinical assessment of the patient's condition
Plan: Treatment plan and next steps`;
        
      case 'PIRP':
        return `${basePrompt}
The PIRP note must have these specific sections:
Problem: Identify the main clinical problems
Intervention: Describe interventions performed
Response: Document the patient's response to interventions
Plan: Detail the ongoing care plan`;
        
      case 'DAP':
        return `${basePrompt}
The DAP note must have these specific sections:
Data: Relevant patient information and observations
Assessment: Clinical assessment of the conditions
Plan: Treatment strategy and recommendations`;
        
      case 'PIE':
        return `${basePrompt}
The PIE note must have these specific sections:
Problem: Identify the patient's medical problems
Intervention: List the interventions performed
Evaluation: Evaluate the effectiveness of interventions`;
        
      case 'SIRP':
        return `${basePrompt}
The SIRP note must have these specific sections:
Situation: Current patient situation and context
Intervention: Interventions performed
Response: Patient's response to interventions
Plan: Next steps in treatment`;
        
      case 'GIRP':
        return `${basePrompt}
The GIRP note must have these specific sections:
Goal: Treatment goals for the patient
Intervention: Interventions performed or planned
Response: Patient's response to interventions
Plan: Ongoing plan and next steps`;
        
      default:
        return `${basePrompt}
Organize the information in a structured way that follows standard medical documentation practices.`;
    }
  }
} 