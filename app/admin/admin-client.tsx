"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminProps = {
  eventName: string;
  eventSlug: string;
  operatorName: string;
  destinationName: string;
  destinationConnection: string;
  githubRepo: string | null;
  connected: boolean;
  wallCount: number;
  headerImageUrl: string | null;
  lastResetAt: string | null;
};

export default function AdminClient(props: AdminProps) {
  const [headerImageUrl, setHeaderImageUrl] = useState(props.headerImageUrl);
  const [wallCount, setWallCount] = useState(props.wallCount);
  const [lastResetAt, setLastResetAt] = useState(props.lastResetAt);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"header" | "revert" | "wipe" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const headerMode = headerImageUrl ? "custom" : "default";
  const connectHref = `/auth/connect?connection=${encodeURIComponent(props.destinationConnection)}&returnTo=/admin`;

  const lastResetLabel = useMemo(() => {
    if (!lastResetAt) return "never";
    return new Date(lastResetAt).toLocaleString();
  }, [lastResetAt]);

  async function uploadHeader(file: File) {
    setBusy("header");
    setMessage(null);
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/admin/header", { method: "POST", body: formData });
    const data = (await response.json().catch(() => ({}))) as {
      headerImageUrl?: string;
      error?: string;
    };
    setBusy(null);
    if (!response.ok) {
      setMessage(data.error ?? "Header upload failed.");
      return;
    }
    setHeaderImageUrl(data.headerImageUrl ?? null);
  }

  async function revertHeader() {
    setBusy("revert");
    setMessage(null);
    const response = await fetch("/api/admin/header", { method: "DELETE" });
    setBusy(null);
    if (!response.ok) {
      setMessage("Could not revert header.");
      return;
    }
    setHeaderImageUrl(null);
  }

  async function wipeWall() {
    setBusy("wipe");
    setMessage(null);
    const response = await fetch("/api/admin/wipe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      deletedAnimals?: number;
      lastResetAt?: string;
      error?: string;
    };
    setBusy(null);
    if (!response.ok) {
      setMessage(data.error ?? "Wipe failed.");
      return;
    }
    setWallCount(0);
    setLastResetAt(data.lastResetAt ?? new Date().toISOString());
    setConfirm("");
    setMessage(
      `Cleared ${data.deletedAnimals ?? 0} animals. GitHub stays connected.`,
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p
            className="text-2xl tracking-wide"
            style={{ fontFamily: "var(--font-bangers)", color: "var(--hot-pink)" }}
          >
            {props.eventName} · Floor
          </p>
          <p className="text-sm text-muted-foreground">{props.operatorName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/wall" className="text-sm text-[var(--neon-cyan)]">
            Wall
          </Link>
          <a href="/auth/logout" className="text-sm text-muted-foreground">
            Logout
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-3 px-5 py-4 sm:grid-cols-4">
        <Strip label="Destination" value={props.destinationName} />
        <Strip label="On wall" value={String(wallCount)} />
        <Strip label="Header" value={headerMode} />
        <Strip label="Last reset" value={lastResetLabel} />
      </div>

      {message && (
        <p className="mx-auto max-w-5xl px-5 text-sm text-[var(--neon-cyan)]">{message}</p>
      )}

      <main className="mx-auto grid max-w-5xl gap-5 px-5 pb-16">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Destination</CardTitle>
              <Badge variant={props.connected ? "default" : "outline"}>
                {props.connected ? "Connected" : "Not connected"}
              </Badge>
            </div>
            <CardDescription>
              Runtime connection name: <code>{props.destinationConnection}</code>.
              v1 posts GitHub issues as you via Auth0 Token Vault. Attendees never connect GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              GitHub repo: {props.githubRepo || "set GITHUB_ISSUE_REPO"}
            </p>
            <a href={connectHref} className="btn-booth w-fit !text-lg">
              {props.connected ? "Reconnect GitHub" : "Connect GitHub"}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Look</CardTitle>
            <CardDescription>Drop a header image. Live preview updates immediately.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 text-center">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadHeader(file);
                }}
              />
              <span className="text-lg font-semibold">
                {busy === "header" ? "Uploading…" : "Drop or tap an image"}
              </span>
              <span className="mt-2 text-sm text-muted-foreground">
                Stored in Blob under this event&apos;s look prefix.
              </span>
            </label>
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Preview · {headerMode}
              </p>
              <div className="overflow-hidden rounded-2xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headerImageUrl || "/header-default.svg"}
                  alt="Header preview"
                  className="h-40 w-full object-cover"
                />
              </div>
              {headerImageUrl && (
                <Button
                  variant="outline"
                  className="mt-3 min-h-12"
                  disabled={busy === "revert"}
                  onClick={() => void revertHeader()}
                >
                  Revert to default
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Floor</CardTitle>
            <CardDescription>
              {wallCount} on the wall for <code>{props.eventSlug}</code>. Wipe deletes this
              event&apos;s Neon animal rows and `events/{props.eventSlug}/animals/` blobs only.
              Auth0 users and the GitHub connection stay.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--gold)]">
              <AlertTriangle className="size-4" />
              Type CLEAR to enable the danger action.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="clear">Confirm</Label>
                <Input
                  id="clear"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="CLEAR"
                  className="min-h-12"
                />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="min-h-12"
                    disabled={confirm !== "CLEAR" || busy === "wipe"}
                  >
                    Clear the wall
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear this event&apos;s wall?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Animals and their blobs go away. Token Vault / GitHub stay connected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep them</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void wipeWall()}>
                      Wipe now
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Strip({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-booth px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
