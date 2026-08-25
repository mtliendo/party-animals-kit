import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const animalStatuses = [
  "queued",
  "generating_video",
  "ready",
  "posting",
  "posted",
  "video_failed",
  "post_failed",
] as const;

export type AnimalStatus = (typeof animalStatuses)[number];

export const boothSettings = pgTable("booth_settings", {
  eventSlug: text("event_slug").primaryKey(),
  destinationName: text("destination_name").notNull().default("github"),
  destinationConnection: text("destination_connection").notNull().default("github"),
  githubRepo: text("github_repo"),
  githubLabel: text("github_label"),
  headerImageUrl: text("header_image_url"),
  headerBlobPathname: text("header_blob_pathname"),
  operatorSub: text("operator_sub"),
  operatorRefreshToken: text("operator_refresh_token"),
  lastResetAt: timestamp("last_reset_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const animals = pgTable("animals", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventSlug: text("event_slug").notNull(),
  handle: text("handle"),
  imageUrl: text("image_url"),
  imageBlobPathname: text("image_blob_pathname"),
  videoUrl: text("video_url"),
  videoBlobPathname: text("video_blob_pathname"),
  status: text("status").notNull().default("queued"),
  issueUrl: text("issue_url"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BoothSettings = typeof boothSettings.$inferSelect;
export type Animal = typeof animals.$inferSelect;
