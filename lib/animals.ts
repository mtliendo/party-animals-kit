import type { Animal, AnimalStatus } from "@/lib/db/schema";

export type PublicAnimal = {
  id: string;
  handle: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  status: AnimalStatus;
  issueUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export function toPublicAnimal(animal: Animal): PublicAnimal {
  return {
    id: animal.id,
    handle: animal.handle,
    imageUrl: animal.imageUrl,
    videoUrl: animal.videoUrl,
    status: animal.status as AnimalStatus,
    issueUrl: animal.issueUrl,
    errorMessage: animal.errorMessage,
    createdAt:
      animal.createdAt instanceof Date
        ? animal.createdAt.toISOString()
        : String(animal.createdAt),
  };
}

export function isPendingStatus(
  status: AnimalStatus,
  animal?: Pick<PublicAnimal, "errorMessage" | "issueUrl">,
) {
  if (
    status === "queued" ||
    status === "generating_video" ||
    status === "posting"
  ) {
    return true;
  }
  // `ready` is terminal only after GitHub is skipped or otherwise settled.
  // A bare ready (video saved, post not finished) must keep polling.
  if (status === "ready") {
    return !animal?.errorMessage && !animal?.issueUrl;
  }
  return false;
}

export function statusLabel(status: AnimalStatus) {
  switch (status) {
    case "queued":
      return "Queued";
    case "generating_video":
      return "Animating";
    case "ready":
      return "On the wall";
    case "posting":
      return "Posting to GitHub";
    case "posted":
      return "Posted to GitHub";
    case "video_failed":
      return "Video failed";
    case "post_failed":
      return "GitHub failed";
    default:
      return status;
  }
}
