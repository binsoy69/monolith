import { VaultLayout } from "@/components/vault/VaultLayout";
import { VaultPasswordGate } from "@/components/vault/VaultPasswordGate";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const [hash] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "vault_password_hash"));

  const enabled = !!hash;

  return (
    <div className="h-full">
      <VaultPasswordGate enabled={enabled}>
        <VaultLayout />
      </VaultPasswordGate>
    </div>
  );
}
