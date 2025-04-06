import { useState, useCallback, useEffect } from 'react';
import { FileService } from '../../infrastructure/storage/FileService';
import type { UploadedFile } from '../../domain/ports/IFileService';

export interface FileUploadHook {
  files: File[];
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  uploadError: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploadFiles: () => Promise<UploadedFile[]>;
  fetchUploadedFiles: () => Promise<UploadedFile[]>;
}

/**
 * Custom hook for managing file uploads
 */
export function useFileUpload(): FileUploadHook {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load existing uploaded files on hook initialization
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  /**
   * Add files to the upload queue
   */
  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(currentFiles => [...currentFiles, ...newFiles]);
    setUploadError(null);
  }, []);

  /**
   * Remove a file from the upload queue
   */
  const removeFile = useCallback((index: number) => {
    setFiles(currentFiles => {
      const updatedFiles = [...currentFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  }, []);

  /**
   * Clear all files from the upload queue
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Upload all files in the queue
   */
  const uploadFiles = useCallback(async (): Promise<UploadedFile[]> => {
    if (files.length === 0) {
      setUploadError('Please select at least one file to upload');
      return [];
    }

    setIsUploading(true);
    setUploadError(null);
    const uploadedList: UploadedFile[] = [];

    try {
      // Upload each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Set initial progress for this file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        // Simulate progress (in a real app, you'd use a proper progress indicator from the backend)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress < 90) {
              return {
                ...prev,
                [file.name]: currentProgress + 10
              };
            }
            return prev;
          });
        }, 300);

        try {
          // Upload the file
          const uploadedFile = await FileService.uploadFile(file);
          uploadedList.push(uploadedFile);

          // Complete progress for this file
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          setUploadError(`Error uploading file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          clearInterval(progressInterval);
        }
      }

      if (uploadedList.length > 0) {
        setUploadedFiles(prevFiles => [...prevFiles, ...uploadedList]);
        // Clear the file selection after successful upload
        setFiles([]);
      }

      return uploadedList;
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError(`Error uploading files: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  /**
   * Fetch all uploaded files
   */
  const fetchUploadedFiles = useCallback(async (): Promise<UploadedFile[]> => {
    try {
      const files = await FileService.listFiles();
      setUploadedFiles(files);
      return files;
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setUploadError(`Error fetching uploaded files: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }, []);

  return {
    files,
    uploadedFiles,
    isUploading,
    uploadProgress,
    uploadError,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    fetchUploadedFiles
  };
} 