"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search } from "lucide-react";
import { FolderTree } from "./FolderTree";
import { FileEditor } from "./FileEditor";
import { CreateFileDialog } from "./CreateFileDialog";
import { QuickOpenDialog } from "./QuickOpenDialog";
import type { TreeNode } from "@/lib/services/vault.service";

export function VaultLayout() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [quickOpenOpen, setQuickOpenOpen] = useState(false);

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch("/api/vault/tree");
      if (res.ok) setTree(await res.json());
    } catch {
      // Tree will be empty
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Listen for file deletion
  useEffect(() => {
    function onDeleted() {
      setActivePath(null);
      fetchTree();
    }
    window.addEventListener("vault-file-deleted", onDeleted);
    return () => window.removeEventListener("vault-file-deleted", onDeleted);
  }, [fetchTree]);

  // Ctrl+P quick open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setQuickOpenOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function getCurrentFolder(): string {
    if (!activePath) return "";
    const lastSlash = activePath.lastIndexOf("/");
    return lastSlash > 0 ? activePath.substring(0, lastSlash) : "";
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-card overflow-hidden">
      {/* Sidebar - folder tree */}
      <div className="w-64 border-r flex flex-col shrink-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Vault</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setQuickOpenOpen(true)}
              title="Quick open (Ctrl+P)"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCreateOpen(true)}
              title="New file or folder"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {tree.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No files yet. Create your first file!
              </p>
            ) : (
              <FolderTree
                nodes={tree}
                activePath={activePath}
                onSelectFile={(path) => setActivePath(path)}
              />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content - editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {activePath ? (
          <FileEditor key={activePath} filePath={activePath} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Select a file to edit</p>
              <p className="text-sm mt-1">
                Or press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Ctrl+P</kbd> to search
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateFileDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        currentFolder={getCurrentFolder()}
        onCreated={() => {
          fetchTree();
        }}
      />

      <QuickOpenDialog
        open={quickOpenOpen}
        onOpenChange={setQuickOpenOpen}
        onSelectFile={(path) => setActivePath(path)}
      />
    </div>
  );
}
