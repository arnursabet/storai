import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFileUpload } from '../../../application/hooks/useFileUpload'
import { DocumentIcon } from '../icons/DocumentIcon'
import {
  Template,
  TemplateType,
  TEMPLATES,
} from '../../../domain/entities/Template'
import { EditorProvider, useEditorContext } from '../editor/context/EditorContext'


// Create a UI-friendly template format that maps the domain model to the UI needs
const uiTemplates: Record<
  TemplateType,
  {
    type: TemplateType
    title: string
    sections: { title: string; description: string }[]
  }
> = {
  SOAP: {
    type: 'SOAP',
    title: 'SOAP',
    sections: TEMPLATES.SOAP.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
  PIRP: {
    type: 'PIRP',
    title: 'PIRP',
    sections: TEMPLATES.PIRP.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
  DAP: {
    type: 'DAP',
    title: 'DAP',
    sections: TEMPLATES.DAP.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
  PIE: {
    type: 'PIE',
    title: 'PIE',
    sections: TEMPLATES.PIE.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
  SIRP: {
    type: 'SIRP',
    title: 'SIRP',
    sections: TEMPLATES.SIRP.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
  GIRP: {
    type: 'GIRP',
    title: 'GIRP',
    sections: TEMPLATES.GIRP.sections.map((s) => ({
      title: s.name,
      description: s.description,
    })),
  },
}

// Uncaught Error: useEditorContext must be used within an EditorProvider
// at useEditorContext (EditorContext.tsx:696:11)
// at TemplateSelectionScreen (TemplateSelectionScreen.tsx:82:36)

// This is a child component of EditorProvider
// So we need to wrap it in EditorProvider

const TemplateSelectionScreen: React.FC = () => {
  return (
    <EditorProvider>
      <TemplateSelectionScreenContent />
    </EditorProvider>
  )
}

export default TemplateSelectionScreen



export const TemplateSelectionScreenContent: React.FC = () => {
  const navigate = useNavigate()
  const { uploadedFiles } = useFileUpload()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [expandedTemplate, setExpandedTemplate] = useState<TemplateType | null>(null)

  const handleTemplateClick = (template: TemplateType) => {
    if (expandedTemplate === template) {
      // If already expanded, select/deselect it
      setSelectedTemplate(selectedTemplate === template ? null : template)
      setExpandedTemplate(null)
    } else {
      // If not expanded, expand it and select it
      setExpandedTemplate(template)
      setSelectedTemplate(template)
    }
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      // Pass selected template via navigation state ONLY
      navigate('/editor', { state: { selectedTemplate } });
    }
  }

  const handleSkip = () => {
    navigate('/editor')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'kb'
    return (bytes / (1024 * 1024)).toFixed(1) + 'mb'
  }

  // Function to render a template card
  const renderTemplateCard = (templateType: TemplateType) => {
    const template = uiTemplates[templateType]
    const isExpanded = expandedTemplate === templateType
    const isSelected = selectedTemplate === templateType

    return (
      <div
        key={templateType}
        className={`
          rounded-lg border transition-all duration-200 overflow-hidden
          ${
            isExpanded
              ? 'border-storai-teal'
              : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between px-6 py-4 text-left"
          onClick={() => handleTemplateClick(templateType)}
        >
          <span className="font-medium text-lg">{template.title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-6 pb-5 pt-1">
            {template.sections.map((section, index) => (
              <div key={index} className="mb-4">
                <div className="inline-block bg-blue-100 text-blue-700 px-2 py-1 text-sm rounded mb-1">
                  {section.title}
                </div>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-storai-sky/30 to-white py-10">
      <div className="max-w-[80rem] mx-auto px-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Use template?
          </h1>
          <p className="text-gray-600 mb-8">
            We will generate a summary of your notes based on selected template.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {renderTemplateCard('SOAP')}
            {renderTemplateCard('PIRP')}
            {renderTemplateCard('DAP')}
            {renderTemplateCard('PIE')}
            {renderTemplateCard('SIRP')}
            {renderTemplateCard('GIRP')}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Files uploaded
              </h2>
              <ul className="space-y-3">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between py-2 px-3 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                       <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="5.33333" fill="#F6FAFF"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.4 13.8515C22.4 13.5579 22.2833 13.2762 22.0757 13.0686L17.3314 8.32429C17.1237 8.11665 16.8421 8 16.5485 8H10.4305C9.97188 8 9.6001 8.37178 9.6001 8.8304V23.1696C9.6001 23.6282 9.97188 24 10.4305 24H21.5696C22.0282 24 22.4 23.6282 22.4 23.1696V13.8515ZM16.3907 9.48774C16.3559 9.45286 16.2962 9.47756 16.2962 9.52688V13.9353C16.2962 14.0576 16.3954 14.1567 16.5177 14.1567H20.926C20.9754 14.1567 21.0001 14.0971 20.9652 14.0622L16.3907 9.48774Z" fill="#2388FF"/>
                        </svg>

                      <span className="text-gray-700">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-4">
                        {formatFileSize(file.size)}
                      </span>
                      <button className="text-gray-400" title="Remove file">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.00001 2.06057C6.81288 2.06057 6.63341 1.98623 6.50109 1.85391C6.36877 1.72159 6.29443 1.54212 6.29443 1.35499C6.29443 1.16786 6.36877 0.988394 6.50109 0.856073C6.63341 0.723751 6.81288 0.649414 7.00001 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 2.06057C7.18713 2.06057 7.3666 1.98623 7.49892 1.85391C7.63124 1.72159 7.70558 1.54212 7.70558 1.35499C7.70558 1.16786 7.63124 0.988394 7.49892 0.856073C7.3666 0.723751 7.18713 0.649414 7 0.649414" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7.00001 13.3506C6.81288 13.3506 6.63341 13.2763 6.50109 13.1439C6.36877 13.0116 6.29443 12.8322 6.29443 12.645C6.29443 12.4579 6.36877 12.2784 6.50109 12.1461C6.63341 12.0138 6.81288 11.9395 7.00001 11.9395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 13.3506C7.18713 13.3506 7.3666 13.2763 7.49892 13.1439C7.63124 13.0116 7.70558 12.8322 7.70558 12.645C7.70558 12.4579 7.63124 12.2784 7.49892 12.1461C7.3666 12.0138 7.18713 11.9395 7 11.9395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7.00001 7.7051C6.81288 7.7051 6.63341 7.63076 6.50109 7.49844C6.36877 7.36612 6.29443 7.18665 6.29443 6.99952C6.29443 6.81239 6.36877 6.63293 6.50109 6.5006C6.63341 6.36828 6.81288 6.29395 7.00001 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7 7.7051C7.18713 7.7051 7.3666 7.63076 7.49892 7.49844C7.63124 7.36612 7.70558 7.18665 7.70558 6.99952C7.70558 6.81239 7.63124 6.63293 7.49892 6.5006C7.3666 6.36828 7.18713 6.29395 7 6.29395" stroke="#666F8D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>

                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-storai-teal text-white rounded-md hover:bg-storai-teal transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}