import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, Range, Point, Text, BaseEditor } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor, useSlateStatic } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import isHotkey from 'is-hotkey';
import { BoldIcon, CenterAlignIcon, ClearFormatIcon, CodeIcon, ExportIcon, ItalicIcon, LeftAlignIcon, ListIcon, OrderedListIcon, RedoIcon, RightAlignIcon, SaveIcon, StrikethroughIcon, TrashIcon, UnderlineIcon, UndoIcon } from '../../common';

// --- Constants ---
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
const HOTKEYS: { [key: string]: string } = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

// --- Interfaces & Types ---
interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  readOnly?: boolean;
  // Placeholders for higher-level actions
  onDeleteFile?: () => void;
  onSaveChanges?: () => void;
  onExport?: () => void;
}

// Custom element types
type ParagraphElement = { type: 'paragraph'; align?: string; children: CustomText[] };
type HeadingElement = { type: 'heading'; level: 1 | 2 | 3; align?: string; children: CustomText[] };
// Add other element types as needed
type ListItemElement = { type: 'list-item'; children: CustomText[] }; // Align handled by parent list
type BulletedListElement = { type: 'bulleted-list'; align?: string; children: ListItemElement[] };
type NumberedListElement = { type: 'numbered-list'; align?: string; children: ListItemElement[] };

type CustomElement =
  | ParagraphElement
  | HeadingElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement;

type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string; // Added color mark
};

type CustomText = FormattedText;

// Declare custom Slate types
type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// --- Utility Functions ---

const toggleMark = (editor: CustomEditor, format: keyof Omit<CustomText, 'text'>) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: CustomEditor, format: keyof Omit<CustomText, 'text'>) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleBlock = (editor: CustomEditor, format: CustomElement['type']) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block: CustomElement = { type: format as 'bulleted-list' | 'numbered-list', children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: string,
  blockType: 'type' | 'align' = 'type'
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const clearFormatting = (editor: CustomEditor) => {
    // Remove marks
    const marks = Editor.marks(editor);
    if (marks) {
        (Object.keys(marks) as Array<keyof Omit<CustomText, 'text'>>).forEach(mark => {
            Editor.removeMark(editor, mark);
        });
    }
};


// --- Rendering Components ---

// Define a renderElement function to render various block types
const Element = React.memo(({ attributes, children, element }: any) => {
  // Default style includes handling alignment
  const style = { textAlign: element.align };

  switch (element.type) {
    case 'heading':
      switch (element.level) {
        case 1: return <h1 style={style} className="text-2xl font-bold mt-4 mb-2" {...attributes}>{children}</h1>;
        case 2: return <h2 style={style} className="text-xl font-semibold mt-3 mb-2" {...attributes}>{children}</h2>;
        case 3: return <h3 style={style} className="text-lg font-medium mt-3 mb-2" {...attributes}>{children}</h3>;
        default: return <h2 style={style} className="text-xl font-semibold mt-3 mb-2" {...attributes}>{children}</h2>; // Fallback
      }
    case 'bulleted-list':
      return <ul style={style} className="list-disc pl-6 my-2" {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol style={style} className="list-decimal pl-6 my-2" {...attributes}>{children}</ol>;
    case 'list-item':
      return <li className="my-1" {...attributes}>{children}</li>; // Alignment is on parent
    default: // paragraph
      return <p style={style} className="my-2" {...attributes}>{children}</p>;
  }
});

// Define a renderLeaf function to render text with formatting
const Leaf = React.memo(({ attributes, children, leaf }: any) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.strikethrough) children = <del>{children}</del>;
  if (leaf.code) children = <code className="bg-gray-100 text-sm px-1 rounded">{children}</code>;
  if (leaf.color) children = <span style={{ color: leaf.color }}>{children}</span>;

  return <span {...attributes}>{children}</span>;
});

// --- Toolbar Components ---

const ToolbarButton = ({
    format,
    icon,
    label,
    action = 'mark', // 'mark' | 'block' | 'action'
    onClick,
}: {
    format?: string; // mark or block format
    icon?: React.ReactNode;
    label?: string;
    action?: 'mark' | 'block' | 'action' | 'block-type' | 'align-type';
    onClick?: (editor: CustomEditor) => void; // For custom actions like undo/redo/clear
}) => {
    const editor = useSlate();
    let isActive = false;

    if (action === 'mark' && format) {
        isActive = isMarkActive(editor, format as keyof Omit<CustomText, 'text'>);
    } else if (action === 'block' && format) {
        isActive = isBlockActive(editor, format);
    } else if (action === 'align-type' && format) {
         isActive = isBlockActive(editor, format, 'align');
    }
    // Add active state check for block-type if needed (e.g., highlight current heading level)


    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (onClick) {
            onClick(editor);
        } else if (action === 'mark' && format) {
            toggleMark(editor, format as keyof Omit<CustomText, 'text'>);
        } else if ((action === 'block' || action === 'align-type') && format) {
            toggleBlock(editor, format as CustomElement['type']); // TODO: Refine toggleBlock for align
        }
        // Add logic for block-type if needed
    };

    // Basic styling, can be improved
    const activeClass = isActive ? 'bg-storai-teal text-white' : 'text-gray-600 hover:bg-gray-100';
    const disabledClass = action === 'action' && (format === 'undo' && editor.history.undos.length === 0 || format === 'redo' && editor.history.redos.length === 0) ? 'opacity-50 cursor-not-allowed' : '';


    return (
        <button
            type="button" // Prevent form submission if nested
            className={`p-1.5 rounded ${activeClass} ${disabledClass} flex items-center justify-center min-w-[30px]`}
            onMouseDown={handleClick}
            title={label || format}
            aria-label={label || format}
            disabled={action === 'action' && (format === 'undo' && editor.history.undos.length === 0 || format === 'redo' && editor.history.redos.length === 0)}
        >
            {icon || label || format}
        </button>
    );
};

const Dropdown = ({
    options, // { value: string, label: string }[]
    actionType, // 'block-type' | 'align-type' | 'color' (TBD)
    currentValue, // Function to get current value from editor state
    onChange, // Function to call Transforms/Editor methods
    placeholder,
}: {
    options: { value: string; label: string; icon?: React.ReactNode }[];
    actionType: 'block-type' | 'align-type' | 'color';
    currentValue: (editor: CustomEditor) => string;
    onChange: (editor: CustomEditor, value: string) => void;
    placeholder?: string;
}) => {
    const editor = useSlateStatic(); // Use static version in dropdowns to avoid re-renders
    const value = currentValue(editor);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(editor, e.target.value);
    };

    return (
        <select
            value={value}
            title={placeholder}
            onChange={handleChange}
            className="p-1 border-none rounded text-sm text-gray-700 bg-white focus:outline-none"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.icon && option.icon} {option.label}</option>
            ))}
        </select>
    );
};


// Toolbar component to be used inside the Slate context
const Toolbar = ({ onDeleteFile, onSaveChanges, onExport }: Pick<RichTextEditorProps, 'onDeleteFile' | 'onSaveChanges' | 'onExport'>) => {
    const editor = useSlate(); // Need this for undo/redo state

    const getCurrentBlockType = useCallback((editor: CustomEditor): string => {
        const { selection } = editor;
        if (!selection) return 'paragraph'; // Default

        const [match] = Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n),
            mode: 'lowest',
        });

        if (match) {
            const [node] = match;
            if (SlateElement.isElement(node)) {
                 if (node.type === 'heading') return `heading-${node.level}`;
                 return node.type;
            }
        }
        return 'paragraph';
    }, []);

    const changeBlockType = useCallback((editor: CustomEditor, value: string) => {
         const isList = LIST_TYPES.includes(value);
         const [heading, levelStr] = value.split('-');
         const level = parseInt(levelStr, 10);

         // Handle lists separately (like before)
         if (isList) {
             toggleBlock(editor, value as CustomElement['type']);
             return;
         }

         // Unwrap lists if changing from list item
         Transforms.unwrapNodes(editor, {
             match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
             split: true,
         });

         // Set new block type
         Transforms.setNodes<SlateElement>(editor, {
             type: heading === 'heading' && level ? 'heading' : 'paragraph',
             ...(heading === 'heading' && level && { level: level as 1 | 2 | 3 }),
             ...(heading !== 'heading' && { type: value as 'paragraph' }) // Ensure type is set
         });
    }, []);

    const getCurrentAlignment = useCallback((editor: CustomEditor): string => {
        const { selection } = editor;
        if (!selection) return 'left'; // Default

        const [match] = Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && !!n.align,
            mode: 'lowest',
        });

        if (match) {
            const [node] = match;
            if (SlateElement.isElement(node)) {
                 return node.align || 'left';
            }
        }
        return 'left';
    }, []);

     const changeAlignment = useCallback((editor: CustomEditor, value: string) => {
        const newProperties: Partial<SlateElement> = {
          align: value === 'left' ? undefined : value, // Remove prop for default (left)
        };
        Transforms.setNodes<SlateElement>(editor, newProperties);
    }, []);

    // Define options
    const textTypeOptions = [
        { value: 'paragraph', label: 'Normal text' },
        { value: 'heading-1', label: 'Heading 1' },
        { value: 'heading-2', label: 'Heading 2' },
        { value: 'heading-3', label: 'Heading 3' },
    ];

    const alignmentOptions = [
        { value: 'left', label: 'Left', icon: <LeftAlignIcon /> },
        { value: 'center', label: 'Center', icon: <CenterAlignIcon /> },
        { value: 'right', label: 'Right', icon: <RightAlignIcon /> },
    ];

  return (
    <div className="flex flex-wrap items-center justify-between sticky top-0 z-10">
      {/* Group 1: History */}
      <div className="flex items-center gap-x-[2px]">
        <ToolbarButton format="undo" label="Undo" icon={<UndoIcon />} action="action" onClick={editor => editor.undo()} />
        <ToolbarButton format="redo" label="Redo" icon={<RedoIcon />} action="action" onClick={editor => editor.redo()} />
      </div>

      {/* Group 2: Block Types */}
      <div className="flex items-center space-x-1">
        <Dropdown
            options={textTypeOptions}
            actionType="block-type"
            currentValue={getCurrentBlockType}
            onChange={changeBlockType}
            placeholder="Text type"
        />
      </div>

      {/* Group 3: Alignment */}
       <div className="flex items-center space-x-1">
        <Dropdown
          options={alignmentOptions}
          actionType="align-type"
          currentValue={getCurrentAlignment}
          onChange={changeAlignment}
          placeholder="Align"
        />
      </div>

       {/* Group 4: Color (Placeholder) */}
       {/* <div title="Color (Not Implemented)">🎨</div> */}

      {/* Group 5: Marks */}
      <div className="flex items-center gap-x-[2px]">
        <ToolbarButton format="bold" label="Bold" icon={<BoldIcon />} action="mark" />
        <ToolbarButton format="italic" label="Italic" icon={<ItalicIcon />} action="mark" />
        <ToolbarButton format="underline" label="Underline" icon={<UnderlineIcon />} action="mark" />
        <ToolbarButton format="strikethrough" label="Strikethrough" icon={<StrikethroughIcon />} action="mark" />
        <ToolbarButton format="code" label="Code" icon={<CodeIcon />} action="mark" />
        <ToolbarButton label="Clear Formatting" icon={<ClearFormatIcon />} action="action" onClick={clearFormatting} />
       </div>

      {/* Group 7: Lists */}
      <div className="flex items-center gap-x-[2px]">
        <ToolbarButton format="bulleted-list" label="Bulleted List" icon={<ListIcon />} action="block" />
        <ToolbarButton format="numbered-list" label="Numbered List" icon={<OrderedListIcon />} action="block" />
      </div>

      {/* Group 8: File Actions (Placeholders) */}
      <div className="flex items-center">
        <ToolbarButton label="Delete File" icon={<TrashIcon />} action="action" onClick={() => onDeleteFile?.()} />
        <ToolbarButton label="Save Changes" icon={<SaveIcon/>} action="action" onClick={() => onSaveChanges?.()} />
        <ToolbarButton label="Export" icon={<ExportIcon />} action="action" onClick={() => onExport?.()} />
      </div>

    </div>
  );
};


// --- Main Editor Component ---

// Set initial value if needed (e.g., empty paragraph)
export const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value = initialValue, // Ensure default value
    onChange,
    readOnly = false,
    onDeleteFile,
    onSaveChanges,
    onExport
}) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Define a rendering function for custom nodes
  const renderElement = useCallback((props: any) => <Element {...props} />, []);

  // Define a rendering function for custom marks
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

   // Hotkey handling
   const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
       for (const hotkey in HOTKEYS) {
           if (isHotkey(hotkey, event as any)) {
               event.preventDefault();
               const mark = HOTKEYS[hotkey] as keyof Omit<CustomText, 'text'>;
               toggleMark(editor, mark);
           }
       }
       // Add other hotkeys if needed (e.g., for block types)
   }, [editor]);


  return (
    <div className="rounded-md overflow-hidden">
      <Slate
        editor={editor}
        initialValue={value}
        onChange={onChange}
      >
        {!readOnly && <Toolbar onDeleteFile={onDeleteFile} onSaveChanges={onSaveChanges} onExport={onExport} />}
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter text here..."
          spellCheck
          autoFocus
          onKeyDown={handleKeyDown} // Add hotkey handler
          className="p-4 min-h-[200px] max-h-[80vh] overflow-y-scroll focus:outline-none no-scrollbar"
          readOnly={readOnly}
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor; 