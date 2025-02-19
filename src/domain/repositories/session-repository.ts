import { ClinicalSession } from "../entities/clinical-session";

/**
 * This interface defines the methods for a session repository.
 * It is responsible for saving and finding sessions by their ID.
 */
export interface SessionRepository {
  save(session: ClinicalSession): Promise<void>;
  findById(id: string): Promise<ClinicalSession>;
} 