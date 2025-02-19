import { EthicsPolicyInterface } from "../../domain/interfaces/external-interfaces";
import { ClinicalSession } from "../../domain/entities/clinical-session";

/**
 * This class is a simple implementation of the EthicsPolicyInterface.
 * It is responsible for validating the session before generating a clinical summary.
 */
export class SimpleEthicsPolicy implements EthicsPolicyInterface {
  async validate(session: ClinicalSession): Promise<void> {
    // Basic ethical check ensuring a transcript exists
    if (!session.transcript || session.transcript.trim() === "") {
      throw new Error("Transcript is required for ethical validation.");
    }
  }
} 