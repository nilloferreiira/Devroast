import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

const SkeletonBar = ({ className }: { className: string }) => {
  return (
    <div className={cn("animate-pulse rounded bg-bg-elevated", className)} />
  );
};

export default function LeaderboardLoading() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-bg-page px-6 pb-14 pt-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="flex w-full flex-col gap-4">
          <SkeletonBar className="h-9 w-72" />
          <SkeletonBar className="h-4 w-72" />
          <SkeletonBar className="h-3 w-28" />
        </section>

        <section className="flex w-full flex-col gap-5">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Panel key={item} className="overflow-hidden p-0">
              <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
                <div className="flex items-center gap-6">
                  <SkeletonBar className="h-3 w-8" />
                  <SkeletonBar className="h-3 w-8" />
                </div>

                <div className="flex items-center gap-3">
                  <SkeletonBar className="h-3 w-16" />
                  <SkeletonBar className="h-3 w-8" />
                </div>
              </div>

              <div className="space-y-2 px-5 py-4">
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-[92%]" />
                <SkeletonBar className="h-3 w-[84%]" />
              </div>
            </Panel>
          ))}

          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-border-primary bg-bg-surface px-4 py-3">
            <SkeletonBar className="h-3 w-14" />
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-3 w-10" />
          </div>
        </section>
      </div>
    </main>
  );
}
