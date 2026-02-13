"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Code } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { Textarea } from "@/components/ui/textarea";

interface FileEditorProps {
  filePath: string;
}

export function FileEditor({ filePath }: FileEditorProps) {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rawMode, setRawMode] = useState(false);

  const fetchFile = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/vault/file?path=${encodeURIComponent(filePath)}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContent(data.content);
      setLoaded(true);
    } catch {
      toast.error("Failed to load file");
    }
  }, [filePath]);

  useEffect(() => {
    setLoaded(false);
    fetchFile();
  }, [fetchFile]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/vault/file?path=${encodeURIComponent(filePath)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("File saved");
    } catch {
      toast.error("Failed to save file");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${filePath}"?`)) return;
    try {
      const res = await fetch(
        `/api/vault/file?path=${encodeURIComponent(filePath)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error();
      toast.success("File deleted");
      // Parent will handle navigation
      window.dispatchEvent(new CustomEvent("vault-file-deleted"));
    } catch {
      toast.error("Failed to delete file");
    }
  }

  // Keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!loaded) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0">
        <span className="text-sm font-medium truncate">{filePath}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRawMode(!rawMode)}
          >
            <Code className="h-4 w-4 mr-1" />
            {rawMode ? "Rich" : "Raw"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            aria-label="Delete file"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {rawMode ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm resize-none"
            placeholder="Write markdown here..."
          />
        ) : (
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing..."
          />
        )}
      </div>
    </div>
  );
}
