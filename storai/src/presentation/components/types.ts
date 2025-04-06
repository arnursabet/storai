import { Descendant } from 'slate';
import { TemplateType } from '../../domain/entities/Template';

export interface TabData {
  id: string;
  title: string;
  type: 'note' | 'template';
  content: Descendant[];
  templateType?: TemplateType;
  folderId?: string; // Associate notes with folders
  sourceNoteId?: string; // Track the source note for templates
  isRenaming?: boolean; // Track if note is being renamed
}

export interface FolderData {
  id: string;
  name: string;
  isActive: boolean;
  isExpanded?: boolean; // Track if folder is expanded
  isRenaming?: boolean; // Track if folder is being renamed
  notes?: TabData[]; // Notes contained in the folder
} 