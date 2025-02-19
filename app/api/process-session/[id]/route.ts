import { NextResponse } from 'next/server';
import { container } from '../../../../src/infrastructure/di-container';
import { TYPES } from '../../../../src/infrastructure/types';

import { TranscriptionService } from '../../../../src/domain/interfaces/transcription-service';
import { SessionRepository } from '../../../../src/domain/repositories/session-repository';
import { LLMInterface, EthicsPolicyInterface } from '../../../../src/domain/interfaces/external-interfaces';
import { GenerateClinicalSummary } from '../../../../src/application/use-cases/generate-clinical-summary';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get the file type from the file name
    const fileType = file.name.split('.').pop()?.toLowerCase();

    // Get all required services through DI
    const transcriptionService = container.get<TranscriptionService>(TYPES.TranscriptionService);
    const sessionRepository = container.get<SessionRepository>(TYPES.SessionRepository);
    const llmService = container.get<LLMInterface>(TYPES.LLMInterface);
    const ethicsPolicy = container.get<EthicsPolicyInterface>(TYPES.EthicsPolicyInterface);

    // 1) Transcribe the audio
    const transcript = await transcriptionService.transcribe(buffer, fileType);

    // 2) Update the session
    const session = await sessionRepository.findById(params.id);
    session.transcript = transcript;
    await sessionRepository.save(session);

    // 3) Generate clinical summary
    const generateSummaryUseCase = new GenerateClinicalSummary(llmService, ethicsPolicy);
    const summary = await generateSummaryUseCase.execute(session);

    // Return the results
    return NextResponse.json({ transcript, summary });
  } catch (error) {
    console.error('Error processing session:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(errorMessage, { status: 500 });
  }
}