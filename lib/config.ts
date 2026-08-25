export const DESTINATION_GITHUB = "github" as const;

export type DestinationName = typeof DESTINATION_GITHUB;

export function getEventSlug() {
  return process.env.BOOTH_EVENT_SLUG?.trim() || "booth";
}

export function getEventName() {
  return (
    process.env.NEXT_PUBLIC_BOOTH_EVENT_NAME?.trim() ||
    process.env.BOOTH_EVENT_NAME?.trim() ||
    "Party Animals"
  );
}

export function getAppBaseUrl() {
  return process.env.APP_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getGithubRepo() {
  return process.env.GITHUB_ISSUE_REPO?.trim() || "";
}

export function getGithubLabel() {
  return process.env.GITHUB_ISSUE_LABEL?.trim() || "party-animals";
}

export function getDestinationConnection() {
  return process.env.AUTH0_GITHUB_CONNECTION?.trim() || DESTINATION_GITHUB;
}

export function getVideoModel() {
  return process.env.VIDEO_MODEL?.trim() || "spacexai/grok-imagine-video";
}

export function getAllowedOperatorEmails() {
  return (process.env.ALLOWED_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function animalsBlobPrefix(eventSlug = getEventSlug()) {
  return `events/${eventSlug}/animals/`;
}

export function animalDrawingPath(animalId: string, eventSlug = getEventSlug()) {
  return `${animalsBlobPrefix(eventSlug)}${animalId}/drawing.png`;
}

export function animalVideoPath(animalId: string, eventSlug = getEventSlug()) {
  return `${animalsBlobPrefix(eventSlug)}${animalId}/video.mp4`;
}

export function headerBlobPath(eventSlug = getEventSlug()) {
  return `events/${eventSlug}/look/header`;
}
