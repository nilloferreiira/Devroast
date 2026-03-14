import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <Link
        href="/components"
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm transition-colors hover:border-zinc-500 hover:bg-zinc-900"
      >
        Open Components Gallery
      </Link>
    </main>
  );
}
