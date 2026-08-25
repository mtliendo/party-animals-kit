import { requireOperatorApi } from "@/lib/operator";
import { wipeEventAnimalBlobs } from "@/lib/blob";
import { updateBoothSettings, wipeEventAnimals } from "@/lib/db/queries";

export async function POST(request: Request) {
  const { error } = await requireOperatorApi();
  if (error) return error;

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "CLEAR") {
    return Response.json(
      { error: "Type CLEAR to wipe this event's wall." },
      { status: 400 },
    );
  }

  const rows = await wipeEventAnimals();
  const deletedBlobs = await wipeEventAnimalBlobs();
  const settings = await updateBoothSettings({ lastResetAt: new Date() });

  return Response.json({
    deletedAnimals: rows.length,
    deletedBlobs,
    lastResetAt: settings.lastResetAt,
    destinationName: settings.destinationName,
    destinationConnection: settings.destinationConnection,
    githubStillConfigured: Boolean(settings.operatorSub || settings.operatorRefreshToken),
  });
}
