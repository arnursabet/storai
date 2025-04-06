import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFileUpload } from '../../../application/hooks/useFileUpload'
import { DocumentIcon } from '../icons/DocumentIcon'
import {
  Template,
  TemplateType,
  TEMPLATES,
} from '../../../domain/entities/Template'

// Define template sections
interface TemplateSection {
  title: string
  description: string
}

// Define template data structure
interface Template {
  type: TemplateType
  title: string
  sections: TemplateSection[]
}

// Template definitions
const templates: Record<TemplateType, Template> = {
  SOAP: {
    type: 'SOAP',
    title: 'SOAP',
    sections: [
      { title: 'Subjective', description: 'Information relevant to client' },
      {
        title: 'Objective',
        description: "Factual information, symptoms, client's behavior",
      },
      {
        title: 'Assessment',
        description:
          'Your clinical impressions and interpretations of objective',
      },
      { title: 'Plan', description: 'What do you plan to do next session?' },
    ],
  },
  PIRP: {
    type: 'PIRP',
    title: 'PIRP',
    sections: [
      {
        title: 'Problem',
        description: "Description of the client's presenting problem",
      },
      {
        title: 'Intervention',
        description: 'Techniques and strategies used in session',
      },
      {
        title: 'Response',
        description: 'How the client responded to interventions',
      },
      { title: 'Plan', description: 'Future treatment strategies and goals' },
    ],
  },
  DAP: {
    type: 'DAP',
    title: 'DAP',
    sections: [
      { title: 'Data', description: 'Objective and subjective information' },
      {
        title: 'Assessment',
        description: "Your evaluation of the client's status",
      },
      { title: 'Plan', description: 'Outline of future treatment' },
    ],
  },
  PIE: {
    type: 'PIE',
    title: 'PIE',
    sections: [
      { title: 'Problem', description: 'Issue the client is experiencing' },
      {
        title: 'Intervention',
        description: 'Actions taken to address problems',
      },
      {
        title: 'Evaluation',
        description: 'Assessment of intervention effectiveness',
      },
    ],
  },
  SIRP: {
    type: 'SIRP',
    title: 'SIRP',
    sections: [
      { title: 'Situation', description: 'Context and background information' },
      { title: 'Intervention', description: 'Actions taken during session' },
      { title: 'Response', description: 'Client response and outcome' },
      { title: 'Plan', description: 'Future therapeutic direction' },
    ],
  },
  GIRP: {
    type: 'GIRP',
    title: 'GIRP',
    sections: [
      { title: 'Goals', description: 'Therapeutic objectives for the session' },
      { title: 'Intervention', description: 'Methods used to achieve goals' },
      { title: 'Response', description: 'How the client responded' },
      {
        title: 'Progress',
        description: 'Movement toward overall treatment goals',
      },
    ],
  },
}

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

export const TemplateSelectionScreen: React.FC = () => {
  const navigate = useNavigate()
  const { uploadedFiles } = useFileUpload()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    'SOAP'
  )
  const [expandedTemplate, setExpandedTemplate] = useState<TemplateType | null>(
    'SOAP'
  )

  const handleTemplateClick = (template: TemplateType) => {
    if (expandedTemplate === template) {
      // If already expanded, select/deselect it
      setSelectedTemplate(selectedTemplate === template ? null : template)
    } else {
      // If not expanded, expand it and select it
      setExpandedTemplate(template)
      setSelectedTemplate(template)
    }
  }

  const handleConfirm = () => {
    if (selectedTemplate) {
      // Pass selected template via navigation state
      navigate('/editor', { state: { selectedTemplate } })
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
      <div className="max-w-4xl mx-auto px-6">
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
                    <div className="flex items-center">
                      <DocumentIcon className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-4">
                        {formatFileSize(file.size)}
                      </span>
                      <button className="text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M12 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"
                            clip-rule="evenodd"
                          />
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
              className="px-6 py-2 bg-storai-jade text-white rounded-md hover:bg-storai-teal transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateSelectionScreen
