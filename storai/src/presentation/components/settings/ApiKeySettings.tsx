import { useState, useEffect } from 'react';
import { useTemplateGeneration } from '../../../application/hooks/useTemplateGeneration';

/**
 * Component for managing API key settings
 */
export const ApiKeySettings: React.FC = () => {
  const { setApiKey: configureApiKey } = useTemplateGeneration();
  
  return (
    <div className="bg-white rounded-md shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-medium text-gray-800 mb-4">OpenAI API Settings</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-4">
          The OpenAI API key is now managed through environment variables and is not configurable in the user interface.
          Please contact your system administrator if you need to update the API key.
        </p>
        
        <div className="p-4 bg-blue-50 rounded-md text-sm text-blue-700">
          <p className="font-medium">Environment Variable Configuration</p>
          <p className="mt-2">
            The application uses the <code className="bg-blue-100 px-1 py-0.5 rounded">OPENAI_API_KEY</code> environment variable.
            This ensures better security by keeping the API key out of the application code and user interface.
          </p>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-md text-sm">
        <h3 className="font-medium text-gray-800 mb-2">OpenAI API Information:</h3>
        <p className="text-gray-600 mb-2">
          The application uses OpenAI's services to generate medical note templates. More information about OpenAI's API:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1">
          <li><a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-storai-teal hover:underline">OpenAI API Documentation</a></li>
          <li><a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-storai-teal hover:underline">OpenAI Pricing</a></li>
        </ul>
      </div>
    </div>
  );
}; 