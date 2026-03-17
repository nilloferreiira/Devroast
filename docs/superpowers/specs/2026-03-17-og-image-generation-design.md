# OG Image Generation for Shareable Roast Links

## Purpose

Generate dynamic OpenGraph images for roast result pages (`/roast/[roastId]`) so that shared links on social platforms (X/Twitter, Discord, Slack, etc.) display a rich visual preview with the roast score, verdict, and summary quote.

## Scope

- Dynamic OG images for completed roast pages only
- No default/fallback OG image for homepage or other pages
- No share button UI (out of scope for this feature)

## Approach

Route handler at `/api/og/[roastId]` using Takumi (`@takumi-rs/image-response`) for JSX-to-image rendering. The roast page adds `generateMetadata` to wire up the OG tags pointing to this route.

### Why this approach

- Clean separation: image generation is isolated in its own route
- Easy to test: visit `/api/og/<roastId>` in the browser to see the image
- Cacheable via standard HTTP headers
- Follows Takumi's documented pattern exactly

Alternatives considered:
- **`opengraph-image.tsx` convention:** Auto-wires metadata but couples to Next.js magic URL generation, less documented with Takumi
- **Static generation at creation time:** Zero runtime cost but requires storage, harder to iterate on design, premature optimization

## Architecture

### File structure

```
src/
  app/
    api/og/[roastId]/route.tsx     # Route handler (GET)
    roast/[roastId]/page.tsx       # Add generateMetadata
  assets/fonts/
    JetBrainsMono-Regular.ttf
    JetBrainsMono-Bold.ttf
    JetBrainsMono-ExtraBold.ttf
  lib/
    og/og-image.tsx                # <OgImage> component (JSX)
    og/og-colors.ts                # Verdict color mapping utility
next.config.ts                     # Add serverExternalPackages
```

### Dependencies

- `@takumi-rs/image-response` — Takumi image generation library

### Next.js config change

Add `"@takumi-rs/core"` to `serverExternalPackages` so Next.js does not bundle the native binary:

```ts
// next.config.ts
export const config = {
  serverExternalPackages: ["@takumi-rs/core"],
};
```

## Route handler: `/api/og/[roastId]/route.tsx`

### Request flow

1. Validate `roastId` is a valid UUID (regex), return 400 if not
2. Fetch roast via `getRoastById(roastId)` (existing DB query)
3. Return 404 if roast not found or `status !== "completed"`
4. Render `<OgImage>` component with roast data
5. Return `new ImageResponse(jsx, { width: 1200, height: 630, fonts })`

### Caching

Set `Cache-Control: public, max-age=31536000, immutable` — roast data is immutable after completion, so the image can be cached indefinitely.

### Runtime

Node.js (default for Next.js route handlers). Takumi's native binary requires Node.js `require`, no Edge runtime.

## OG Image Component: `<OgImage>`

### Layout (1200 x 630, matching Pencil design frame `4J5QT`)

```
Container (1200x630, bg: #0A0A0A, flexbox column, centered, padding: 64px, gap: 28px)
├── Logo Row (flex row, gap: 8px, vertically centered)
│   ├── ">" text (JetBrains Mono, 24px, bold 700, color: #10B981)
│   └── "devroast" text (JetBrains Mono, 20px, medium 500, color: #E5E5E5)
├── Score Row (flex row, baseline-aligned, gap: 4px)
│   ├── "{score}" text (JetBrains Mono, 160px, weight 900, dynamic color)
│   └── "/10" text (JetBrains Mono, 56px, normal 400, color: #4B5563)
├── Verdict Row (flex row, gap: 8px, vertically centered)
│   ├── Dot (12x12 circle, dynamic color fill)
│   └── "{verdict}" text (JetBrains Mono, 20px, normal 400, dynamic color)
├── Lang Info text ("{language} · {lineCount} lines", JetBrains Mono, 16px, color: #4B5563)
└── Roast Quote text (JetBrains Mono, 22px, color: #E5E5E5, centered, line-height: 1.5)
```

### Props

```ts
interface OgImageProps {
  score: number;        // 0.0 - 10.0
  verdict: string;      // enum: needs_serious_help | needs_work | not_great | decent | clean
  language: string;     // e.g. "javascript"
  lineCount: number;    // computed from sourceCode
  summaryQuote: string; // AI-generated one-liner
}
```

### Dynamic color mapping

Score number, verdict dot, and verdict text all use the same dynamic color based on the verdict:

| Verdict | Color | Hex |
|---------|-------|-----|
| `needs_serious_help` | Red | `#EF4444` |
| `needs_work` | Amber | `#F59E0B` |
| `not_great` | Amber | `#F59E0B` |
| `decent` | Green | `#10B981` |
| `clean` | Cyan | `#06B6D4` |

This mapping lives in `src/lib/og/og-colors.ts` as a pure function, extracted for testability and potential reuse.

### Quote truncation

If `summaryQuote` exceeds 120 characters, truncate with `...` to prevent overflow at 22px within the available width (~1072px after padding).

## Metadata on roast page

Add `generateMetadata` to `src/app/roast/[roastId]/page.tsx`:

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roastId } = await params;
  const roast = await getRoastById(roastId);

  if (!roast || roast.status !== "completed") return {};

  const title = `DevRoast: ${roast.score}/10 — ${roast.verdict}`;
  const description = roast.summaryQuote;
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

Uses the existing `getBaseUrl()` pattern from `src/trpc/client.tsx` for absolute URL construction.

### Base URL resolution

Reuse the existing pattern:
- `process.env.VERCEL_URL` for Vercel deployments
- `http://localhost:3000` for local development

## Font loading

Bundle JetBrains Mono `.ttf` files in `src/assets/fonts/`. Load them in the route handler using `fs.readFile` and pass to `ImageResponse`:

```ts
const fonts = [
  { name: "JetBrains Mono", data: regularFont, weight: 400 as const },
  { name: "JetBrains Mono", data: boldFont, weight: 700 as const },
  { name: "JetBrains Mono", data: extraBoldFont, weight: 900 as const },
];
```

Font files are loaded once and cached in module scope (Node.js module caching handles this naturally).

## Design reference

The visual design is defined in the Pencil file `/home/danillo/Downloads/devroast-pencil.pen`, frame `4J5QT` ("Screen 4 - OG Image"). The implementation should match this design exactly.

### Color tokens (hardcoded in OG component, not CSS variables)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-page` | `#0A0A0A` | Background |
| `text-primary` | `#E5E5E5` | Logo text, quote |
| `text-tertiary` | `#4B5563` | "/10", lang info |
| `accent-green` | `#10B981` | Logo prompt ">" |
| `accent-red` | `#EF4444` | Critical verdict |
| `accent-amber` | `#F59E0B` | Warning verdict |
| `accent-cyan` | `#06B6D4` | Clean verdict |

## Error handling

- Invalid UUID format: return `Response` with status 400
- Roast not found or not completed: return `Response` with status 404
- Takumi rendering failure: let it propagate as 500 (unexpected, log for monitoring)

## Out of scope

- Share button / copy-to-clipboard UI
- Default OG image for homepage or other pages
- Image caching in CDN/blob storage (HTTP caching is sufficient)
- Analytics / tracking on OG image requests
