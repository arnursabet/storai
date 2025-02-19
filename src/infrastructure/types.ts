/**
 * This file defines the types for the dependency injection container.
 * It is used to bind the domain interfaces to the infrastructure implementations. Meaning that the application can use the infrastructure implementations without having to know the details of the implementations.
 * It is also used to inject the dependencies into the classes that need them.
 */

export const TYPES = {
  SessionRepository: Symbol.for("SessionRepository"),
  EHRInterface: Symbol.for("EHRInterface"),
  LLMInterface: Symbol.for("LLMInterface"),
  EthicsPolicyInterface: Symbol.for("EthicsPolicyInterface"),
  TranscriptionService: Symbol.for("TranscriptionService"),
}; 