# OG Image Generation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate dynamic OpenGraph images for roast result pages so shared links on social platforms show a rich visual preview with score, verdict, and summary quote.

**Architecture:** A dedicated GET route handler at `/api/og/[roastId]` fetches roast data from the DB and renders it to a 1200×630 PNG using Takumi (`@takumi-rs/image-response`). The roast page adds `generateMetadata` to inject OG/Twitter meta tags pointing to this image URL. A shared `getBaseUrl()` utility provides the absolute base URL for server-side code.

**Tech Stack:** Next.js 16 App Router, Takumi (`@takumi-rs/image-response`), JetBrains Mono (bundled `.ttf` files), React JSX (inline styles, no Tailwind), Drizzle ORM, TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-17-og-image-generation-design.md`

---

## Chunk 1: Foundation

### Task 1: Install Takumi and add `serverExternalPackages`

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install the Takumi package**

```bash
npm install @takumi-rs/image-response
```

Expected: Package added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Add `serverExternalPackages` to Next.js config**

Open `next.config.ts`. The current content is:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: { ... },
};

export default nextConfig;
```

Add `serverExternalPackages` to the existing `nextConfig` object:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@takumi-rs/core"],
  cacheComponents: true,
  cacheLife: {
    hours: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify the build still compiles**

```bash
npm run build
```

Expected: Build succeeds. No new errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "feat: install takumi and configure serverExternalPackages"
```

---

### Task 2: Bundle JetBrains Mono font files

**Files:**
- Create: `src/assets/fonts/JetBrainsMono-Regular.ttf`
- Create: `src/assets/fonts/JetBrainsMono-Bold.ttf`
- Create: `src/assets/fonts/JetBrainsMono-ExtraBold.ttf`

JetBrains Mono is open-source (Apache 2.0). Download the `.ttf` files from the official GitHub release.

- [ ] **Step 1: Create the fonts directory and download the files**

```bash
mkdir -p src/assets/fonts
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf" -o src/assets/fonts/JetBrainsMono-Regular.ttf
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf" -o src/assets/fonts/JetBrainsMono-Bold.ttf
curl -L "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-ExtraBold.ttf" -o src/assets/fonts/JetBrainsMono-ExtraBold.ttf
```

- [ ] **Step 2: Verify the files downloaded correctly**

```bash
ls -lh src/assets/fonts/
```

Expected: Three `.ttf` files, each several hundred KB. If any file is tiny (< 10KB) it was likely a 404 redirect — re-check the URL.

- [ ] **Step 3: Commit**

```bash
git add src/assets/fonts/
git commit -m "feat: add JetBrains Mono font files for OG image generation"
```

---

### Task 3: Create the `getBaseUrl` utility

**Files:**
- Create: `src/lib/get-base-url.ts`

The existing `getBaseUrl` in `src/trpc/client.tsx` is module-private and lives in a `"use client"` file. This utility is a server-safe duplicate.

- [ ] **Step 1: Create `src/lib/get-base-url.ts`**

```ts
/**
 * Returns the absolute base URL for the current environment.
 * Safe to use in server components, route handlers, and generateMetadata.
 */
export const getBaseUrl = (): string => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};
```

Note: Unlike the client version, this never returns `""` — route handlers and `generateMetadata` always run server-side and always need an absolute URL.

- [ ] **Step 2: Run format/lint check**

```bash
npm run check
```

Expected: No errors on the new file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/get-base-url.ts
git commit -m "feat: add server-safe getBaseUrl utility"
```

---

### Task 4: Create the verdict color mapping utility

**Files:**
- Create: `src/lib/og/og-colors.ts`

- [ ] **Step 1: Create `src/lib/og/og-colors.ts`**

```ts
/**
 * Returns the hex color for a given roast verdict.
 * Used in the OG image to color the score, verdict dot, and verdict text.
 */
export const getVerdictColor = (verdict: string | null): string => {
  switch (verdict) {
    case "needs_serious_help":
      return "#EF4444"; // red
    case "needs_work":
    case "not_great":
      return "#F59E0B"; // amber
    case "decent":
      return "#10B981"; // green
    case "clean":
      return "#06B6D4"; // cyan
    default:
      return "#6B7280"; // neutral gray for null/unknown
  }
};
```

- [ ] **Step 2: Run lint check**

```bash
npm run check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/og/og-colors.ts
git commit -m "feat: add verdict color mapping utility for OG images"
```

---

### Task 5: Create the `<OgImage>` JSX component

**Files:**
- Create: `src/lib/og/og-image.tsx`

This is a pure JSX component with inline styles. It must not use Tailwind, CSS modules, or any import that is not compatible with Takumi's rendering engine (no hooks, no browser APIs). All styles are inline objects.

**Critical note:** Takumi renders JSX like Satori — it supports a subset of CSS via inline `style` props. Use `display: "flex"` for layout. Do not use `display: "grid"`, `position: "absolute"` on flex children, or CSS shorthand for `border-radius` (use `borderRadius`).

- [ ] **Step 1: Create `src/lib/og/og-image.tsx`**

```tsx
import { getVerdictColor } from "@/lib/og/og-colors";

export interface OgImageProps {
  score: number;
  verdict: string | null;
  language: string;
  lineCount: number;
  summaryQuote: string;
}

const QUOTE_MAX_LENGTH = 120;

const truncateQuote = (quote: string): string => {
  if (quote.length <= QUOTE_MAX_LENGTH) return quote;
  return `${quote.slice(0, QUOTE_MAX_LENGTH)}...`;
};

export const OgImage = ({
  score,
  verdict,
  language,
  lineCount,
  summaryQuote,
}: OgImageProps) => {
  const accentColor = getVerdictColor(verdict);
  const displayQuote = `"${truncateQuote(summaryQuote)}"`;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px",
        gap: "28px",
        fontFamily: "JetBrains Mono",
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#10B981",
          }}
        >
          {">"}
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "#E5E5E5",
          }}
        >
          devroast
        </span>
      </div>

      {/* Score row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "160px",
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: "56px",
            fontWeight: 400,
            color: "#4B5563",
            lineHeight: 1,
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: accentColor,
          }}
        />
        <span
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: accentColor,
          }}
        >
          {verdict ?? "unknown"}
        </span>
      </div>

      {/* Lang info */}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: "#4B5563",
        }}
      >
        {`lang: ${language} · ${lineCount} lines`}
      </span>

      {/* Roast quote */}
      <div
        style={{
          display: "flex",
          fontSize: "22px",
          fontWeight: 400,
          color: "#E5E5E5",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: "1072px",
        }}
      >
        {displayQuote}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run lint check**

```bash
npm run check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/og/og-image.tsx
git commit -m "feat: add OgImage JSX component for OG image rendering"
```

---

## Chunk 2: Route Handler & Metadata

### Task 6: Create the OG image route handler

**Files:**
- Create: `src/app/api/og/[roastId]/route.tsx`

This is a Next.js App Router route handler. It imports Takumi's `ImageResponse`, reads font files from disk, and renders the `<OgImage>` component.

**How font loading works:** `fs.readFileSync` at module scope reads the `.ttf` files once — Node.js caches the module, so fonts are only read from disk on the first cold start. The `path.join(process.cwd(), ...)` pattern is required because Next.js changes `__dirname` in production; `process.cwd()` reliably points to the project root.

- [ ] **Step 1: Create `src/app/api/og/[roastId]/route.tsx`**

```tsx
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "@takumi-rs/image-response";
import { OgImage } from "@/lib/og/og-image";
import { getRoastById } from "@/db/queries/roasts";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Load fonts once at module init — Node.js module cache prevents re-reads
const fontsDir = path.join(process.cwd(), "src/assets/fonts");
const regularFont = fs.readFileSync(
  path.join(fontsDir, "JetBrainsMono-Regular.ttf"),
);
const boldFont = fs.readFileSync(
  path.join(fontsDir, "JetBrainsMono-Bold.ttf"),
);
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
```

- [ ] **Step 2: Run lint check**

```bash
npm run check
```

Expected: No errors. If `@takumi-rs/image-response` types complain about JSX, verify `tsconfig.json` has `"jsx": "react-jsx"` — it already does.

- [ ] **Step 3: Build to verify no compilation errors**

```bash
npm run build
```

Expected: Build succeeds. Look specifically for errors in `src/app/api/og`.

- [ ] **Step 4: Manual smoke test (requires running dev server)**

Start the dev server in a separate terminal:

```bash
npm run dev
```

Then open a browser or use curl with a real roast UUID from your database:

```bash
curl -o /tmp/og-test.png "http://localhost:3000/api/og/<your-roast-uuid>"
```

Expected: A PNG file is written to `/tmp/og-test.png`. Open it — it should show the dark card with score, verdict, language, and quote.

Test edge cases:
- Invalid UUID: `curl -I "http://localhost:3000/api/og/not-a-uuid"` → should return `400`
- Non-existent UUID: `curl -I "http://localhost:3000/api/og/00000000-0000-0000-0000-000000000000"` → should return `404`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/og/
git commit -m "feat: add OG image route handler using Takumi"
```

---

### Task 7: Add `generateMetadata` to the roast result page

**Files:**
- Modify: `src/app/roast/[roastId]/page.tsx`
- Modify: `src/db/queries/roasts.ts` — wrap `getRoastById` with React `cache()`

**Why `cache()`:** Both `generateMetadata` and the page component call `getRoastById`. Without `cache()`, this results in two DB queries per page load. React's `cache()` deduplicates calls with the same arguments within a single request.

- [ ] **Step 1: Wrap `getRoastById` with React `cache()`**

Open `src/db/queries/roasts.ts`. Import `cache` from React and wrap the export.

**IMPORTANT:** Only `getRoastById` is modified in this file. All other exported functions (`getRoastBySubmissionId`, `getRoastIssues`, `getRoastDiffLines`, `getCompletedRoastBundleBySubmissionId`) must remain exactly as they are — do not touch them.

At the top of the file, add the import:

```ts
import { cache } from "react";
```

Then change the `getRoastById` export **only** from:

```ts
export const getRoastById = async (roastId: string) => {
  // ... existing implementation
};
```

To:

```ts
export const getRoastById = cache(async (roastId: string) => {
  // ... existing implementation — no changes to the body
});
```

The full updated export should look like:

```ts
export const getRoastById = cache(async (roastId: string) => {
  const db = getDb();

  const rows = await db
    .select({
      roastId: roasts.id,
      submissionId: submissions.id,
      sourceCode: submissions.sourceCode,
      language: submissions.language,
      roastMode: submissions.roastMode,
      status: roasts.status,
      score: roasts.score,
      verdict: roasts.verdict,
      summaryQuote: roasts.summaryQuote,
      analysisSummary: roasts.analysisSummary,
      errorMessage: roasts.errorMessage,
      completedAt: roasts.completedAt,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .where(eq(roasts.id, roastId))
    .limit(1);

  return rows[0] ?? null;
});
```

- [ ] **Step 2: Add `generateMetadata` to the roast page**

Open `src/app/roast/[roastId]/page.tsx`. Add the following imports at the top (alongside existing imports):

```ts
import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/get-base-url";
```

Then add the `generateMetadata` function **before** the `RoastResultPage` component (before the `export default async function` line):

```ts
export async function generateMetadata({
  params,
}: RoastResultPageProps): Promise<Metadata> {
  const { roastId } = await params;

  if (!uuidPattern.test(roastId)) return {};

  const roast = await getRoastById(roastId);

  if (!roast || roast.status !== "completed") return {};

  const score = Number(roast.score ?? 0);
  const title = `DevRoast: ${score}/10 — ${roast.verdict}`;
  const description = roast.summaryQuote ?? "Code has been roasted.";
  const ogImageUrl = `${getBaseUrl()}/api/og/${roastId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
```

- [ ] **Step 3: Run lint check**

```bash
npm run check
```

Expected: No errors.

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: Build succeeds. `generateMetadata` will appear in the route output for `/roast/[roastId]`.

- [ ] **Step 5: Verify meta tags render (manual)**

With the dev server running, open a roast page in the browser. View page source (Ctrl+U / Cmd+U). Search for `og:image` — you should see:

```html
<meta property="og:image" content="http://localhost:3000/api/og/<roastId>" />
<meta name="twitter:card" content="summary_large_image" />
<meta property="og:title" content="DevRoast: 3.5/10 — needs_serious_help" />
```

- [ ] **Step 6: Commit**

```bash
git add src/db/queries/roasts.ts src/app/roast/[roastId]/page.tsx
git commit -m "feat: add generateMetadata with OG image tags to roast result page"
```

---

## Chunk 3: Verification & Cleanup

### Task 8: Final build and quality check

- [ ] **Step 1: Run the full quality check**

```bash
npm run check
```

Expected: No errors or warnings across the entire codebase.

- [ ] **Step 2: Run a clean production build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors, no missing modules, no warnings about the OG route.

- [ ] **Step 3: Test the OG image end-to-end**

With the dev server running (`npm run dev`):

1. Get a valid `roastId` from your database (or create a new roast via the UI)
2. Visit `http://localhost:3000/api/og/<roastId>` directly in the browser
3. Verify the image renders with correct score, verdict color, language info, and quote
4. Use [opengraph.xyz](https://www.opengraph.xyz) or a similar tool to preview how the link will appear on social platforms — enter `http://localhost:3000/roast/<roastId>` (requires a publicly accessible URL for external tools; use ngrok or similar for local testing)

- [ ] **Step 4: Commit any remaining cleanup**

```bash
git add -A
git status
# Only commit if there are unstaged changes from the above steps
git commit -m "chore: og image generation complete"
```
