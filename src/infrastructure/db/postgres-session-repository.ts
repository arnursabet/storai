import { SessionRepository } from "../../domain/repositories/session-repository";
import { ClinicalSession } from "../../domain/entities/clinical-session";

/**
 * This class is responsible for saving and finding sessions by their ID.
 */
export class PostgresSessionRepository implements SessionRepository {
  private sessions: Map<string, ClinicalSession> = new Map();

  constructor() {
    // Seed a sample session for demonstration
    const sampleSession: ClinicalSession = {
      id: "session1",
      patientId: "patient1",
      transcript: "This is a sample transcript for session1.",
      summary: { summaryText: "Sample summary for session1" },
      metadata: { createdAt: new Date(), updatedAt: new Date() }
    };
    this.sessions.set(sampleSession.id, sampleSession);
  }

  async save(session: ClinicalSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<ClinicalSession> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error("Session not found");
    }
    return session;
  }
} 