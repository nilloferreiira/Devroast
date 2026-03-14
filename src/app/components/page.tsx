import { Button } from "@/components/ui/button";

const variants = ["submit", "secondary", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            UI Kit
          </p>
          <h1 className="text-3xl font-semibold text-zinc-50">Components</h1>
          <p className="text-sm text-zinc-400">
            Visual gallery for reusable components.
          </p>
        </header>

        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-medium text-zinc-100">Button Variants</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {variants.map((variant) => (
              <div
                key={variant}
                className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <p className="mb-4 text-xs uppercase tracking-wide text-zinc-400">
                  {variant}
                </p>
                <Button variant={variant}>$ roast_my_code</Button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-medium text-zinc-100">Button Sizes</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {sizes.map((size) => (
              <div
                key={size}
                className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <p className="mb-4 text-xs uppercase tracking-wide text-zinc-400">
                  {size}
                </p>
                <Button size={size}>$ roast_my_code</Button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-medium text-zinc-100">Button States</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <Button>$ roast_my_code</Button>
            <Button disabled>$ disabled</Button>
          </div>
        </section>
      </div>
    </main>
  );
}
