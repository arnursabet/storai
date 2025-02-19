export interface TranscriptionService {
  transcribe(audio: Buffer, fileType?: string): Promise<string>;
} 