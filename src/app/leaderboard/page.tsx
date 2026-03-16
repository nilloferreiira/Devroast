import { CodeBlockDisplay } from "@/components/ui/code-block";
import { Panel } from "@/components/ui/panel";

export const dynamic = "force-dynamic";

type LeaderboardEntry = {
  rank: string;
  score: string;
  views: string;
  code: string;
  lang: "javascript" | "typescript" | "python";
};

const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: "#1",
    score: "2.2",
    views: "3.1k views",
    code: `const greet=(name)=>name?name.toUpperCase():""\nconsole.log(greet())\n// forgot null handling`,
    lang: "javascript",
  },
  {
    rank: "#2",
    score: "2.6",
    views: "5.6k views",
    code: `if (a = true) { return true; }\nif (b == false) { return false; }\nelse { return null; }`,
    lang: "typescript",
  },
  {
    rank: "#3",
    score: "2.1",
    views: "7.3k views",
    code: `temp = value + value * value\nfor i in range(9999):\n    temp += i`,
    lang: "python",
  },
  {
    rank: "#4",
    score: "2.8",
    views: "6.0k views",
    code: `let n = 10;\nwhile (n >= 0) n--;\nsetInterval(() => n++, 10)`,
    lang: "javascript",
  },
  {
    rank: "#5",
    score: "2.0",
    views: "9.3k views",
    code: `const store = {};\nstore['data'] = eval(input);\nreturn store;`,
    lang: "javascript",
  },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-14 pt-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10">
        <section className="flex w-full flex-col gap-4">
          <h1 className="inline-flex items-center gap-3 font-mono text-[28px] font-bold leading-none md:text-[32px]">
            <span className="text-accent-green">&gt;</span>
            <span>shame_leaderboard</span>
          </h1>

          <p className="font-mono text-sm text-text-secondary">
            {"// the most roasted code on the internet"}
          </p>

          <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </section>

        <section className="flex w-full flex-col gap-5">
          {leaderboardEntries.map((entry) => (
            <Panel key={entry.rank} className="overflow-hidden p-0">
              <div className="flex h-12 items-center justify-between border-b border-border-primary px-5 font-mono text-xs">
                <div className="flex items-center gap-6">
                  <span className="text-text-tertiary">{entry.rank}</span>
                  <span className="font-bold text-accent-red">
                    {entry.score}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-text-tertiary">
                  <span>{entry.lang}</span>
                  <span>{entry.views}</span>
                </div>
              </div>

              <CodeBlockDisplay
                code={entry.code}
                lang={entry.lang}
                withLineNumbers
                className="border-0 bg-bg-surface px-5 py-4"
              />
            </Panel>
          ))}
        </section>
      </div>
    </main>
  );
}
