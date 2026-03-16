import { Suspense } from "react";
import { HomeShameLeaderboardContent } from "@/components/home/home-shame-leaderboard-content";
import { HomeShameLeaderboardSkeleton } from "@/components/home/home-shame-leaderboard-skeleton";

export const HomeShameLeaderboard = () => {
  return (
    <Suspense fallback={<HomeShameLeaderboardSkeleton />}>
      <HomeShameLeaderboardContent />
    </Suspense>
  );
};
