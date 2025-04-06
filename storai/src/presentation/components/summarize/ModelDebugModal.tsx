import React, { useState, useEffect } from 'react';
import { ModelDebug } from '../../../infrastructure/llm/ModelDebug';

interface ModelDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosticResult {
  modelFound: boolean;
  modelPath: string;
  appDataDir: string;
  modelDir: string;
  dirExists: boolean;
  dirContents: string[];
  error?: string;
  alternativeLocations: { path: string; exists: boolean }[];
}

interface InstallInstructions {
  platform: string;
  modelDir: string;
  downloadLink: string;
  commands: string[];
  manualSteps: string[];
}

const ModelDebugModal: React.FC<ModelDebugModalProps> = ({ isOpen, onClose }) => {
  const [diagResults, setDiagResults] = useState<DiagnosticResult | null>(null);
  const [installInstructions, setInstallInstructions] = useState<InstallInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'install'>('diagnostic');
  
  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);
  
  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await ModelDebug.checkModelInstallation();
      setDiagResults(results);
      
      const instructions = await ModelDebug.getInstallInstructions();
      setInstallInstructions(instructions);
      
      // If model not found, switch to install tab automatically
      if (!results.modelFound) {
        setActiveTab('install');
      }
    } catch (error) {
      console.error("Error running diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">LLM Model Installation</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('diagnostic')}
                className={`px-4 py-1 rounded-md ${
                  activeTab === 'diagnostic' 
                    ? 'bg-primary-100 text-primary-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Diagnostics
              </button>
              <button
                onClick={() => setActiveTab('install')}
                className={`px-4 py-1 rounded-md ${
                  activeTab === 'install' 
                    ? 'bg-primary-100 text-primary-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Installation Guide
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Running diagnostics...</p>
            </div>
          ) : (
            <>
              {activeTab === 'diagnostic' && diagResults && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Diagnostic Results</h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">Model Found: <span className={diagResults.modelFound ? "text-green-600" : "text-red-600"}>
                        {diagResults.modelFound ? "Yes" : "No"}
                      </span></p>
                      
                      {!diagResults.modelFound && (
                        <button
                          onClick={() => setActiveTab('install')}
                          className="mt-2 text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                          View Installation Guide →
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">App Data Directory:</p>
                      <p className="text-sm font-mono mt-1 text-gray-700 break-all">{diagResults.appDataDir}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">Model Directory:</p>
                      <p className="text-sm font-mono mt-1 text-gray-700 break-all">{diagResults.modelDir}</p>
                      <p className="font-medium mt-2">Directory Exists: <span className={diagResults.dirExists ? "text-green-600" : "text-red-600"}>
                        {diagResults.dirExists ? "Yes" : "No"}
                      </span></p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">Expected Model Path:</p>
                      <p className="text-sm font-mono mt-1 text-gray-700 break-all">{diagResults.modelPath}</p>
                    </div>
                    
                    {diagResults.alternativeLocations && diagResults.alternativeLocations.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium">Alternative Locations Checked:</p>
                        <ul className="text-sm font-mono mt-1 text-gray-700 list-disc pl-5">
                          {diagResults.alternativeLocations.map((location, index) => (
                            <li key={index} className={location.exists ? "text-green-600" : "text-gray-600"}>
                              {location.path} 
                              {location.exists ? " (✓ Found!)" : " (Not found)"}
                            </li>
                          ))}
                        </ul>
                        
                        {diagResults.alternativeLocations.some(loc => loc.exists) && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-green-700 text-sm">
                              Good news! The model was found in one of the alternative locations. The app should be able to use it.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {diagResults.dirContents && diagResults.dirContents.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium">Directory Information:</p>
                        <ul className="text-sm font-mono mt-1 text-gray-700 list-disc pl-5">
                          {diagResults.dirContents.map((info: string, index: number) => (
                            <li key={index}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {diagResults.error && (
                      <div className="bg-red-50 p-4 rounded-md">
                        <p className="font-medium text-red-700">Error:</p>
                        <p className="text-sm font-mono mt-1 text-red-700">{diagResults.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'install' && installInstructions && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Installation Guide</h3>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
                    <p className="text-yellow-800">
                      <strong>Note:</strong> The model file must be named exactly <span className="font-mono">tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf</span> and placed in the correct directory.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="font-medium text-lg mb-2">Step 1: Download the Model</p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-2">Download the model file (approximately 700MB):</p>
                      <a 
                        href={installInstructions.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mb-2"
                      >
                        Download TinyLlama Model
                      </a>
                      <p className="text-xs text-gray-500 break-all mt-1">{installInstructions.downloadLink}</p>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-blue-800 text-sm mb-2">
                          <strong>Debugging Tips:</strong>
                        </p>
                        <ul className="list-disc pl-4 text-sm text-blue-800">
                          <li>Make sure the file keeps its exact original name <span className="font-mono">tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf</span></li>
                          <li>The model must be placed in the app data directory shown above</li>
                          <li>Check the console logs for detailed diagnostic information</li>
                          <li>Try manually creating the model directory if the automatic creation fails</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="font-medium text-lg mb-2">Step 2: Install the Model</p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="mb-3">Follow these steps for {installInstructions.platform}:</p>
                      <ol className="list-decimal pl-6 space-y-2 text-gray-800">
                        {installInstructions.manualSteps.map((step, index) => (
                          <li key={index} className={step.includes("Create the directory") ? "font-medium" : ""}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="font-medium text-lg mb-2">Required File Location:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto">
                      <p className="font-mono text-sm break-all">{installInstructions.modelDir}/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
                    <p className="text-yellow-800 text-sm mb-2">
                      <strong>Alternative Method:</strong> If you're having issues with the app data directory, you can also try placing the model in the user's home directory or another location and modify the model path in the code.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="font-medium text-lg mb-2">Shell Commands (Advanced Users):</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-md">
                      {installInstructions.commands.map((cmd: string, index: number) => (
                        <div key={index} className="font-mono text-sm mb-1">{cmd}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800">
                      After installing the model, click "Run Diagnostics Again" to verify it was installed correctly, then restart the application.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 mr-2"
          >
            Close
          </button>
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Diagnostics Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelDebugModal; 