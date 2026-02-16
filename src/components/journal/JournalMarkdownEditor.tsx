"use client";

import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { forwardRef, useEffect, useState, useRef, useCallback } from "react";

export interface JournalMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const JournalMDXEditor = dynamic(
  () =>
    import("@mdxeditor/editor").then((mod) => {
      const {
        MDXEditor,
        headingsPlugin,
        listsPlugin,
        quotePlugin,
        thematicBreakPlugin,
        linkPlugin,
        linkDialogPlugin,
        codeBlockPlugin,
        markdownShortcutPlugin,
        realmPlugin,
        useCellValue,
        currentSelection$,
        activeEditor$,
        getSelectionRectangle,
        BoldItalicUnderlineToggles,
        CodeToggle,
        CreateLink,
      } = mod;

      // Floating toolbar component - lives inside MDXEditor realm
      function FloatingToolbar() {
        const selection = useCellValue(currentSelection$);
        const editor = useCellValue(activeEditor$);
        const [position, setPosition] = useState<{
          top: number;
          left: number;
        } | null>(null);
        const [visible, setVisible] = useState(false);
        const toolbarRef = useRef<HTMLDivElement>(null);
        const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const updatePosition = useCallback(() => {
          if (!editor) return;
          const rect = getSelectionRectangle(editor);
          if (rect && rect.width > 0) {
            const toolbarHeight = 40;
            setPosition({
              top: rect.top - toolbarHeight - 8,
              left: rect.left + rect.width / 2,
            });
            setVisible(true);
          } else {
            setVisible(false);
          }
        }, [editor]);

        useEffect(() => {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }

          if (!selection || !editor) {
            // Small delay before hiding to allow clicking toolbar buttons
            hideTimeoutRef.current = setTimeout(() => setVisible(false), 150);
            return;
          }

          // Check if selection is collapsed (no text selected)
          const isCollapsed =
            selection.anchor.key === selection.focus.key &&
            selection.anchor.offset === selection.focus.offset;

          if (isCollapsed) {
            hideTimeoutRef.current = setTimeout(() => setVisible(false), 150);
            return;
          }

          updatePosition();

          return () => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
          };
        }, [selection, editor, updatePosition]);

        if (!visible || !position) return null;

        return (
          <div
            ref={toolbarRef}
            className="floating-toolbar"
            style={{
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateX(-50%)",
              zIndex: 50,
            }}
            onMouseDown={(e) => {
              // Prevent toolbar clicks from stealing focus/selection
              e.preventDefault();
            }}
          >
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <CreateLink />
          </div>
        );
      }

      // Custom plugin to inject floating toolbar
      const floatingToolbarPlugin = realmPlugin({
        init(realm) {
          realm.pub(mod.addTopAreaChild$, FloatingToolbar);
        },
      });

      const Editor = forwardRef<MDXEditorMethods, JournalMarkdownEditorProps>(
        ({ value, onChange, placeholder, readOnly }, ref) => (
          <MDXEditor
            ref={ref}
            markdown={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            contentEditableClassName="prose prose-base dark:prose-invert max-w-none min-h-[400px] focus:outline-none leading-relaxed"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
              markdownShortcutPlugin(),
              floatingToolbarPlugin(),
            ]}
          />
        ),
      );
      Editor.displayName = "JournalMDXEditorInner";
      return Editor;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse bg-muted/30 rounded-md" />
    ),
  },
);

export function JournalMarkdownEditor(props: JournalMarkdownEditorProps) {
  return (
    <div className="journal-editor [&_.mdxeditor]:!bg-transparent [&_.mdxeditor-root-contenteditable]:!p-0">
      <JournalMDXEditor {...props} />
    </div>
  );
}
