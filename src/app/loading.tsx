import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const SkeletonBar = ({ className }: { className: string }) => {
  return (
    <div className={cn("animate-pulse rounded bg-bg-elevated", className)} />
  );
};

export default function HomeLoading() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-0 pt-20 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <SkeletonBar className="h-10 w-[28rem]" />
          <SkeletonBar className="h-4 w-[34rem]" />
        </section>

        <Panel className="p-0">
          <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
            <SkeletonBar className="h-6 w-32" />
            <SkeletonBar className="h-7 w-24" />
          </div>

          <div className="space-y-3 px-5 py-4">
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-[94%]" />
            <SkeletonBar className="h-4 w-[88%]" />
            <SkeletonBar className="h-4 w-[80%]" />
            <SkeletonBar className="h-4 w-[92%]" />
            <SkeletonBar className="h-4 w-[86%]" />
          </div>

          <div className="flex items-center justify-between border-t border-border-primary px-5 py-3">
            <SkeletonBar className="h-4 w-36" />
            <SkeletonBar className="h-8 w-36" />
          </div>
        </Panel>

        <section className="flex items-center justify-center gap-6 py-1">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-3 w-3 rounded-full" />
          <SkeletonBar className="h-3 w-24" />
        </section>

        <section className="h-10" />

        <section className="flex flex-col gap-5 pb-14">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBar className="h-8 w-56" />
            <SkeletonBar className="h-8 w-28" />
          </div>

          <SkeletonBar className="h-4 w-80" />

          <Panel spacing="sm" className="p-0">
            <div className="flex items-center border-b border-border-primary bg-bg-elevated px-5 py-3">
              <SkeletonBar className="h-3 w-10" />
              <SkeletonBar className="ml-6 h-3 w-10" />
              <SkeletonBar className="ml-6 h-3 w-32" />
              <SkeletonBar className="ml-auto h-3 w-16" />
            </div>

            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center gap-6 border-b border-border-primary px-5 py-3"
              >
                <SkeletonBar className="h-3 w-10" />
                <SkeletonBar className="h-3 w-10" />
                <SkeletonBar className="h-3 flex-1" />
                <SkeletonBar className="h-3 w-16" />
              </div>
            ))}
          </Panel>
        </section>
      </div>
    </main>
  );
}
