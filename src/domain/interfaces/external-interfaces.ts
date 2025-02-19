import { ClinicalSession } from "../entities/clinical-session";
import { ClinicalSummary } from "../entities/clinical-summary";

// Interface for Language Model Summary Generation
export interface LLMInterface {
  generateSummary(session: ClinicalSession): Promise<ClinicalSummary>;
}

// Interface for Ethics/Policy validation
export interface EthicsPolicyInterface {
  validate(session: ClinicalSession): Promise<void>;
}

// Interface for EHR integrations
export interface EHRInterface {
  updatePatientRecord(session: ClinicalSession): Promise<void>;
} 