import { Panel } from "@/components/ui/panel";
import {
  SectionLabelPrefix,
  SectionLabelRoot,
  SectionLabelText,
} from "@/components/ui/section-label";
import { cn } from "@/lib/utils";

const SkeletonBar = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse rounded bg-bg-elevated", className)} />
  );
};

export const HomeShameLeaderboardSkeleton = () => {
  return (
    <section className="flex flex-col gap-5 pb-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabelRoot>
          <SectionLabelPrefix />
          <SectionLabelText>shame_leaderboard</SectionLabelText>
        </SectionLabelRoot>
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

      <div className="flex items-center justify-center py-4">
        <SkeletonBar className="h-6 w-72 rounded-full" />
      </div>
    </section>
  );
};
