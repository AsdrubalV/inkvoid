\"use client\";

import { useEditor, EditorContent } from \"@tiptap/react\";
import StarterKit from \"@tiptap/starter-kit\";
import Placeholder from \"@tiptap/extension-placeholder\";
import { useEffect } from \"react\";

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] }
      }),
      Placeholder.configure({
        placeholder: placeholder ?? \"Write your chapter...\"
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          \"prose prose-sm max-w-none min-h-[260px] rounded-lg border border-border bg-white px-3 py-2 focus-within:outline-none\"
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className=\"space-y-2\">
      <EditorContent editor={editor} />
    </div>
  );
}

