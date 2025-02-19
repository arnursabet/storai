import { EHRInterface } from "../../domain/interfaces/external-interfaces";
import { ClinicalSession } from "../../domain/entities/clinical-session";

/**
 * This class is a dummy implementation of the EHRInterface.
 * It is used to simulate the EHR integration.
 */
export class DummyEHRAdapter implements EHRInterface {
  async updatePatientRecord(session: ClinicalSession): Promise<void> {
    // Dummy implementation
    console.log(`Patient record updated for session: ${session.id}`);
  }
} 