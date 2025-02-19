import { z } from 'zod';

/**
 * This schema defines the structure of a clinical summary.
 */
export const ClinicalSummarySchema = z.object({
  summaryText: z.string(),
});

export const SessionMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClinicalSessionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  transcript: z.string(),
  summary: ClinicalSummarySchema,
  metadata: SessionMetadataSchema,
}); 