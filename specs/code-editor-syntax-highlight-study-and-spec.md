# Code Editor Syntax Highlight Study + Implementation Spec

## Goal

Implement a code editor experience on the Home page that:

1. Highlights syntax for pasted/typed code.
2. Auto-detects language from code content.
3. Lets users override language manually via a selector.
4. Fits current DevRoast architecture and conventions.

---

## What I analyzed

### Current project constraints (important)

- `shiki` is already installed (`package.json`).
- Existing highlighter exists in `src/components/ui/code-block.tsx` using `codeToTokens` from Shiki.
- Project guidance says syntax highlighter components using Shiki must stay server-side (`AGENTS.md` and `src/components/ui/AGENTS.md`).
- UI stack and patterns:
  - Next.js App Router
  - Tailwind + `tailwind-variants`
  - `@base-ui/react` for interactions
  - Named exports

### Ray.so references

From Ray.so source:

- Uses **Shiki** for highlighted rendering quality.
- Uses **highlight.js `highlightAuto`** for auto language detection.
- Supports manual language selection and lazy language loading.

This is a proven model for your requested behavior.

---

## Library options evaluated

## Option A (recommended): Shiki + highlight.js hybrid

- **Highlight rendering:** Shiki
- **Auto-detect:** highlight.js (`highlightAuto`)
- **Manual select:** controlled language dropdown

### Why this is best for DevRoast

- You already use Shiki and have a token-based renderer.
- Gives high-quality TextMate-like highlighting (better for image/share-ready code style).
- `highlight.js` auto-detect is mature, simple, and used by Ray.so.
- Can keep Shiki server-side to respect project rules.

### Tradeoffs

- Two libraries to maintain (Shiki + highlight.js).
- Need alias mapping between detector language keys and your supported language list.

---

## Option B: highlight.js only

- **Highlight rendering:** highlight.js
- **Auto-detect:** highlight.js

### Pros

- Simplest implementation.
- Single library for detect + render.
- Very broad language support.

### Cons

- Lower visual/token accuracy than Shiki for many languages/themes.
- Would move away from the current Shiki direction in your codebase.

---

## Option C: Full editor framework (CodeMirror 6 or Monaco)

- **Highlight + editing:** framework built-in
- **Detection:** custom or external

### Pros

- Strong editing capabilities (selections, history, extensions, IDE-like features).

### Cons

- Overkill for paste-and-roast flow.
- Higher bundle and complexity.
- Monaco mobile limitations and heavier integration.
- Requires bigger design/API decisions now.

Not recommended for current product stage.

---

## Recommendation

Adopt **Option A: Shiki + highlight.js hybrid**, inspired by Ray.so but adapted to DevRoast server-side Shiki rule.

---

## Proposed implementation architecture

## Data flow

1. User pastes/edits code in a client editor input.
2. If language mode is `auto`, run `highlight.js` auto-detection on client.
3. Resolve detected key through a local alias map to supported languages.
4. Render highlighted output via Shiki (server path), using:
   - detected language when mode is `auto`, or
   - selected language when mode is `manual`.
5. If Shiki language load fails, fallback to `plaintext`.

## Language mode model

- `languageMode`: `"auto" | "manual"`
- `manualLanguage`: `CodeLanguage | null`
- `detectedLanguage`: `CodeLanguage | "plaintext"`
- `effectiveLanguage`:
  - `detectedLanguage` when mode is `auto`
  - `manualLanguage` when mode is `manual`

## UI behavior

- Add language control next to code block header/actions:
  - default state: `Auto (detected: <lang>)`
  - user can switch to explicit language
  - include quick "Back to auto" action
- Keep line numbers behavior unchanged.
- Show subtle fallback label when detection confidence is low or unknown:
  - `Auto: Plain Text`

---

## Technical spec details

## 1) Shared language registry

Create a central language registry for:

- Shiki language IDs you support.
- Selector labels.
- Aliases from detector keys (highlight.js output) to Shiki IDs.

Example alias cases to normalize:

- `js` -> `javascript`
- `ts` -> `typescript`
- `sh`/`shell` -> `bash`
- `py` -> `python`
- `c++` -> `cpp`

## 2) Detection service

- Add `detectLanguage(code: string): CodeLanguage | "plaintext"` helper.
- Use `highlightAuto(code, subset)` with a curated subset matching your supported languages.
- Keep subset small at first for accuracy + performance in your app context.

## 3) Highlight render path

Because of your Shiki server-side rule:

- Keep Shiki calls in server components/route handlers only.
- Client editor sends code + effective language to server highlight function.
- Server returns token lines (or highlighted HTML) for render.

Note: if you later decide to allow client-side Shiki for near-real-time typing, update team guideline first.

## 4) Fallback strategy

- Detection failed -> `plaintext`
- Unsupported detected language -> `plaintext`
- Shiki runtime error -> `plaintext` and non-blocking UI notice

## 5) Performance strategy

- Debounce highlight requests during typing (e.g. 150-300ms).
- Trigger immediately on paste.
- Cache by `{codeHash, language, theme}` for repeated renders.
- Optional: skip re-highlight for very short edits if no newline/token-structure changes.

## 6) Accessibility and UX

- Language selector keyboard accessible.
- Preserve focus and cursor position in editor.
- Avoid layout shift while highlight updates.
- Clear label for auto mode and current detected language.

---

## API / state contract (proposed)

## Client state

- `code: string`
- `languageMode: "auto" | "manual"`
- `manualLanguage: CodeLanguage | null`
- `detectedLanguage: CodeLanguage | "plaintext"`
- `effectiveLanguage: CodeLanguage | "plaintext"`

## Server highlight function input

- `code: string`
- `lang: CodeLanguage | "plaintext"`
- `theme: string` (optional, keep your current default)

## Server highlight function output

- Token lines structure compatible with current `CodeBlockDisplay` renderer, or
- Pre-rendered safe HTML string (if you choose HTML output path).

---

## Acceptance criteria

1. Pasting code applies syntax highlighting automatically.
2. Auto mode detects expected language for common samples (JS, TS, TSX, JSON, Bash, Python).
3. User can manually switch language and force re-highlight.
4. User can switch back to auto mode.
5. Unknown/ambiguous snippets degrade to plaintext without errors.
6. Highlight updates are responsive and do not block typing noticeably.
7. Implementation follows project patterns (named exports, UI conventions, Shiki server-side rule).

---

## Risks and mitigations

- **False detection:** use curated subset + alias map + easy manual override.
- **SSR/client complexity:** isolate detection helper and highlight service into small modules.
- **Performance on large pastes:** debounce + caching + optional max-size threshold.

---

## Build TODOs

- [ ] Create `spec` branch task list in project board/tracker.
- [ ] Add shared language registry (`id`, `label`, `detectorAliases`).
- [ ] Add language detection helper using `highlight.js`.
- [ ] Add auto/manual language state model in editor flow.
- [ ] Add language selector UI (including `Auto` option).
- [ ] Connect selector state to effective highlight language.
- [ ] Implement/extend server-side Shiki highlight endpoint/function.
- [ ] Wire client editor updates to server highlight path with debounce.
- [ ] Add fallback behavior for unknown/unsupported languages.
- [ ] Add UI feedback for `Auto: <detected>` and `Auto: Plain Text` fallback.
- [ ] Add tests for language detection alias mapping.
- [ ] Add tests for mode switching (auto <-> manual).
- [ ] Add tests for fallback behavior.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.

---

## Open questions for implementation kickoff

1. Which languages must be in v1 (beyond current `javascript`, `typescript`, `tsx`, `jsx`, `json`, `bash`)?
2. Should auto-detection run on every keystroke (debounced) or only on paste + explicit request?
3. Should detected/manual language be included in sharable URL state (if/when code sharing is added)?
4. Is theme switching for code highlighting part of this feature or out of scope for now?
