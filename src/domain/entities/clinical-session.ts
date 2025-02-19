import { ClinicalSummary } from "./clinical-summary";
import { SessionMetadata } from "./session-metadata";

export interface ClinicalSession {
  id: string;
  patientId: string;
  transcript: string;
  summary: ClinicalSummary;
  metadata: SessionMetadata;
} 