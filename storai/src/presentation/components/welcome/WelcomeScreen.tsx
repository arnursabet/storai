import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateSummary = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-3">
      <div className="max-w-6xl w-full mb-12">
        <h1 className="text-[5rem] leading-[1.3] text-black-500 mb-4">Welcome to StorAI</h1>
        <p className="text-[2.8rem] text-black-500">
          Summarize your notes 
        </p>

        <p className="text-[1.5rem] text-gray-400 mb-10">
          Lorem ipsum dolor sit amet consectetur adipisicing elit sed
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-left border border-storai-border">
            <h2 className="text-[1.5rem] font-semibold mb-2">HIPAA Compliant</h2>
            <p className="text-gray-600">
              All processing happens locally on your device, ensuring complete privacy and HIPAA compliance.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-left border border-storai-border">
            <h2 className="text-[1.5rem] font-semibold mb-2">Privacy</h2>
            <p className="text-gray-600">
              Your notes never leave your device. Local AI processing keeps sensitive patient data secure.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 text-left border border-storai-border">
            <h2 className="text-[1.5rem] font-semibold mb-2">Security</h2>
            <p className="text-gray-600">
              AES-256 encryption protects all stored data, while our anonymization pipeline removes identifiable information.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleCreateSummary}
            className="inline-flex items-center bg-storai-teal text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span className="mr-2">+</span> Create summarized notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 