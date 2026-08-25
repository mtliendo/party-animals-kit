import { animalVideoPath } from "@/lib/config";
import { getDestination } from "@/lib/destinations";
import { getAnimal, updateAnimal } from "@/lib/db/queries";
import { uploadPublicBlob } from "@/lib/blob";
import { getOperatorConnectionToken } from "@/lib/token-vault";
import { generateAnimalVideo } from "@/lib/video";

export async function processAnimal(animalId: string) {
  const animal = await getAnimal(animalId);
  if (!animal?.imageUrl) {
    throw new Error("Animal drawing is missing");
  }

  await updateAnimal(animalId, {
    status: "generating_video",
    errorMessage: null,
  });

  let videoUrl = animal.videoUrl;
  let videoBlobPathname = animal.videoBlobPathname;

  if (!videoUrl) {
    try {
      const generated = await generateAnimalVideo(animal.imageUrl);
      const pathname = animalVideoPath(animalId);
      const stored = await uploadPublicBlob(
        pathname,
        generated.bytes,
        generated.mediaType,
      );
      videoUrl = stored.url;
      videoBlobPathname = pathname;
      await updateAnimal(animalId, {
        videoUrl,
        videoBlobPathname,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Video generation failed";
      await updateAnimal(animalId, {
        status: "video_failed",
        errorMessage: message,
      });
      throw error;
    }
  }

  const destination = await getDestination();
  const connectionToken = await getOperatorConnectionToken(destination.connectionName);

  if (!connectionToken) {
    await updateAnimal(animalId, {
      status: "ready",
      errorMessage: "GitHub is not connected on the operator Token Vault account.",
    });
    return;
  }

  await updateAnimal(animalId, { status: "posting", errorMessage: null });

  try {
    const published = await destination.publish({
      token: connectionToken.token,
      handle: animal.handle,
      imageUrl: animal.imageUrl,
      videoUrl,
    });
    await updateAnimal(animalId, {
      status: "posted",
      issueUrl: published.url,
      errorMessage: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub post failed";
    await updateAnimal(animalId, {
      status: "post_failed",
      errorMessage: message,
    });
    throw error;
  }
}
