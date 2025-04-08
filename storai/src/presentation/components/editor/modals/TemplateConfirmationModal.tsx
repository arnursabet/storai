import React, { useEffect, memo } from 'react';
import { TemplateType } from '../../../../domain/entities/Template';

interface TemplateConfirmationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  templateType: TemplateType | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Modal to confirm template generation
 */
const TemplateConfirmationModal: React.FC<TemplateConfirmationModalProps> = memo(({ 
  isOpen, 
  templateType, 
  isLoading,
  onCancel, 
  onConfirm 
}) => {
  // Only log when props actually change, not on every render
  useEffect(() => {
    console.log('TemplateConfirmationModal props changed:', { isOpen, templateType });
  }, [isOpen, templateType]);

  // If the modal is not open or no template type is provided, don't render anything
  if (!isOpen || !templateType) {
    return null;
  }

  console.log('Template confirmation modal is open for template type:', templateType);

  // Template descriptions
  const templateDescriptions: Record<TemplateType, { 
    sections: Array<{ key: string; label: string; description: string }> 
  }> = {
    'SOAP': {
      sections: [
        { key: 'S', label: 'Subjective', description: 'What you heard and observed' },
        { key: 'O', label: 'Objective', description: 'Clinical findings and factual data' },
        { key: 'A', label: 'Assessment', description: 'Clinician interpretation and subjective analysis' },
        { key: 'P', label: 'Plan', description: 'Your plan for future treatment and therapy' },
      ]
    },
    'PIRP': {
      sections: [
        { key: 'Problem', label: 'Problem', description: 'What you heard and observed' },
        { key: 'Intervention', label: 'Intervention', description: 'Clinician interpretation and subjective analysis' },
        { key: 'Response', label: 'Response', description: 'Your plan for future treatment and therapy' },
        { key: 'Plan', label: 'Plan', description: 'Your plan for future treatment and therapy' },
      ]
    },
    'DAP': {
      sections: [
        { key: 'D', label: 'Data', description: 'What you heard and observed' },
        { key: 'A', label: 'Assessment', description: 'Clinician interpretation and subjective analysis' },
        { key: 'P', label: 'Plan', description: 'Your plan for future treatment and therapy' },
      ]
    },
    'PIE': {
      sections: [
        { key: 'P', label: 'Problem', description: 'What you heard and observed' },
        { key: 'I', label: 'Intervention', description: 'Clinician interpretation and subjective analysis' },
        { key: 'E', label: 'Evaluation', description: 'Your plan for future treatment and therapy' },
      ]
    },
    'SIRP': {
      sections: [
        { key: 'S', label: 'Situation', description: 'What you heard and observed' },
        { key: 'I', label: 'Intervention', description: 'Clinician interpretation and subjective analysis' },
        { key: 'R', label: 'Response', description: 'Client response to intervention' },
        { key: 'P', label: 'Plan', description: 'Your plan for future treatment and therapy' },
      ]
    },
    'GIRP': {
      sections: [
        { key: 'G', label: 'Goal', description: 'What you heard and observed' },
        { key: 'I', label: 'Intervention', description: 'Clinician interpretation and subjective analysis' },
        { key: 'R', label: 'Response', description: 'Client response to intervention' },
        { key: 'P', label: 'Plan', description: 'Your plan for future treatment and therapy' },
      ]
    },
  };

  const templateInfo = templateDescriptions[templateType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Generate {templateType} Template?</h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          We will generate a {templateType} template from your notes.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold mb-4">{templateType} Format</h3>
          
          {templateInfo.sections.map((section) => (
            <div key={section.key} className="mb-4">
              <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium mb-2">
                {section.label}
              </div>
              <p className="text-gray-600">{section.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel(); // Close the modal after confirming
            }}
            className="px-6 py-2 bg-storai-teal text-white rounded-md hover:bg-teal-600 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'} {templateType}
          </button>
        </div>
      </div>
    </div>
  );
});

export default TemplateConfirmationModal;