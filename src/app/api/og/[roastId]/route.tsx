import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "@takumi-rs/image-response";
import { getRoastById } from "@/db/queries/roasts";
import { OgImage } from "@/lib/og/og-image";

export const runtime = "nodejs";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Load fonts once at module init — Node.js module cache prevents re-reads
const fontsDir = path.join(process.cwd(), "src/assets/fonts");
const regularFont = fs.readFileSync(
  path.join(fontsDir, "JetBrainsMono-Regular.ttf"),
);
const boldFont = fs.readFileSync(path.join(fontsDir, "JetBrainsMono-Bold.ttf"));
const extraBoldFont = fs.readFileSync(
  path.join(fontsDir, "JetBrainsMono-ExtraBold.ttf"),
);

const fonts = [
  { name: "JetBrains Mono", data: regularFont, weight: 400 as const },
  { name: "JetBrains Mono", data: boldFont, weight: 700 as const },
  { name: "JetBrains Mono", data: extraBoldFont, weight: 800 as const },
];

type RouteParams = { params: Promise<{ roastId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { roastId } = await params;

  if (!uuidPattern.test(roastId)) {
    return new Response("Invalid roast ID", { status: 400 });
  }

  const roast = await getRoastById(roastId);

  if (!roast || roast.status !== "completed" || !roast.verdict) {
    return new Response("Roast not found", { status: 404 });
  }

  const score = Number(roast.score ?? 0);
  const lineCount = roast.sourceCode.split(/\r?\n/).length;
  const summaryQuote = roast.summaryQuote ?? "No summary available.";

  return new ImageResponse(
    <OgImage
      score={score}
      verdict={roast.verdict}
      language={roast.language}
      lineCount={lineCount}
      summaryQuote={summaryQuote}
    />,
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
