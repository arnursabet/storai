import React, { useMemo } from 'react';
import { TemplateType } from '../../../../../domain/entities/Template';
import { useEditorContext } from '../../context/EditorContext';
import * as Switch from '@radix-ui/react-switch';

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
      state,
      handleTemplateSelect,
      getTemplateButtonClass
    } = useEditorContext();
    
    const { 
      tabs, 
      activeTabId, 
      notesById, 
      templateError, 
      isGenerating 
    } = state;
    
    const activeNote = useMemo(() => {
        const activeTabData = tabs.find(tab => tab.id === activeTabId);
        return activeTabData ? notesById[activeTabData.noteId] : null;
    }, [tabs, activeTabId, notesById]);

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
                        <path d="M7.03786 15.5L12.9609 10L7.03786 4.5" stroke={templateExpanded ? 'var(--color-storai-blue)' : 'var(--color-storai-gray)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="soap-template-switch"
                            >
                                SOAP
                            </label>
                            <Switch.Root
                                id="soap-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'SOAP'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('SOAP');
                                        handleTemplateSelect('SOAP');
                                    }
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>

                        </div>
                        
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="pirp-template-switch"
                            >
                                PIRP
                            </label>
                            <Switch.Root
                                id="pirp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'PIRP'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('PIRP');
                                        handleTemplateSelect('PIRP');
                                    }
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>

                        </div>
                        
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="dap-template-switch"
                            >
                                DAP 
                            </label>
                            <Switch.Root
                                id="dap-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'DAP'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('DAP');
                                        handleTemplateSelect('DAP');
                                    }
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>  
                        </div>
                       
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="pie-template-switch"
                            >
                                PIE
                            </label>
                            <Switch.Root
                                id="pie-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'PIE'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('PIE');
                                        handleTemplateSelect('PIE');
                                    }   
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>
                        </div>
                        
                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="sirp-template-switch"
                            >
                                SIRP
                            </label>
                            <Switch.Root
                                id="sirp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'SIRP'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('SIRP');
                                        handleTemplateSelect('SIRP');
                                    }
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>
                        </div>

                        <div className="flex items-center justify-between border border-gray-200 rounded-md p-2 bg-white">
                            <label 
                                className="text-xs text-gray-500 font-medium pr-2"
                                htmlFor="girp-template-switch"
                            >
                                GIRP
                            </label>
                            <Switch.Root
                                id="girp-template-switch"
                                className={`w-[24px] h-[14px] bg-gray-100 shadow-sm rounded-full relative focus:outline-none data-[state=checked]:bg-storai-teal transition-colors ${
                                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                checked={activeNote?.type === 'template' && activeNote?.templateType === 'GIRP'}
                                onCheckedChange={() => {
                                    if (!isGenerating && activeNote && activeNote.type === 'note') {
                                        logTemplateSelection('GIRP');
                                        handleTemplateSelect('GIRP');
                                    }   
                                }}
                                disabled={!activeNote || activeNote.type === 'template' || isGenerating}
                            >
                                <Switch.Thumb className="block w-[10px] h-[10px] bg-white rounded-full shadow transition-transform duration-100 transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[11px]" />
                            </Switch.Root>
                        </div>
                       
                    </div>
              
                </div>
            )}
        </div>
    )
}

export default React.memo(TemplatesSection);