import { getDestinationConnection, getEventName, getEventSlug } from "@/lib/config";
import { countAnimals, ensureBoothSettings } from "@/lib/db/queries";
import { requireOperator } from "@/lib/operator";
import { isDestinationConnected } from "@/lib/token-vault";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireOperator();
  const settings = await ensureBoothSettings();
  const wallCount = await countAnimals();
  const connected = await isDestinationConnected(settings.destinationConnection);

  return (
    <AdminClient
      eventName={getEventName()}
      eventSlug={getEventSlug()}
      operatorName={session.user.name ?? session.user.email ?? "Operator"}
      destinationName={settings.destinationName}
      destinationConnection={settings.destinationConnection || getDestinationConnection()}
      githubRepo={settings.githubRepo}
      connected={connected}
      wallCount={wallCount}
      headerImageUrl={settings.headerImageUrl}
      lastResetAt={settings.lastResetAt ? settings.lastResetAt.toISOString() : null}
    />
  );
}
