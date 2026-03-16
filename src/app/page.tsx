import { cacheLife } from "next/cache";
import { EditorPanel } from "@/components/home/editor-panel";
import { HomeMetrics } from "@/components/home/home-metrics";
import { HomeShameLeaderboard } from "@/components/home/home-shame-leaderboard";
import { highlightCode } from "@/lib/highlight-code";

const editorCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }

  return total;
}`;

const MAX_CODE_SNIPPET_CHARS = 2000;

export default async function HomePage() {
  "use cache";
  cacheLife("hours");

  const initialTokenLines = await highlightCode(editorCode, "javascript");

  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-0 pt-20 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h1 className="inline-flex items-center gap-3 font-mono text-4xl font-bold">
            <span className="text-accent-green">$</span>
            <span>paste your code. get roasted.</span>
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </section>

        <EditorPanel
          initialCode={editorCode}
          initialTokenLines={initialTokenLines}
          maxChars={MAX_CODE_SNIPPET_CHARS}
        />

        <HomeMetrics />

        <section className="h-10" />

        <HomeShameLeaderboard />
      </div>
    </main>
  );
}
