"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useCreateRoastAction = () => {
  const trpc = useTRPC();

  return useMutation(trpc.roast.create.mutationOptions());
};
