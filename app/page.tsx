import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { getEventName } from "@/lib/config";
import { ensureBoothSettings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let headerImageUrl: string | null = null;
  try {
    const settings = await ensureBoothSettings();
    headerImageUrl = settings.headerImageUrl;
  } catch {
    headerImageUrl = null;
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteNav current="home" />
      <main className="flex-1">
        <section className="px-5 pt-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-[var(--bg-card)]">
            {headerImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerImageUrl}
                alt={`${getEventName()} booth header`}
                className="w-full max-h-72 object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/header-default.svg"
                alt="Focus Otter Party Animals"
                className="w-full max-h-72 object-cover"
              />
            )}
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, rgba(176,38,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,45,120,0.12) 0%, transparent 50%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl">
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.25em]"
              style={{ color: "var(--hot-pink)" }}
            >
              Focus Otter booth kit
            </p>
            <h1
              className="mb-6 text-6xl leading-none tracking-wide sm:text-8xl"
              style={{ fontFamily: "var(--font-bangers)" }}
            >
              <span className="gradient-text glow-pink">{getEventName()}</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg" style={{ color: "var(--text-muted)" }}>
              Draw a creature. AI turns it into a video. It lands on the wall.
              The booth operator posts it to GitHub through Auth0 Token Vault —
              attendees never log in.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/draw" className="btn-booth">
                Start drawing
              </Link>
              <Link href="/wall" className="btn-ghost-booth">
                See the wall
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-20 sm:grid-cols-3">
          {[
            ["01", "Draw", "Public kiosk. Optional handle. Big strokes."],
            ["02", "Animate", "Vercel AI SDK generates the video for real."],
            ["03", "Post", "Operator GitHub via Token Vault. Status lives on the wall."],
          ].map(([step, title, copy]) => (
            <div key={step} className="card-booth p-6 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--hot-pink)]">
                Step {step}
              </p>
              <h2
                className="mt-3 text-3xl"
                style={{ fontFamily: "var(--font-bangers)", color: "var(--neon-cyan)" }}
              >
                {title}
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {copy}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
