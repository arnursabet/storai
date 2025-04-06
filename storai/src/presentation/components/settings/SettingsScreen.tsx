import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiKeySettings } from './ApiKeySettings';

/**
 * Main settings screen component
 */
export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('api');
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-600 hover:text-gray-900"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        
        <div className="flex bg-white rounded-md shadow-sm overflow-hidden mb-8">
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4 font-medium text-gray-800 border-b border-gray-200">
              Settings
            </div>
            <nav className="py-4">
              <button
                className={`w-full text-left px-4 py-2 ${activeTab === 'api' ? 'bg-storai-seafoam text-storai-teal font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('api')}
              >
                API Configuration
              </button>
              <button
                className={`w-full text-left px-4 py-2 ${activeTab === 'general' ? 'bg-storai-seafoam text-storai-teal font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('general')}
              >
                General Settings
              </button>
              <button
                className={`w-full text-left px-4 py-2 ${activeTab === 'account' ? 'bg-storai-seafoam text-storai-teal font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
            </nav>
          </div>
          
          <div className="flex-1 p-6">
            {activeTab === 'api' && <ApiKeySettings />}
            {activeTab === 'general' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">General Settings</h2>
                <p className="text-gray-600">General application settings will appear here.</p>
              </div>
            )}
            {activeTab === 'account' && (
              <div className="bg-white rounded-md shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Account Settings</h2>
                <p className="text-gray-600">Account settings will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 