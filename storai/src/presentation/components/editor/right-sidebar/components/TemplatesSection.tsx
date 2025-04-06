import React from 'react';
import { TemplateType } from '../../../../../domain/entities/Template';
import { useEditorContext } from '../../context/EditorContext';

interface TemplatesSectionProps {
    templateExpanded: boolean;
    toggleTemplates: () => void;
}

// Add debug logging function
const logTemplateSelection = (templateType: TemplateType) => {
  console.log(`Template button clicked: ${templateType}`);
};

const TemplatesSection: React.FC<TemplatesSectionProps> = ({ 
    templateExpanded, 
    toggleTemplates 
  }) => {
    const { 
      tabs, 
      activeTabId,
      templateError, 
      isGenerating, 
      getTemplateButtonClass, 
      handleTemplateSelect,
      setSelectedTemplateType,
      setPendingSourceNoteId,
      setShowTemplateConfirmation
    } = useEditorContext();
    
    const activeTab = tabs.find(tab => tab.id === activeTabId);

    return (
        <div className="border-b border-gray-100">
            <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={toggleTemplates}
            >
                <span className="text-storai-teal font-medium">Template</span>
                <svg 
                    className={`h-5 w-5 text-gray-400 transition-transform ${templateExpanded ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
             </div>

            {templateExpanded && (
                <div className="p-4 pt-0">
                    <p className="text-xs text-gray-500 mb-2">
                        {activeTab 
                        ? `Generate template from "${activeTab.title}":`
                        : "Select a note first to generate templates:"}
                    </p>
              
                    {/* Template error message */}
                    {templateError && (
                        <div className="mb-3 bg-red-50 p-3 rounded-md text-sm text-red-700">
                        {templateError}
                        </div>
                    )}
              
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('SOAP')}`}
                            onClick={() => {
                              logTemplateSelection('SOAP');
                              handleTemplateSelect('SOAP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'SOAP'}
                        </button>

                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('PIRP')}`}
                            onClick={() => {
                              logTemplateSelection('PIRP');
                              handleTemplateSelect('PIRP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'PIRP'}
                        </button>

                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('DAP')}`}
                            onClick={() => {
                              logTemplateSelection('DAP');
                              handleTemplateSelect('DAP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'DAP'}
                        </button>

                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('PIE')}`}
                            onClick={() => {
                              logTemplateSelection('PIE');
                              handleTemplateSelect('PIE');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'PIE'}
                        </button>

                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('SIRP')}`}
                            onClick={() => {
                              logTemplateSelection('SIRP');
                              handleTemplateSelect('SIRP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'SIRP'}
                        </button>

                        <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('GIRP')}`}
                            onClick={() => {
                              logTemplateSelection('GIRP');
                              handleTemplateSelect('GIRP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'GIRP'}
                        </button>
                    </div>
              
                    <button 
                        className={`w-full mt-3 ${
                        isGenerating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-storai-teal hover:bg-storai-teal'
                        } text-white rounded-md py-2 px-4 flex items-center justify-center transition-colors`}
                        disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        onClick={() => {
                        if (activeTab && activeTab.type === 'note') {
                            // Allow user to select template type instead of defaulting to SOAP
                            // Open a dropdown or other UI element to select template type
                            // For now, this is a demonstration using a custom template type
                            const customType: TemplateType = 'GIRP'; // Change this to allow user selection
                            logTemplateSelection(`Custom Template (${customType})`);
                            setSelectedTemplateType(customType);
                            setPendingSourceNoteId(activeTab.id);
                            setShowTemplateConfirmation(true);
                        }
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Custom Template
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

export default React.memo(TemplatesSection);