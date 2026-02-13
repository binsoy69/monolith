"use client";

import dynamic from "next/dynamic";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { forwardRef } from "react";

const MDXEditorComponent = dynamic(
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
        toolbarPlugin,
        BoldItalicUnderlineToggles,
        BlockTypeSelect,
        CreateLink,
        ListsToggle,
        InsertThematicBreak,
        UndoRedo,
        CodeToggle,
      } = mod;

      const Editor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
        ({ value, onChange, placeholder, readOnly }, ref) => (
          <MDXEditor
            ref={ref}
            markdown={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            contentEditableClassName="prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <ListsToggle />
                    <CreateLink />
                    <InsertThematicBreak />
                  </>
                ),
              }),
            ]}
          />
        ),
      );
      Editor.displayName = "MDXEditorInner";
      return Editor;
    }),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse bg-muted rounded-md" /> },
);

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  return (
    <div className="rounded-md border bg-background overflow-hidden [&_.mdxeditor]:!bg-transparent [&_.mdxeditor-toolbar]:!bg-muted/50 [&_.mdxeditor-toolbar]:border-b">
      <MDXEditorComponent {...props} />
    </div>
  );
}
