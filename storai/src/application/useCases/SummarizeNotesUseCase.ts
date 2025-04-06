import { LlamaModel } from "../../infrastructure/llm/LlamaModel";
import { Template, TemplateType, TEMPLATES } from "../../domain/entities/Template";
import { DatabaseService, Note, Folder } from "../../infrastructure/storage/Database";

/**
 * SummarizeNotesUseCase handles the business logic for generating
 * structured note summaries from raw clinical notes
 */
export class SummarizeNotesUseCase {
  /**
   * Generate a structured note summary from raw notes using the specified template
   */
  static async summarizeNotes(
    rawNotes: string,
    templateType: TemplateType,
    folderId: string | null,
    title: string
  ): Promise<string> {
    try {
      // Check if model is available
      const isModelAvailable = await LlamaModel.isModelAvailable();
      if (!isModelAvailable) {
        throw new Error("The LLM model is not available. Please download it first.");
      }
      
      // Verify folder exists or create a default one
      const validFolderId = folderId ? 
        await this.ensureFolderExists(folderId) : 
        await this.createDefaultFolder();
      
      // Get the template
      const template = TEMPLATES[templateType];
      if (!template) {
        throw new Error(`Template ${templateType} not found.`);
      }
      
      // Anonymize personal information
      const anonymizedText = LlamaModel.anonymizeText(rawNotes);
      
      // Generate summary
      const summaryBySection = await LlamaModel.generateSummary(
        anonymizedText,
        templateType,
        template.sections
      );
      
      // Format the structured summary
      const formattedSummary = this.formatSummary(template, summaryBySection);
      
      // Save the note
      await DatabaseService.createNote({
        folderId: validFolderId,
        title,
        content: formattedSummary,
        templateType,
      });
      
      return formattedSummary;
    } catch (error) {
      console.error("Error in summarizeNotes:", error);
      throw error;
    }
  }
  
  /**
   * Ensure that a folder with the given ID exists, or create a default one
   */
  private static async ensureFolderExists(folderId: string): Promise<string> {
    try {
      console.log(`Checking if folder with ID '${folderId}' exists...`);
      
      // List all folders for debugging
      await DatabaseService.debugFolders();
      
      // Check if the folderId is a simple number like "1", which isn't a valid UUID
      // In this case, we should always create a new folder
      if (/^\d+$/.test(folderId)) {
        console.log(`Folder ID '${folderId}' appears to be a numeric ID, creating a new folder instead`);
        const newFolderId = await DatabaseService.createFolder("Default Folder");
        console.log(`Created new default folder with ID: ${newFolderId}`);
        return newFolderId;
      }
      
      // Otherwise check if the folder exists
      try {
        const folderCheck = await this.getFolderById(folderId);
        console.log("Folder check result:", folderCheck);
        
        if (folderCheck) {
          console.log(`Folder with ID ${folderId} exists`);
          return folderId;
        }
      } catch (error) {
        console.log("Folder doesn't exist, will create a new one");
      }
      
      // If not found, create a default folder
      const newFolderId = await DatabaseService.createFolder("Default Folder");
      console.log(`Created new default folder with ID: ${newFolderId}`);
      return newFolderId;
    } catch (error) {
      console.error("Error ensuring folder exists:", error);
      throw error;
    }
  }
  
  /**
   * Get a folder by its ID
   */
  private static async getFolderById(folderId: string): Promise<Folder | null> {
    try {
      const folders = await DatabaseService.getFolders();
      return folders.find(folder => folder.id === folderId) || null;
    } catch (error) {
      console.error("Error getting folder by ID:", error);
      throw error;
    }
  }
  
  /**
   * Format a summary based on the template and section content
   */
  static formatSummary(
    template: Template,
    sectionContent: { [sectionId: string]: string }
  ): string {
    return template.sections
      .map(section => {
        const content = sectionContent[section.id] || '';
        return `## ${section.name}\n\n${content}\n`;
      })
      .join('\n');
  }
  
  /**
   * Summarize an uploaded document
   */
  static async summarizeDocument(
    filePath: string,
    templateType: TemplateType,
    folderId: string | null,
    title: string
  ): Promise<string> {
    try {
      // In a real implementation, this would extract text from various
      // document formats (PDF, DOC, etc.) using a separate service
      
      // For now, we'll simulate the extraction
      const extractedText = await this.simulateTextExtraction(filePath);
      
      // Once we have the text, use the standard summarization
      return this.summarizeNotes(extractedText, templateType, folderId, title);
    } catch (error) {
      console.error("Error in summarizeDocument:", error);
      throw error;
    }
  }
  
  /**
   * Simulate text extraction from a document
   * In a real app, this would use libraries to extract text from various formats
   */
  private static async simulateTextExtraction(filePath: string): Promise<string> {
    // In a real implementation, check file type and use appropriate extractor
    // For now, just return dummy text
    return `Patient reports increased anxiety over the past two weeks.
Episodes of shortness of breath, racing heart, and difficulty concentrating.
Reports sleeping 5-6 hours per night, down from usual 7-8 hours.
Patient relates anxiety to upcoming job interview and financial concerns.
No changes in medication or physical health reported.
Patient demonstrates good insight into anxiety triggers.
Discussed breathing techniques and cognitive reframing during session.
Patient practiced grounding exercises with observable reduction in physical tension.
Will continue weekly sessions and introduce additional coping strategies.
Patient agrees to practice mindfulness techniques daily until next appointment.`;
  }

  static async saveSummary(
    folderId: string | null,
    notes: Note[],
    summary: string
  ): Promise<string> {
    try {
      // Verify folder exists or create a default one
      const validFolderId = folderId ? 
        await this.ensureFolderExists(folderId) : 
        await this.createDefaultFolder();
      
      // Create a new note with the summary
      return await DatabaseService.createNote({
        folderId: validFolderId,
        title: "Summary",
        content: summary,
      });
    } catch (error) {
      console.error("Error saving summary:", error);
      throw error;
    }
  }

  /**
   * Create a default folder for storing notes
   */
  private static async createDefaultFolder(): Promise<string> {
    try {
      console.log("Creating a default folder");
      const folderId = await DatabaseService.createFolder("Default Folder");
      console.log(`Created default folder with ID: ${folderId}`);
      return folderId;
    } catch (error) {
      console.error("Error creating default folder:", error);
      throw error;
    }
  }
} 