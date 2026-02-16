import { EntryEditor } from "@/components/journal/EntryEditor";

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntryEditor entryId={parseInt(id)} />;
}
