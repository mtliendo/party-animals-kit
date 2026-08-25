import Link from "next/link";
import { getEventName } from "@/lib/config";

export function SiteNav({ current }: { current?: "home" | "draw" | "wall" }) {
  return (
    <nav className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
      <Link
        href="/"
        className="text-2xl tracking-wider"
        style={{ fontFamily: "var(--font-bangers)", color: "var(--hot-pink)" }}
      >
        {getEventName().toUpperCase()}
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <NavLink href="/" active={current === "home"}>
          Home
        </NavLink>
        <NavLink href="/wall" active={current === "wall"}>
          Wall
        </NavLink>
        <Link href="/draw" className="btn-booth !min-h-12 !px-5 !text-lg">
          Draw
        </Link>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="min-h-12 px-3 inline-flex items-center text-sm font-semibold"
      style={{ color: active ? "var(--neon-cyan)" : "var(--text-muted)" }}
    >
      {children}
    </Link>
  );
}
