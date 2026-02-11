import { HabitDetail } from "@/components/habits/HabitDetail";

export default async function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <HabitDetail habitId={parseInt(id)} />
    </div>
  );
}
