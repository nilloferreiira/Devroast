import { randomUUID } from "node:crypto";
import { getDb, getPool } from "@/db";
import { roastDiffLines, roastIssues, roasts, submissions } from "@/db/schema";
import type { NewRoastDiffLine } from "@/db/schema/roast-diff-lines";
import type { NewRoastIssue } from "@/db/schema/roast-issues";
import type { NewRoast } from "@/db/schema/roasts";
import type { NewSubmission } from "@/db/schema/submissions";

const sampleCodes: Array<{
  code: string;
  language: NewSubmission["language"];
}> = [
  {
    code: "function calculateTotal(items) { var total = 0; for (let i = 0; i < items.length; i++) { total += items[i].price; } return total; }",
    language: "javascript",
  },
  {
    code: "if (user = null) { return false; }",
    language: "typescript",
  },
  {
    code: "while(true){ doWork(); }",
    language: "python",
  },
  {
    code: "const out = data.map((x) => x.id).filter(Boolean)",
    language: "javascript",
  },
  {
    code: '{ "name": "devroast", "version": 1 }',
    language: "json",
  },
  {
    code: "for i in range(0, len(items)):\n    total += items[i]",
    language: "python",
  },
  {
    code: 'echo "deploying" && rm -rf /tmp/build',
    language: "bash",
  },
  {
    code: "const [value, setValue] = useState<any>(null)",
    language: "tsx",
  },
  {
    code: "let count = 0; setInterval(() => count++, 1000)",
    language: "javascript",
  },
  {
    code: "const res = await fetch('/api'); const body = res.json();",
    language: "typescript",
  },
];

const toLineCount = (code: string) => code.split("\n").length;

const run = async () => {
  const db = getDb();

  await db.delete(roastDiffLines);
  await db.delete(roastIssues);
  await db.delete(roasts);
  await db.delete(submissions);

  const submissionValues: NewSubmission[] = sampleCodes.map((item, index) => ({
    id: randomUUID(),
    sourceCode: item.code,
    language: item.language,
    roastMode: index % 2 === 0 ? "roast" : "normal",
    lineCount: toLineCount(item.code),
  }));

  const insertedSubmissions = await db
    .insert(submissions)
    .values(submissionValues)
    .returning({ id: submissions.id });

  const roastValues: NewRoast[] = insertedSubmissions.map(
    (submission, index) => ({
      id: randomUUID(),
      submissionId: submission.id,
      status: "completed",
      score: (2.1 + index * 0.3).toFixed(1),
      verdict:
        index < 3
          ? "needs_serious_help"
          : index < 7
            ? "needs_work"
            : "not_great",
      summaryQuote: `Submission ${index + 1} needs better structure and safer defaults.`,
      analysisSummary:
        "Code has reliability, readability, and maintainability concerns.",
      completedAt: new Date(Date.now() - index * 60_000),
    }),
  );

  const insertedRoasts = await db
    .insert(roasts)
    .values(roastValues)
    .returning({ id: roasts.id });

  const issueValues: NewRoastIssue[] = insertedRoasts.flatMap((roast) => [
    {
      id: randomUUID(),
      roastId: roast.id,
      severity: "critical",
      title: "Unsafe control flow",
      description:
        "Control flow can enter unexpected states due to missing guards.",
      displayOrder: 1,
    },
    {
      id: randomUUID(),
      roastId: roast.id,
      severity: "warning",
      title: "Readability is low",
      description: "Naming and structure make maintenance harder than needed.",
      displayOrder: 2,
    },
  ]);

  await db.insert(roastIssues).values(issueValues);

  const diffLineValues: NewRoastDiffLine[] = insertedRoasts.flatMap((roast) => [
    {
      id: randomUUID(),
      roastId: roast.id,
      lineType: "removed",
      content: "var total = 0;",
      displayOrder: 1,
    },
    {
      id: randomUUID(),
      roastId: roast.id,
      lineType: "added",
      content: "const total = 0;",
      displayOrder: 2,
    },
    {
      id: randomUUID(),
      roastId: roast.id,
      lineType: "context",
      content: "for (let i = 0; i < items.length; i++) {",
      displayOrder: 3,
    },
  ]);

  await db.insert(roastDiffLines).values(diffLineValues);

  await getPool().end();
};

run().catch(async (error) => {
  console.error("Seed failed", error);
  await getPool().end();
  process.exit(1);
});
