import React from 'react';
import { TemplateType } from '../../../../../domain/entities/Template';
import { useEditorContext } from '../../context/EditorContext';
import {Switch} from 'radix-ui'

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
                className={`p-4 flex items-center justify-between cursor-pointer ${templateExpanded ? 'bg-[--color-storai-light-gray] rounded-t-[8px]' : ''}`}
                onClick={toggleTemplates}
            >
                <div className="w-full flex items-center justify-between">
                    <span className={`font-medium ${templateExpanded ? 'text-[--color-storai-blue]' : 'text-[--color-storai-gray]'}`}>Template</span>
                    <svg 
                        className={`transition-transform ${templateExpanded ? 'transform rotate-[-90deg]' : ''}`}
                        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.03786 15.5L12.9609 10L7.03786 4.5" stroke={templateExpanded ? 'var(--color-storai-blue)' : 'var(--color-storai-gray)'} stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>

            {templateExpanded && (
                <div className="p-4 pt-0 bg-[--color-storai-light-gray] rounded-b-[8px]">
                    {/* <span className="text-xs text-gray-500 mb-2">
                        { !activeTab && "Select a note first to generate templates"}
                    </span> */}
              
                    {/* Template error message */}
                    {templateError && (
                        <div className="mb-3 bg-red-50 p-3 rounded-md text-sm text-red-700">
                        {templateError}
                        </div>
                    )}
              
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="soap-template-switch"
                            >
                                SOAP
                            </label>
                            <Switch.Root
                                id="soap-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('SOAP').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                    logTemplateSelection('SOAP');
                                    handleTemplateSelect('SOAP');
                                }
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.0005 2.06057C6.81337 2.06057 6.6339 1.98623 6.50158 1.85391C6.36926 1.72159 6.29492 1.54212 6.29492 1.35499C6.29492 1.16786 6.36926 0.988394 6.50158 0.856073C6.6339 0.723751 6.81337 0.649414 7.0005 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 2.06057C7.18811 2.06057 7.36757 1.98623 7.49989 1.85391C7.63222 1.72159 7.70655 1.54212 7.70655 1.35499C7.70655 1.16786 7.63222 0.988394 7.49989 0.856073C7.36757 0.723751 7.18811 0.649414 7.00098 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.0005 13.3496C6.81337 13.3496 6.6339 13.2753 6.50158 13.143C6.36926 13.0106 6.29492 12.8312 6.29492 12.6441C6.29492 12.4569 6.36926 12.2775 6.50158 12.1451C6.6339 12.0128 6.81337 11.9385 7.0005 11.9385" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 13.3496C7.18811 13.3496 7.36757 13.2753 7.49989 13.143C7.63222 13.0106 7.70655 12.8312 7.70655 12.6441C7.70655 12.4569 7.63222 12.2775 7.49989 12.1451C7.36757 12.0128 7.18811 11.9385 7.00098 11.9385" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.0005 7.7051C6.81337 7.7051 6.6339 7.63076 6.50158 7.49844C6.36926 7.36612 6.29492 7.18665 6.29492 6.99952C6.29492 6.81239 6.36926 6.63293 6.50158 6.5006C6.6339 6.36828 6.81337 6.29395 7.0005 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 7.7051C7.18811 7.7051 7.36757 7.63076 7.49989 7.49844C7.63222 7.36612 7.70655 7.18665 7.70655 6.99952C7.70655 6.81239 7.63222 6.63293 7.49989 6.5006C7.36757 6.36828 7.18811 6.29395 7.00098 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                        </div>
                        {/* <span className="bg-white text-xs text-gray-500 rounded-md p-2">
                            SOAP
                            
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
                        </span> */}
                        
                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="pirp-template-switch"
                            >
                                PIRP
                            </label>
                            <Switch.Root
                                id="pirp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('PIRP').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                        logTemplateSelection('PIRP');
                                        handleTemplateSelect('PIRP');
                                    }
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.0005 2.06057C6.81337 2.06057 6.6339 1.98623 6.50158 1.85391C6.36926 1.72159 6.29492 1.54212 6.29492 1.35499C6.29492 1.16786 6.36926 0.988394 6.50158 0.856073C6.6339 0.723751 6.81337 0.649414 7.0005 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 2.06057C7.18811 2.06057 7.36757 1.98623 7.49989 1.85391C7.63222 1.72159 7.70655 1.54212 7.70655 1.35499C7.70655 1.16786 7.63222 0.988394 7.49989 0.856073C7.36757 0.723751 7.18811 0.649414 7.00098 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.0005 13.3496C6.81337 13.3496 6.6339 13.2753 6.50158 13.143C6.36926 13.0106 6.29492 12.8312 6.29492 12.6441C6.29492 12.4569 6.36926 12.2775 6.50158 12.1451C6.6339 12.0128 6.81337 11.9385 7.0005 11.9385" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 13.3496C7.18811 13.3496 7.36757 13.2753 7.49989 13.143C7.63222 13.0106 7.70655 12.8312 7.70655 12.6441C7.70655 12.4569 7.63222 12.2775 7.49989 12.1451C7.36757 12.0128 7.18811 11.9385 7.00098 11.9385" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.0005 7.7051C6.81337 7.7051 6.6339 7.63076 6.50158 7.49844C6.36926 7.36612 6.29492 7.18665 6.29492 6.99952C6.29492 6.81239 6.36926 6.63293 6.50158 6.5006C6.6339 6.36828 6.81337 6.29395 7.0005 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.00098 7.7051C7.18811 7.7051 7.36757 7.63076 7.49989 7.49844C7.63222 7.36612 7.70655 7.18665 7.70655 6.99952C7.70655 6.81239 7.63222 6.63293 7.49989 6.5006C7.36757 6.36828 7.18811 6.29395 7.00098 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                        </div>
                        {/* <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('PIRP')}`}
                            onClick={() => {
                              logTemplateSelection('PIRP');
                              handleTemplateSelect('PIRP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'PIRP'}
                        </button> */}

                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="dap-template-switch"
                            >
                                DAP 
                            </label>
                            <Switch.Root
                                id="dap-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('DAP').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                        logTemplateSelection('DAP');
                                        handleTemplateSelect('DAP');
                                    }
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>  
                        </div>
                        {/* <button 
                            className={`p-2 text-center rounded-md text-xs font-medium ${getTemplateButtonClass('DAP')}`}
                            onClick={() => {
                              logTemplateSelection('DAP');
                              handleTemplateSelect('DAP');
                            }}
                            disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'DAP'}
                        </button> */}

                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="pie-template-switch"
                            >
                                PIE
                            </label>
                            <Switch.Root
                                id="pie-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('PIE').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                        logTemplateSelection('PIE');
                                        handleTemplateSelect('PIE');
                                    }   
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>
                        </div>
                        
                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="sirp-template-switch"
                            >
                                SIRP
                            </label>
                            <Switch.Root
                                id="sirp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('SIRP').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                        logTemplateSelection('SIRP');
                                        handleTemplateSelect('SIRP');
                                    }
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>
                        </div>

                        <div className="flex items-center border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="girp-template-switch"
                            >
                                GIRP
                            </label>
                            <Switch.Root
                                id="girp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-primary-500 transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeTab?.type !== 'template' && getTemplateButtonClass('GIRP').includes('bg-primary-500')}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeTab && activeTab.type !== 'template') {
                                        logTemplateSelection('GIRP');
                                        handleTemplateSelect('GIRP');
                                    }   
                                }}
                                disabled={!activeTab || activeTab.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[5px]" />
                            </Switch.Root>
                        </div>
                       
                    </div>
              
                    {/* <button 
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
                    </button> */}
                </div>
            )}
        </div>
    )
}

export default React.memo(TemplatesSection);