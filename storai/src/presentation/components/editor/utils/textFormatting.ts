import { Descendant, Element } from 'slate';
import { TemplateType } from '../../../../domain/entities/Template';
import { BaseElement } from 'slate';

/**
 * Convert Slate nodes to plain text
 */
export const slateToPlainText = (nodes: Descendant[]): string => {
  return nodes.map((node: any) => {
    if (typeof node.text === 'string') {
      return node.text;
    }
    if (Array.isArray(node.children)) {
      return node.children.map((child: any) => slateToPlainText([child])).join('');
    }
    return '';
  }).join('\n');
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
};

/**
 * Create empty content for the editor
 */
export const createEmptyContent = (): Descendant[] => {
  return JSON.parse(JSON.stringify([
    {
      type: 'paragraph',
      children: [{ text: '' }]
    }
  ]));
};

/**
 * Get fallback template content when generation fails
 */
export const getFallbackTemplateContent = (templateType: TemplateType): Descendant[] => {
  let content = '';
  
  switch (templateType) {
    case 'SOAP':
      content = "## Subjective\n\n\n## Objective\n\n\n## Assessment\n\n\n## Plan\n\n";
      break;
    case 'PIRP':
      content = "## Problem\n\n\n## Intervention\n\n\n## Response\n\n\n## Plan\n\n";
      break;
    case 'DAP':
      content = "## Data\n\n\n## Assessment\n\n\n## Plan\n\n";
      break;
    case 'PIE':
      content = "## Problem\n\n\n## Intervention\n\n\n## Evaluation\n\n";
      break;
    case 'SIRP':
      content = "## Situation\n\n\n## Intervention\n\n\n## Response\n\n\n## Plan\n\n";
      break;
    case 'GIRP':
      content = "## Goal\n\n\n## Intervention\n\n\n## Response\n\n\n## Plan\n\n";
      break;
    default:
      content = `Template: ${templateType}\n\nGenerated content would appear here based on template structure and patient notes.`;
  }
  
  return textToSlateValue(content);
};

/**
 * Convert plain text to Slate value with formatting recognition
 */
export const textToSlateValue = (text: string): Descendant[] => {
  if (!text) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  // Split text into lines
  const lines = text.split('\n');
  const slateNodes: Descendant[] = [];
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for markdown-style headers
    if (line.startsWith('## ')) {
      slateNodes.push({
        type: 'heading',
        level: 2,
        children: [{ text: line.substring(3) }]
      });
    } 
    // Check for section headers (Subjective:, Objective:, etc.)
    else if (/^(Subjective|Objective|Assessment|Plan|Problem|Intervention|Response|Data|Evaluation|Situation|Goal):/.test(line)) {
      const sectionName = line.split(':')[0];
      slateNodes.push({
        type: 'heading',
        level: 2,
        children: [{ text: sectionName }]
      });
    }
    // Check for bulleted lists
    else if (line.startsWith('- ')) {
      slateNodes.push({
        type: 'list-item',
        children: [{ text: line.substring(2) }]
      });
    }
    // Check for bold text
    else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      slateNodes.push({
        type: 'paragraph',
        children: [{ text: line.substring(2, line.length - 2), bold: true }]
      });
    }
    // Regular paragraph
    else {
      slateNodes.push({
        type: 'paragraph',
        children: [{ text: line }]
      });
    }
  }
  
  // Return a deep clone to avoid reference issues
  return JSON.parse(JSON.stringify(slateNodes));
};

interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  children: Descendant[];
}

export const textToSlate = (text: string): ParagraphElement[] => {
  return text.split('\n').map(line => ({
    type: 'paragraph' as const,
    children: [{ text: line }]
  }));
};