import { desc, eq } from "drizzle-orm";
import {
  DESTINATION_GITHUB,
  getDestinationConnection,
  getEventSlug,
  getGithubLabel,
  getGithubRepo,
} from "@/lib/config";
import { animals, boothSettings, type AnimalStatus } from "./schema";
import { getDb } from "./index";

export async function ensureBoothSettings() {
  const db = getDb();
  const eventSlug = getEventSlug();
  const existing = await db
    .select()
    .from(boothSettings)
    .where(eq(boothSettings.eventSlug, eventSlug))
    .limit(1);

  if (existing[0]) {
    if (existing[0].destinationName !== DESTINATION_GITHUB) {
      const [updated] = await db
        .update(boothSettings)
        .set({
          destinationName: DESTINATION_GITHUB,
          destinationConnection:
            existing[0].destinationConnection || getDestinationConnection(),
          updatedAt: new Date(),
        })
        .where(eq(boothSettings.eventSlug, eventSlug))
        .returning();
      return updated;
    }
    return existing[0];
  }

  const [created] = await db
    .insert(boothSettings)
    .values({
      eventSlug,
      destinationName: DESTINATION_GITHUB,
      destinationConnection: getDestinationConnection(),
      githubRepo: getGithubRepo() || null,
      githubLabel: getGithubLabel(),
    })
    .returning();

  return created;
}

export async function updateBoothSettings(
  values: Partial<typeof boothSettings.$inferInsert>,
) {
  const db = getDb();
  const eventSlug = getEventSlug();
  await ensureBoothSettings();
  const [updated] = await db
    .update(boothSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(boothSettings.eventSlug, eventSlug))
    .returning();
  return updated;
}

export async function listAnimals() {
  const db = getDb();
  return db
    .select()
    .from(animals)
    .where(eq(animals.eventSlug, getEventSlug()))
    .orderBy(desc(animals.createdAt));
}

export async function countAnimals() {
  const rows = await listAnimals();
  return rows.length;
}

export async function getAnimal(id: string) {
  const db = getDb();
  const rows = await db.select().from(animals).where(eq(animals.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createAnimal(values: {
  handle?: string | null;
  imageUrl?: string | null;
  imageBlobPathname?: string | null;
}) {
  const db = getDb();
  const [created] = await db
    .insert(animals)
    .values({
      eventSlug: getEventSlug(),
      handle: values.handle ?? null,
      imageUrl: values.imageUrl ?? null,
      imageBlobPathname: values.imageBlobPathname ?? null,
      status: "queued",
    })
    .returning();
  return created;
}

export async function updateAnimal(
  id: string,
  values: {
    videoUrl?: string | null;
    videoBlobPathname?: string | null;
    imageUrl?: string | null;
    imageBlobPathname?: string | null;
    status?: AnimalStatus;
    issueUrl?: string | null;
    errorMessage?: string | null;
  },
) {
  const db = getDb();
  const [updated] = await db
    .update(animals)
    .set(values)
    .where(eq(animals.id, id))
    .returning();
  return updated;
}

export async function wipeEventAnimals() {
  const db = getDb();
  const eventSlug = getEventSlug();
  const rows = await db
    .select()
    .from(animals)
    .where(eq(animals.eventSlug, eventSlug));
  await db.delete(animals).where(eq(animals.eventSlug, eventSlug));
  return rows;
}
