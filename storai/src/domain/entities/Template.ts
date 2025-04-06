/**
 * Represents the available template types for clinical notes
 */
export type TemplateType = 'SOAP' | 'PIRP' | 'DAP' | 'PIE' | 'SIRP' | 'GIRP';

/**
 * Represents a section within a template
 */
export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  keyPhrases?: string[];
}

/**
 * Represents a clinical note template
 */
export interface Template {
  type: TemplateType;
  sections: TemplateSection[];
}

/**
 * Standard templates available in the application
 */
export const TEMPLATES: Record<TemplateType, Template> = {
  SOAP: {
    type: 'SOAP',
    sections: [
      { 
        id: 'subjective', 
        name: 'Subjective', 
        description: 'Factual information, symptoms, client\'s behavior',
        keyPhrases: ['Patient states', 'Information relevant to client']
      },
      { 
        id: 'objective', 
        name: 'Objective', 
        description: 'Your clinical observations and measurements',
        keyPhrases: ['Common symptoms include']
      },
      { 
        id: 'assessment', 
        name: 'Assessment', 
        description: 'Your professional analysis and interpretation',
        keyPhrases: ['These symptoms suggest']
      },
      { 
        id: 'plan', 
        name: 'Plan', 
        description: 'What you plan to do next session?',
        keyPhrases: ['Treatment plan requires']
      }
    ]
  },
  PIRP: {
    type: 'PIRP',
    sections: [
      { 
        id: 'problem', 
        name: 'Problem', 
        description: 'What you heard and observed',
        keyPhrases: ['Patient is', 'What you heard and observed']
      },
      { 
        id: 'intervention', 
        name: 'Intervention', 
        description: 'Therapeutic methods used in session',
        keyPhrases: ['Common symptoms include']
      },
      { 
        id: 'response', 
        name: 'Response', 
        description: 'Patient\'s reaction to interventions',
        keyPhrases: ['These symptoms suggest']
      },
      { 
        id: 'plan', 
        name: 'Plan', 
        description: 'Future treatment direction',
        keyPhrases: ['Treatment plan requires']
      }
    ]
  },
  DAP: {
    type: 'DAP',
    sections: [
      { 
        id: 'data', 
        name: 'Data', 
        description: 'What you heard and observed'
      },
      { 
        id: 'assessment', 
        name: 'Assessment', 
        description: 'Clinician interpretation and subjective analysis'
      },
      { 
        id: 'plan', 
        name: 'Plan', 
        description: 'Your plan for future treatment and therapy'
      }
    ]
  },
  PIE: {
    type: 'PIE',
    sections: [
      { 
        id: 'problem', 
        name: 'Problem', 
        description: 'Situation information'
      },
      { 
        id: 'intervention', 
        name: 'Intervention', 
        description: 'Therapeutic interventions and techniques'
      },
      { 
        id: 'evaluation', 
        name: 'Evaluation', 
        description: 'Client\'s response to interventions'
      }
    ]
  },
  SIRP: {
    type: 'SIRP',
    sections: [
      { 
        id: 'situation', 
        name: 'Situation', 
        description: 'The current situation'
      },
      { 
        id: 'intervention', 
        name: 'Intervention', 
        description: 'The intervention provided'
      },
      { 
        id: 'response', 
        name: 'Response', 
        description: 'Client\'s response to interventions'
      },
      { 
        id: 'plan', 
        name: 'Plan', 
        description: 'Future plan of action'
      }
    ]
  },
  GIRP: {
    type: 'GIRP',
    sections: [
      { 
        id: 'goal', 
        name: 'Goal', 
        description: 'The treatment goal'
      },
      { 
        id: 'intervention', 
        name: 'Intervention', 
        description: 'The intervention provided'
      },
      { 
        id: 'response', 
        name: 'Response', 
        description: 'Client\'s response to interventions'
      },
      { 
        id: 'plan', 
        name: 'Plan', 
        description: 'Future plan of action'
      }
    ]
  }
}; 