// Script to download the TinyLlama model
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import os from 'os';
import { fileURLToPath } from 'url';

// Model information
const MODEL_NAME = 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
const MODEL_URL = `https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/${MODEL_NAME}`;

// Get user's home directory
const HOME_DIR = os.homedir();

// Create directories
const createModelDir = () => {
  const modelDir = path.join(HOME_DIR, 'llm-models');
  
  if (!fs.existsSync(modelDir)) {
    console.log(`Creating directory: ${modelDir}`);
    fs.mkdirSync(modelDir, { recursive: true });
  }
  
  return modelDir;
};

// Download file with progress and handle redirects
const downloadFile = (url, destPath) => {
  console.log(`Downloading model from ${url}`);
  console.log(`Saving to ${destPath}`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    const request = (url) => {
      console.log(`Requesting ${url}`);
      
      // Determine if we need http or https
      const requester = url.startsWith('https') ? https : http;
      
      requester.get(url, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Close the current file stream
          file.close();
          
          const newUrl = response.headers.location;
          console.log(`Redirecting to ${newUrl}`);
          
          // Follow the redirect
          request(newUrl);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        let downloadedBytes = 0;
        const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
        
        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const progress = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
          
          // Clear line and show progress
          process.stdout.write(`\rDownloading: ${progress}% complete [${downloadedBytes} / ${totalBytes} bytes]`);
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('\nDownload completed!');
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlinkSync(destPath);
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlinkSync(destPath);
        reject(err);
      });
    };
    
    // Start the initial request
    request(url);
  });
};

// Main function
const main = async () => {
  try {
    console.log(`Starting download of ${MODEL_NAME}...`);
    
    // Create model directory
    const modelDir = createModelDir();
    
    // Full path where model will be saved
    const destPath = path.join(modelDir, MODEL_NAME);
    
    // Check if file already exists
    if (fs.existsSync(destPath)) {
      console.log(`Model already exists at ${destPath}`);
      console.log(`To redownload, delete the existing file first.`);
      return;
    }
    
    // Download the model
    await downloadFile(MODEL_URL, destPath);
    
    console.log(`\nModel downloaded successfully to ${destPath}`);
    console.log(`The application should now be able to find the model.`);
    console.log(`If you still experience issues, copy this file manually to the app data directory.`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Start the download
main(); 