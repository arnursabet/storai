import React from 'react';
import Link from 'next/link';
export default function Home() {
  return (
    <div>
      <h1>Welcome to StorAI</h1>
      <p>This is the home page. Navigate to a session page to see details.</p>
      <Link className="btn-primary" href="/process-session-test">Process Session Test</Link>
    </div>
  );
} 