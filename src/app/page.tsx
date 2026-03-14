import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-page p-6 text-text-primary">
      <Link
        href="/components"
        className="rounded-md border border-border-primary px-4 py-2 text-sm transition-colors hover:border-border-secondary hover:bg-bg-surface"
      >
        Open Components Gallery
      </Link>
    </main>
  );
}
