import React from "react";
import { getSession } from "../api/session-controller";

/**
 * This is a Next.js Server Component that renders the clinical session details.
 * It is responsible for displaying the session details to the user.
 */
export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);
  return (
    <div>
      <h1>Clinical Session: {session.id}</h1>
      <p><strong>Patient ID:</strong> {session.patientId}</p>
      <p><strong>Transcript:</strong> {session.transcript}</p>
      <h2>Summary</h2>
      <p>{session.summary.summaryText}</p>
    </div>
  );
} 