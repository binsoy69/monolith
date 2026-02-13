"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUp, CheckCircle } from "lucide-react";

interface TaskImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (content: string) => void;
}

export function TaskImportDialog({
  open,
  onOpenChange,
  onImport,
}: TaskImportDialogProps) {
  const [content, setContent] = React.useState("");
  const [preview, setPreview] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!content.trim()) {
      setPreview([]);
      return;
    }
    // Quick preview: extract checklist items
    const lines = content.split(/\r?\n/);
    const tasks = lines.filter((l) => /^\s*[-*]\s+\[([ xX])\]\s+.+/.test(l));
    setPreview(tasks.map((l) => l.trim()));
  }, [content]);

  function handleImport() {
    if (!content.trim()) return;
    onImport(content);
    setContent("");
    onOpenChange(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setContent(reader.result as string);
    };
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import Tasks from Markdown</DialogTitle>
          <DialogDescription>
            Paste markdown with checklist items or upload a .md file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Upload .md file</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-accent hover:bg-accent/5">
              <FileUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload a .md file
              </span>
              <input
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-content">Or paste markdown</Label>
            <Textarea
              id="import-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`- [ ] Buy groceries\n- [ ] Finish report\n  - [ ] Write intro\n  - [x] Research data`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {preview.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Preview: {preview.length} task{preview.length !== 1 && "s"}{" "}
                found
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {preview.map((line, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-accent shrink-0" />
                    <span className="truncate">
                      {line.replace(/^\s*[-*]\s+\[([ xX])\]\s+/, "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={preview.length === 0}>
            Import {preview.length} Task{preview.length !== 1 && "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
