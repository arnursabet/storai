import { NextResponse } from 'next/server';
import { container } from '../../../../src/infrastructure/di-container';
import { TYPES } from '../../../../src/infrastructure/types';

import { GenerateClinicalSummary } from '../../../../src/application/use-cases/generate-clinical-summary';

import { SessionRepository } from '../../../../src/domain/repositories/session-repository';
import { LLMInterface, EthicsPolicyInterface } from '../../../../src/domain/interfaces/external-interfaces';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Retrieve the session from the repository
    const repo = container.get<SessionRepository>(TYPES.SessionRepository);
    const session = await repo.findById(params.id);

    // Get needed interfaces via DI
    const llmService = container.get<LLMInterface>(TYPES.LLMInterface);
    const ethicsPolicy = container.get<EthicsPolicyInterface>(TYPES.EthicsPolicyInterface);

    // Execute the use case
    const useCase = new GenerateClinicalSummary(llmService, ethicsPolicy);
    const summary = await useCase.execute(session);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating clinical summary:', error);
    return NextResponse.error();
  }
} 