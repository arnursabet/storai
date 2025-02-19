import { ClinicalSession } from "../../domain/entities/clinical-session";
import { ClinicalSummary } from "../../domain/entities/clinical-summary";
import { LLMInterface, EthicsPolicyInterface } from "../../domain/interfaces/external-interfaces";

/**
 * This use case is responsible for generating a clinical summary from a clinical session.
 */
export class GenerateClinicalSummary {
  constructor(
    private llmService: LLMInterface,
    private policyChecker: EthicsPolicyInterface
  ) {}

  async execute(session: ClinicalSession): Promise<ClinicalSummary> {
    // Policy checks to ensure transcript exists or meets criteria
    await this.policyChecker.validate(session);
    // Use LLM to generate summary
    return await this.llmService.generateSummary(session);
  }
}