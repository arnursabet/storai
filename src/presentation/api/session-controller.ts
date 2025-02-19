import { container } from "../../infrastructure/di-container";
import { TYPES } from "../../infrastructure/types";
import { SessionRepository } from "../../domain/repositories/session-repository";

/**
 * This function is responsible for getting a session by its ID.
 * It is responsible for retrieving the session from the database.
 */
export async function getSession(id: string) {
  const sessionRepository = container.get<SessionRepository>(TYPES.SessionRepository);
  return await sessionRepository.findById(id);
} 