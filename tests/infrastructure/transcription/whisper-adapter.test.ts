// eslint-disable @typescript-eslint/no-var-requires

/**
 * This file is responsible for testing the WhisperTranscriptionAdapter.
 * It is responsible for testing the transcription of audio to text using the Whisper API. Specifically, it is testing the adapter's ability to handle the Whisper API's response and errors.
 */

// Polyfill for FormData and Blob
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = require('form-data');
}

if (typeof globalThis.Blob === "undefined") {
  const { Blob } = require('buffer');
  globalThis.Blob = Blob;
}

// Polyfill global.fetch if not available (e.g., in Node environment) and assign it to globalThis.fetch
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch');
}

// Update the require path to correctly reference the adapter module
const { WhisperTranscriptionAdapter } = require('../../../src/infrastructure/transcription/whisper-adapter');

// Ensure that types for jest are available

describe("WhisperTranscriptionAdapter", () => {
  beforeAll(() => {
    process.env.WHISPER_API_KEY = "dummy_key";
  });

  it("should return transcribed text from the Whisper API", async () => {
    // Mock the global fetch function
    const mockResponse = { text: "Test transcription" };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const adapter = new WhisperTranscriptionAdapter();
    const dummyAudio = Buffer.from("dummy data", "utf8");
    const result = await adapter.transcribe(dummyAudio);
    expect(result).toBe("Test transcription");

    // Restore the original fetch
    globalThis.fetch = originalFetch;
  });

  it("should throw an error if WHISPER_API_KEY is not set", async () => {
    // Remove the API key
    const originalApiKey = process.env.WHISPER_API_KEY;
    delete process.env.WHISPER_API_KEY;

    const adapter = new WhisperTranscriptionAdapter();
    const dummyAudio = Buffer.from("dummy data", "utf8");
    await expect(adapter.transcribe(dummyAudio))
      .rejects
      .toThrow("WHISPER_API_KEY not set in environment variables");

    // Restore the API key
    process.env.WHISPER_API_KEY = originalApiKey;
  });
}); 