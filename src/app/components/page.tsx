import { Button } from "@/components/ui/button";

const variants = ["submit", "secondary", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page px-6 py-10 text-text-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-green">
            UI Kit
          </p>
          <h1 className="text-3xl font-semibold">Components</h1>
          <p className="text-sm text-text-secondary">
            Visual gallery for reusable components.
          </p>
        </header>

        <section className="flex flex-col gap-5">
          <h2 className="font-mono text-lg font-medium">Button Variants</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {variants.map((variant) => (
              <div
                key={variant}
                className="rounded-xl border border-border-primary bg-bg-surface p-4"
              >
                <p className="mb-4 font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {variant}
                </p>
                <Button variant={variant}>$ roast_my_code</Button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-mono text-lg font-medium">Button Sizes</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {sizes.map((size) => (
              <div
                key={size}
                className="rounded-xl border border-border-primary bg-bg-surface p-4"
              >
                <p className="mb-4 font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {size}
                </p>
                <Button size={size}>$ roast_my_code</Button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-mono text-lg font-medium">Button States</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-primary bg-bg-surface p-4">
            <Button>$ roast_my_code</Button>
            <Button disabled>$ disabled</Button>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-mono text-lg font-medium">Color Tokens</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border-primary bg-bg-page p-4">
              <p className="font-mono text-xs uppercase text-text-tertiary">
                bg-page
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-surface p-4">
              <p className="font-mono text-xs uppercase text-text-tertiary">
                bg-surface
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-elevated p-4">
              <p className="font-mono text-xs uppercase text-text-tertiary">
                bg-elevated
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-input p-4">
              <p className="font-mono text-xs uppercase text-text-tertiary">
                bg-input
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border-primary bg-bg-surface p-4">
              <p className="font-mono text-xs uppercase text-text-primary">
                text-primary
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-surface p-4">
              <p className="font-mono text-xs uppercase text-text-secondary">
                text-secondary
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-surface p-4">
              <p className="font-mono text-xs uppercase text-text-tertiary">
                text-tertiary
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-bg-surface p-4">
              <p className="font-mono text-xs uppercase text-primary">
                primary / primary-foreground
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-green" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-green / green-primary
              </p>
            </div>
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-red" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-red / destructive
              </p>
            </div>
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-amber" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-amber
              </p>
            </div>
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-orange" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-orange
              </p>
            </div>
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-blue" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-blue
              </p>
            </div>
            <div className="rounded-xl border border-border-primary p-4">
              <div className="mb-2 h-8 rounded bg-accent-cyan" />
              <p className="font-mono text-xs uppercase text-text-secondary">
                accent-cyan
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border-primary bg-diff-added p-4">
              <p className="font-mono text-xs uppercase text-accent-green">
                diff-added
              </p>
            </div>
            <div className="rounded-xl border border-border-primary bg-diff-removed p-4">
              <p className="font-mono text-xs uppercase text-accent-red">
                diff-removed
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
