import { LLMInterface } from "../../domain/interfaces/external-interfaces";
import { ClinicalSession } from "../../domain/entities/clinical-session";
import { ClinicalSummary } from "../../domain/entities/clinical-summary";

/**
 * This class is an adapter for the OpenAI API.
 * It is responsible for generating a clinical summary from a clinical session.
 */
export class OpenAIClinicalAdapter implements LLMInterface {
  async generateSummary(session: ClinicalSession): Promise<ClinicalSummary> {
    return { summaryText: `Generated summary for session ${session.id}` };
  }
} 