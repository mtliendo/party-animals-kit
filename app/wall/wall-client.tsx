"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteNav } from "@/components/site-nav";
import {
  isPendingStatus,
  statusLabel,
  type PublicAnimal,
} from "@/lib/animals";

export default function WallClient({
  initialAnimals,
}: {
  initialAnimals: PublicAnimal[];
}) {
  const [animals, setAnimals] = useState(initialAnimals);

  useEffect(() => {
    const pending = animals.some((animal) => isPendingStatus(animal.status));
    if (!pending) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/animals");
        if (!response.ok) return;
        const next = (await response.json()) as PublicAnimal[];
        setAnimals(next);
      } catch {
        // Keep the last good wall.
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [animals]);

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteNav current="wall" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
        <div className="mb-8 text-center">
          <h1
            className="text-6xl tracking-wide"
            style={{ fontFamily: "var(--font-bangers)" }}
          >
            <span className="gradient-text glow-pink">THE WALL</span>
          </h1>
          <p className="mt-3 text-lg" style={{ color: "var(--text-muted)" }}>
            Pipeline status lives here. Polling while anything is still in flight.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <Badge variant="outline" className="min-h-9 px-4 text-sm">
            {animals.length} on the wall
          </Badge>
          <Link href="/draw" className="btn-booth !min-h-12 !text-lg">
            Draw yours
          </Link>
        </div>

        {animals.length === 0 ? (
          <div className="card-booth flex flex-col items-center gap-4 px-6 py-20 text-center">
            <p className="text-7xl">🐾</p>
            <p style={{ color: "var(--text-muted)" }}>The wall is empty. Be first.</p>
            <Link href="/draw" className="btn-booth">
              Draw
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {animals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AnimalCard({ animal }: { animal: PublicAnimal }) {
  return (
    <article className="card-booth overflow-hidden">
      <div className="relative aspect-square bg-[var(--bg-card-hover)]">
        {animal.videoUrl ? (
          <video
            src={animal.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : animal.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={animal.imageUrl}
            alt={animal.handle ? `${animal.handle}'s party animal` : "Party animal"}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
        <Badge className="absolute right-3 top-3">{statusLabel(animal.status)}</Badge>
      </div>
      <div className="flex items-center justify-between gap-2 p-4">
        <span className="font-semibold text-[var(--hot-pink)]">
          {animal.handle ? `@${animal.handle}` : "Guest"}
        </span>
        {animal.issueUrl ? (
          <a
            href={animal.issueUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--neon-cyan)]"
          >
            GitHub
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">
            {animal.errorMessage ?? statusLabel(animal.status)}
          </span>
        )}
      </div>
    </article>
  );
}
