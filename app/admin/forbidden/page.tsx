export default function AdminForbiddenPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1
        className="text-5xl"
        style={{ fontFamily: "var(--font-bangers)", color: "var(--hot-pink)" }}
      >
        Not this login
      </h1>
      <p className="max-w-md text-muted-foreground">
        This booth only lets the operator open /admin. Attendees do not log in.
      </p>
      <a href="/auth/logout" className="btn-ghost-booth">
        Logout
      </a>
    </main>
  );
}
