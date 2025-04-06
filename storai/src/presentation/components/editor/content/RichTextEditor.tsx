import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';

interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  readOnly?: boolean;
}

// Custom element types
type CustomElement = {
  type: 'paragraph' | 'heading' | 'heading-one' | 'heading-two' | 'list-item' | 'bulleted-list' | 'numbered-list';
  level?: number; // For heading levels
  children: CustomText[];
  align?: string;
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

// Declare custom Slate types
type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Define a renderElement function to render various block types
const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align };
  
  switch (element.type) {
    case 'heading':
      // Use the level property to determine which heading to render
      switch (element.level) {
        case 1:
          return <h1 className="text-2xl font-bold mt-4 mb-2" style={style} {...attributes}>{children}</h1>;
        case 2:
          return <h2 className="text-xl font-semibold mt-3 mb-2" style={style} {...attributes}>{children}</h2>;
        case 3:
          return <h3 className="text-lg font-medium mt-3 mb-2" style={style} {...attributes}>{children}</h3>;
        default:
          return <h2 className="text-xl font-semibold mt-3 mb-2" style={style} {...attributes}>{children}</h2>;
      }
    case 'heading-one':
      return <h1 className="text-2xl font-bold mt-4 mb-2" style={style} {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 className="text-xl font-semibold mt-3 mb-2" style={style} {...attributes}>{children}</h2>;
    case 'bulleted-list':
      return <ul className="list-disc pl-5 my-2" style={style} {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol className="list-decimal pl-5 my-2" style={style} {...attributes}>{children}</ol>;
    case 'list-item':
      return <li className="my-1" style={style} {...attributes}>{children}</li>;
    default:
      return <p className="my-2" style={style} {...attributes}>{children}</p>;
  }
};

// Define a renderLeaf function to render text with formatting
const Leaf = ({ attributes, children, leaf }: any) => {
  let formattedChildren = children;

  if (leaf.bold) {
    formattedChildren = <strong>{formattedChildren}</strong>;
  }

  if (leaf.italic) {
    formattedChildren = <em>{formattedChildren}</em>;
  }

  if (leaf.underline) {
    formattedChildren = <u>{formattedChildren}</u>;
  }

  if (leaf.strikethrough) {
    formattedChildren = <del>{formattedChildren}</del>;
  }

  return <span {...attributes}>{formattedChildren}</span>;
};

// Button toolbar components
const MarkButton = ({ format, icon, label }: { format: string; icon?: React.ReactNode; label?: string }) => {
  const editor = useSlate();
  
  const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format as keyof typeof marks] === true : false;
  };

  const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  return (
    <button
      className={`p-1 ${isMarkActive(editor, format) ? 'bg-storai-teal text-white' : 'text-gray-700 hover:bg-gray-100'} rounded`}
      onMouseDown={e => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
      title={label || format}
      aria-label={label || format}
    >
      {icon || label || format}
    </button>
  );
};

const BlockButton = ({ format, icon, label }: { format: string; icon?: React.ReactNode; label?: string }) => {
  const editor = useSlate();
  
  const isBlockActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
    });
    return !!match;
  };

  const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = format === 'bulleted-list' || format === 'numbered-list';

    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && 
        ['bulleted-list', 'numbered-list'].includes((n as any).type as string),
      split: true,
    });

    const newProperties: Partial<CustomElement> = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format as any,
    };

    Transforms.setNodes<CustomElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] } as CustomElement;
      Transforms.wrapNodes(editor, block);
    }
  };

  return (
    <button
      className={`p-1 ${isBlockActive(editor, format) ? 'bg-storai-teal text-white' : 'text-gray-700 hover:bg-gray-100'} rounded`}
      onMouseDown={e => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
      title={label || format}
      aria-label={label || format}
    >
      {icon || label || format}
    </button>
  );
};

export const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// Toolbar component to be used inside the Slate context
const Toolbar = () => {
  return (
    <div className="flex items-center p-2 space-x-2">
      <MarkButton format="bold" label="Bold" icon="B" />
      <MarkButton format="italic" label="Italic" icon="I" />
      <MarkButton format="underline" label="Underline" icon="U" />
      <MarkButton format="strikethrough" label="Strikethrough" icon="S" />
      
      <div className="border-l border-gray-200 h-6 mx-1"></div>
      
      <BlockButton format="heading-one" label="Heading 1" icon="H1" />
      <BlockButton format="heading-two" label="Heading 2" icon="H2" />
      
      <div className="border-l border-gray-200 h-6 mx-1"></div>
      
      <BlockButton 
        format="bulleted-list" 
        label="Bulleted List"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        }
      />
      
      <BlockButton 
        format="numbered-list" 
        label="Numbered List"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        }
      />
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, readOnly = false }) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Define a rendering function for custom nodes
  const renderElement = useCallback((props: any) => <Element {...props} />, []);

  // Define a rendering function for custom marks
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  return (
    <div className="rounded-md overflow-hidden">
      <Slate
        editor={editor}
        initialValue={value}
        onChange={onChange}
      >
        {!readOnly && <Toolbar />}
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter text here..."
          spellCheck
          className="p-4 min-h-[200px] max-h-[80vh] overflow-y-scroll focus:outline-none"
          readOnly={readOnly}
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor; 