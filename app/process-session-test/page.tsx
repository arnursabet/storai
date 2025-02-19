"use client";

import React, { useState, ChangeEvent } from "react";

const SUPPORTED_FORMATS = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export default function ProcessSessionTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<{ transcript?: string; summary?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !SUPPORTED_FORMATS.includes(ext)) {
      return `Unsupported file format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setOutput(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }

      console.log('Selected file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setOutput(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/process-session/session1`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setOutput(data);
    } catch (err: any) {
      setError(err.message || "Error occurred");
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Process Session Test</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fileInput" className="block text-sm font-medium mb-2">
              Choose an audio file:
            </label>
            <input
              id="fileInput"
              type="file"
              accept={SUPPORTED_FORMATS.map(format => `.${format}`).join(',')}
              onChange={handleFileChange}
              className="input-field"
            />
            <p className="mt-1 text-sm text-gray-500">
              Max file size: {MAX_FILE_SIZE / 1024 / 1024}MB
            </p>
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="btn-primary"
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>
      
      {loading && (
        <div className="mt-4 text-primary-600">
          <p>Processing your audio file...</p>
        </div>
      )}
      
      {error && (
        <div className="card-error mt-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {output && (
        <div className="card-success mt-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Transcript:</h3>
              <p className="mt-1 whitespace-pre-wrap">{output.transcript}</p>
            </div>
            <div>
              <h3 className="font-medium">Summary:</h3>
              <p className="mt-1 whitespace-pre-wrap">
                {output.summary.text || JSON.stringify(output.summary, null, 2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 