import React, { useEffect, useState } from 'react';
import AppRoutes from './presentation/routes/Routes';
import { DatabaseService } from './infrastructure/storage/Database';
import { LlamaModel } from './infrastructure/llm/LlamaModel';
import { FileService } from './infrastructure/storage/FileService';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeServices = async () => {
      try {

        // Do not remove this code for now
        // Initialize database
        // console.log('Initializing database...');
        // await DatabaseService.initialize();
        // console.log('Database initialized successfully');
        
        // // Initialize LlamaModel
        // console.log('Initializing LlamaModel...');
        // await LlamaModel.initialize();
        // console.log('LlamaModel initialized successfully');
        
        // Initialize FileService
        console.log('Initializing FileService...');
        await FileService.initialize();
        console.log('FileService initialized successfully');
        
        // All services initialized
        setLoading(false);
      } catch (err) {
        console.error('Error initializing application:', err);
        setError(`Error initializing application: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    initializeServices();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading application...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <AppRoutes />
  );
}

export default App;
