import { EntryEditor } from "@/components/journal/EntryEditor";

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <EntryEditor entryId={parseInt(id)} />
    </div>
  );
}
