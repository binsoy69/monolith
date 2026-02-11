"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolder: string;
  onCreated: () => void;
}

export function CreateFileDialog({
  open,
  onOpenChange,
  currentFolder,
  onCreated,
}: CreateFileDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"file" | "folder">("file");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const fullPath = currentFolder
        ? `${currentFolder}/${name.trim()}${type === "file" && !name.endsWith(".md") ? ".md" : ""}`
        : `${name.trim()}${type === "file" && !name.endsWith(".md") ? ".md" : ""}`;

      if (type === "file") {
        const res = await fetch("/api/vault/file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: fullPath, content: `# ${name.trim().replace(/\.md$/, "")}\n\n` }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
      } else {
        const res = await fetch("/api/vault/folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: fullPath }),
        });
        if (!res.ok) throw new Error();
      }

      toast.success(`${type === "file" ? "File" : "Folder"} created`);
      setName("");
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || `Failed to create ${type}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New {type === "file" ? "File" : "Folder"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "file" | "folder")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="folder">Folder</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "file" ? "my-note.md" : "folder-name"}
              required
            />
            {currentFolder && (
              <p className="text-xs text-muted-foreground mt-1">
                Creating in: {currentFolder}/
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
