import { ClinicalSession } from "../../domain/entities/clinical-session";
import { SessionRepository } from "../../domain/repositories/session-repository";
import { EHRInterface } from "../../domain/interfaces/external-interfaces";

/**
 * This service is responsible for managing the lifecycle of a clinical session.
 * It is responsible for saving the session to the database and updating the patient record in the EHR.
 */
export class SessionManagerService {
  constructor(
    private storage: SessionRepository,
    private fhirClient: EHRInterface
  ) {}

  async completeSession(session: ClinicalSession): Promise<void> {
    await this.storage.save(session);
    await this.fhirClient.updatePatientRecord(session);
  }
} 