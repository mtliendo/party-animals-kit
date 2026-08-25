"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteNav } from "@/components/site-nav";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawAPI = any;

const ExcalidrawKiosk = dynamic(
  () => import("@/components/excalidraw-kiosk").then((mod) => mod.ExcalidrawKiosk),
  { ssr: false, loading: () => <CanvasLoader /> },
);

type SubmitState =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function DrawClient() {
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<SubmitState>({ type: "idle" });
  const onApi = useCallback((next: ExcalidrawAPI) => setApi(next), []);

  async function handleSubmit() {
    if (!api) {
      setState({ type: "error", message: "Canvas is still loading." });
      return;
    }

    const elements = api.getSceneElements();
    const hasContent = elements.some((el: { isDeleted: boolean }) => !el.isDeleted);
    if (!hasContent) {
      setState({ type: "error", message: "Draw something first." });
      return;
    }

    setState({ type: "submitting" });

    try {
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements,
        appState: api.getAppState(),
        files: api.getFiles(),
        mimeType: "image/png",
        quality: 0.92,
      });

      const formData = new FormData();
      formData.append("image", blob, "animal.png");
      if (handle.trim()) {
        formData.append("handle", handle.trim());
      }

      const response = await fetch("/api/animals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Submission failed.");
      }

      setState({ type: "success" });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  if (state.type === "success") {
    return (
      <YoureIn
        handle={handle}
        onDrawAnother={() => {
          setHandle("");
          setState({ type: "idle" });
        }}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden">
      <SiteNav current="draw" />
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 relative min-h-[50vh]">
          <ExcalidrawKiosk onApi={onApi} />
        </div>
        <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-[var(--bg-card)] p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h1
              className="text-4xl leading-none tracking-wide mb-2"
              style={{ fontFamily: "var(--font-bangers)" }}
            >
              <span className="gradient-text">DRAW</span>
              <br />
              <span style={{ color: "var(--neon-cyan)" }}>YOUR ANIMAL</span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No login. Sketch it, hit submit, then watch the wall.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="handle">Handle (optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="handle"
                value={handle}
                onChange={(event) => {
                  setHandle(event.target.value.replace(/^@/, ""));
                  if (state.type === "error") setState({ type: "idle" });
                }}
                placeholder="yourname"
                className="pl-7 min-h-12"
                disabled={state.type === "submitting"}
              />
            </div>
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{
              background: "rgba(176,38,255,0.08)",
              border: "1px solid rgba(176,38,255,0.25)",
            }}
          >
            Big shapes. Bold lines. Thumb-friendly strokes are already on.
          </div>

          {state.type === "error" && (
            <p className="text-sm text-[var(--hot-pink)]">{state.message}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={state.type === "submitting"}
            className="btn-booth w-full border-0 mt-auto"
          >
            {state.type === "submitting" ? "Sending…" : "Unleash it"}
          </Button>
        </aside>
      </main>
    </div>
  );
}

function YoureIn({
  handle,
  onDrawAnother,
}: {
  handle: string;
  onDrawAnother: () => void;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteNav current="draw" />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
        <p className="text-7xl">🐾</p>
        <h1
          className="text-6xl tracking-wide"
          style={{ fontFamily: "var(--font-bangers)" }}
        >
          <span className="gradient-text glow-pink">YOU&apos;RE IN</span>
        </h1>
        <p className="max-w-md text-lg" style={{ color: "var(--text-muted)" }}>
          {handle ? `@${handle}, your` : "Your"} animal is on the wall. Video and
          GitHub status update there — this screen does not pretend they are done.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/wall" className="btn-booth">
            See the wall
          </Link>
          <button type="button" className="btn-ghost-booth" onClick={onDrawAnother}>
            Draw another
          </button>
        </div>
      </main>
    </div>
  );
}

function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e2e]">
      <p style={{ color: "var(--text-muted)" }}>Loading canvas…</p>
    </div>
  );
}
