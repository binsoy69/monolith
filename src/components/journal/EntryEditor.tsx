"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { JournalMarkdownEditor } from "./JournalMarkdownEditor";
import { PropertiesPanel } from "./PropertiesPanel";
import { toISODate } from "@/lib/utils/dates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { JournalEntryWithTags } from "@/lib/services/journal.service";

interface EntryEditorProps {
  entryId?: number;
}

export function EntryEditor({ entryId }: EntryEditorProps) {
  const router = useRouter();
  const isNew = !entryId;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [entryDate, setEntryDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(isNew);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMode, setPasswordMode] = useState<"encrypt" | "decrypt">(
    "decrypt",
  );

  const fetchEntry = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`/api/journal/${entryId}`);
      if (!res.ok) throw new Error();
      const entry: JournalEntryWithTags & { contentEncrypted?: boolean } =
        await res.json();
      setTitle(entry.title ?? "");

      if (entry.contentEncrypted) {
        setIsEncrypted(true);
        setIsLocked(true);
        setContent("");
      } else {
        setContent(entry.content ?? "");
      }

      setMood(entry.mood);
      setTags(entry.tags);
      setEntryDate(entry.entryDate.split(" ")[0]);
      setLoaded(true);
    } catch {
      toast.error("Failed to load entry");
      router.push("/journal");
    }
  }, [entryId, router]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const handleSave = useCallback(async () => {
    if (isLocked) return;
    setLoading(true);
    try {
      const body = {
        title: title || undefined,
        content,
        mood,
        entryDate: entryDate + " 00:00:00",
        tags,
      };

      if (isNew) {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const entry = await res.json();
        toast.success("Entry created");
        router.push(`/journal/${entry.id}`);
      } else {
        const res = await fetch(`/api/journal/${entryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Entry saved");
      }
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setLoading(false);
    }
  }, [title, content, mood, entryDate, tags, isNew, entryId, isLocked, router]);

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  async function handleDelete() {
    if (!entryId || !confirm("Delete this entry?")) return;
    try {
      await fetch(`/api/journal/${entryId}`, { method: "DELETE" });
      toast.success("Entry deleted");
      router.push("/journal");
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  function openPasswordDialog(mode: "encrypt" | "decrypt") {
    setPasswordMode(mode);
    setPassword("");
    setPasswordOpen(true);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      if (passwordMode === "encrypt") {
        const res = await fetch(`/api/journal/${entryId}/encrypt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (!res.ok) throw new Error("Encryption failed");

        setIsEncrypted(true);
        setIsLocked(true);
        toast.success("Entry encrypted");
      } else {
        const res = await fetch(`/api/journal/${entryId}/decrypt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) throw new Error("Incorrect password");
        const data = await res.json();

        setContent(data.content);
        setIsLocked(false);
        setIsEncrypted(false);
      }
      setPasswordOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-text-secondary">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Slim top bar */}
      <TooltipProvider delayDuration={300}>
        <div className="sticky top-0 z-10 flex items-center justify-between py-1.5 border-b border-border/40 bg-bg-primary/80 backdrop-blur-sm -mx-6 -mt-6 px-6 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/journal">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to journal</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1">
            {!isNew && !isLocked && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openPasswordDialog("encrypt")}
                    disabled={isEncrypted}
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Encrypt entry</TooltipContent>
              </Tooltip>
            )}
            {!isNew && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete entry</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-accent hover:text-accent"
                  onClick={handleSave}
                  disabled={loading || isLocked}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Save (Ctrl+S)
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

      {/* Writing area */}
      <div>
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            disabled={isLocked}
            className="journal-title-input"
          />

          {/* Properties */}
          <PropertiesPanel
            date={entryDate}
            onDateChange={setEntryDate}
            mood={mood}
            onMoodChange={setMood}
            tags={tags}
            onTagsChange={setTags}
            disabled={isLocked}
          />

          {/* Separator */}
          <div className="border-b border-border/30 mb-6" />

          {/* Editor or locked state */}
          {isLocked ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Lock className="h-10 w-10 text-text-secondary mb-4" />
              <h3 className="text-lg font-medium">This entry is encrypted</h3>
              <p className="text-sm text-text-secondary mb-4">
                Enter the password to view and edit content.
              </p>
              <Button onClick={() => openPasswordDialog("decrypt")}>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Entry
              </Button>
            </div>
          ) : (
            <JournalMarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing..."
            />
          )}
        </div>
      </div>

      {/* Password dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {passwordMode === "encrypt" ? "Encrypt Entry" : "Unlock Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entry-password">Password</Label>
              <Input
                id="entry-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {passwordMode === "encrypt" && (
                <p className="text-xs text-text-secondary">
                  Make sure you remember this password. There is no way to
                  recover it.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {passwordMode === "encrypt" ? "Encrypt" : "Unlock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
