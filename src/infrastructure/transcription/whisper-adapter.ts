import { TranscriptionService } from "src/domain/interfaces/transcription-service";
import { injectable } from "inversify";
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * This class is an adapter for the Whisper API.
 * It is responsible for transcribing audio to text.
 */
// @injectable()
export class WhisperTranscriptionAdapter implements TranscriptionService {
  private readonly SUPPORTED_FORMATS = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];

  async transcribe(audio: Buffer, fileType?: string): Promise<string> {
    const apiKey = process.env.WHISPER_API_KEY;
    if (!apiKey) {
      throw new Error("WHISPER_API_KEY not set in environment variables");
    }

    // Validate file format
    const ext = fileType?.toLowerCase() || 'mp3';
    if (!this.SUPPORTED_FORMATS.includes(ext)) {
      throw new Error(`Unsupported file format: ${ext}. Supported formats: ${this.SUPPORTED_FORMATS.join(', ')}`);
    }

    // Create FormData instance
    const formData = new FormData();
    
    // Append the buffer directly as a file with the correct extension
    formData.append('file', audio, {
      filename: `audio.${ext}`,
      contentType: `audio/${ext === 'm4a' ? 'mp4' : ext}`
    });
    formData.append('model', 'whisper-1');

    console.log('Sending file:', {
      filename: `audio.${ext}`,
      contentType: `audio/${ext === 'm4a' ? 'mp4' : ext}`,
      size: audio.length
    });

    try {
      // Call the Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Whisper API Error Response:', errorText);
        throw new Error(`Whisper API error: ${errorText}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
} 