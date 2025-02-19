import { Container } from "inversify";
import { TYPES } from "./types";
import { SessionRepository } from "../domain/repositories/session-repository";
import { PostgresSessionRepository } from "./db/postgres-session-repository";
import { EHRInterface, LLMInterface, EthicsPolicyInterface } from "../domain/interfaces/external-interfaces";
import { DummyEHRAdapter } from "./ehr/dummy-ehr-adapter";
import { OpenAIClinicalAdapter } from "./llm/openai-adapter";
import { SimpleEthicsPolicy } from "./policy/simple-ethics-policy";
import { TranscriptionService } from "../domain/interfaces/transcription-service";
import { WhisperTranscriptionAdapter } from "./transcription/whisper-adapter";

/**
 * This is the dependency injection container for the application.
 * It is responsible for binding the domain interfaces to the infrastructure implementations. 
 * Meaning that the application can use the infrastructure implementations without having to know the details of the implementations.
 */
const container = new Container();

// Bind Domain interfaces to Infrastructure implementations
container.bind<SessionRepository>(TYPES.SessionRepository).to(PostgresSessionRepository);
container.bind<EHRInterface>(TYPES.EHRInterface).to(DummyEHRAdapter);
container.bind<LLMInterface>(TYPES.LLMInterface).to(OpenAIClinicalAdapter);
container.bind<EthicsPolicyInterface>(TYPES.EthicsPolicyInterface).to(SimpleEthicsPolicy);
container.bind<TranscriptionService>(TYPES.TranscriptionService).to(WhisperTranscriptionAdapter);

export { container }; 