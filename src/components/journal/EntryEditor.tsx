"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { MoodPicker } from "./MoodPicker";
import { TagInput } from "@/components/shared/TagInput";
import { toISODate } from "@/lib/utils/dates";
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
  const [frontMatter, setFrontMatter] = useState<Record<string, string>>({});
  const [frontMatterText, setFrontMatterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  const fetchEntry = useCallback(async () => {
    if (!entryId) return;
    try {
      const res = await fetch(`/api/journal/${entryId}`);
      if (!res.ok) throw new Error();
      const entry: JournalEntryWithTags = await res.json();
      setTitle(entry.title ?? "");
      setContent(entry.content ?? "");
      setMood(entry.mood);
      setTags(entry.tags);
      setEntryDate(entry.entryDate.split(" ")[0]);
      if (entry.frontMatter && typeof entry.frontMatter === "object") {
        const fm = entry.frontMatter as Record<string, string>;
        setFrontMatter(fm);
        setFrontMatterText(
          Object.entries(fm)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n"),
        );
      }
      setLoaded(true);
    } catch {
      toast.error("Failed to load entry");
      router.push("/journal");
    }
  }, [entryId, router]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  function parseFrontMatterText(text: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of text.split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        result[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      }
    }
    return result;
  }

  async function handleSave() {
    setLoading(true);
    try {
      const fm = parseFrontMatterText(frontMatterText);
      const body = {
        title: title || undefined,
        content,
        mood,
        entryDate: entryDate + " 00:00:00",
        tags,
        frontMatter: Object.keys(fm).length > 0 ? fm : undefined,
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
  }

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

  if (!loaded) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/journal">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </Button>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-1.5" />
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-1.5 block">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div>
            <Label htmlFor="date" className="mb-1.5 block">Date</Label>
            <Input
              id="date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">Mood</Label>
          <MoodPicker value={mood} onChange={setMood} />
        </div>

        <div>
          <Label className="mb-1.5 block">Tags</Label>
          <TagInput tags={tags} onChange={setTags} placeholder="Add tags..." />
        </div>

        <div>
          <Label className="mb-1.5 block">Content</Label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Write your thoughts..."
          />
        </div>

        <Card>
          <CardContent className="pt-4">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Front Matter (key: value, one per line)
            </Label>
            <textarea
              value={frontMatterText}
              onChange={(e) => setFrontMatterText(e.target.value)}
              placeholder="location: Home&#10;weather: Sunny"
              rows={3}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
