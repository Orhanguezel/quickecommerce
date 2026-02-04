"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Minus,
  Pilcrow,
  Plus,
  Trash2,
  Underline as UnderlineIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  maxHeight?: string;
};

export default function TiptapEditor({
  value,
  onChange,
  maxHeight = "300px",
}: Props) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [color, setColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      Color,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose rounded-md p-3 min-h-[150px] focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      //@ts-ignore
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return <div>Loading editor...</div>;

  const buttonClasses = (isActive: boolean) =>
    cn(
      "p-2 w-8 h-8 rounded-md bg-white hover:bg-blue-100 text-blue-500 hover:text-blue-600",
      isActive && "bg-blue-500 text-white hover:bg-blue-600"
    );

  const addLink = () => {
    if (!linkUrl) return setShowLinkInput(false);
    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (!imageUrl) return setShowImageInput(false);
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  };

  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    editor.chain().focus().setColor(newColor).run();
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2 border rounded-md p-2 bg-gray-100 dark:bg-[#1e293b] dark:border-[#475569] items-center">
        <Button
          type="button"
          className={buttonClasses(editor.isActive({ textAlign: "left" }))}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive({ textAlign: "center" }))}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive({ textAlign: "right" }))}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive({ textAlign: "justify" }))}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          className={buttonClasses(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          className={buttonClasses(editor.isActive("heading", { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          className={buttonClasses(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          className={buttonClasses(editor.isActive("paragraph"))}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="w-4 h-4" />
        </Button>

        {/* Link Input */}
        {showLinkInput ? (
          <>
            <input
              type="text"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") addLink();
                if (e.key === "Escape") setShowLinkInput(false);
              }}
            />
            <Button type="button" onClick={addLink} className="bg-green-500 text-white hover:bg-green-600">
              Add
            </Button>
            <Button type="button" onClick={() => setShowLinkInput(false)} className="bg-gray-300 hover:bg-gray-400">
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            className={buttonClasses(editor.isActive("link"))}
            onClick={() => {
              if (editor.isActive("link")) removeLink();
              else setShowLinkInput(true);
            }}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Image Input */}
        {showImageInput ? (
          <>
            <input
              type="text"
              placeholder="Enter Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") addImage();
                if (e.key === "Escape") setShowImageInput(false);
              }}
            />
            <Button type="button" onClick={addImage} className="bg-green-500 text-white hover:bg-green-600">
              Add
            </Button>
            <Button type="button" onClick={() => setShowImageInput(false)} className="bg-gray-300 hover:bg-gray-400">
              Cancel
            </Button>
          </>
        ) : (
          <Button type="button" className={buttonClasses(false)} onClick={() => setShowImageInput(true)} title="Insert Image">
            <ImageIcon className="w-4 h-4" />
          </Button>
        )}

        {/* Color Picker */}
        <input type="color" value={color} onChange={changeColor} title="Text Color" className="w-8 h-8 p-0 border rounded cursor-pointer" />

        {/* Table Controls */}
        <Button
          type="button"
          className={buttonClasses(false)}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <Columns className="w-5 h-5" />
        </Button>
      </div>

      {/* Custom table styles */}
      <style>{`
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #ddd;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #ddd;
          padding: 6px 8px;
        }
        .ProseMirror th {
          background-color: #f9fafb;
          text-align: center;
        }
      `}</style>

      {/* Editor */}
      <div className="overflow-y-auto border border-gray-300 dark:border-[#475569] dark:bg-slate-500 rounded-md" style={{ maxHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
