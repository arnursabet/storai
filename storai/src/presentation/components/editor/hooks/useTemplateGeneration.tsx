import { useEditorContext } from '../context/EditorContext';

export const useTemplateGeneration = () => {
  const { 
    isGenerating,
    templateError,
    showTemplateConfirmation,
    selectedTemplateType,
    pendingSourceNoteId,
    setIsGenerating,
    setTemplateError,
    setShowTemplateConfirmation,
    setSelectedTemplateType,
    setPendingSourceNoteId,
    handleTemplateSelect,
    handleConfirmTemplateGeneration,
    handleCancelTemplateGeneration,
    getTemplateButtonClass
  } = useEditorContext();

  return {
    isGenerating,
    templateError,
    showTemplateConfirmation,
    selectedTemplateType,
    pendingSourceNoteId,
    setIsGenerating,
    setTemplateError,
    setShowTemplateConfirmation,
    setSelectedTemplateType,
    setPendingSourceNoteId,
    handleTemplateSelect,
    handleConfirmTemplateGeneration,
    handleCancelTemplateGeneration,
    getTemplateButtonClass
  };
};