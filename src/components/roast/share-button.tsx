"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  roastId: string;
};

export const ShareButton = ({ roastId }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/api/og/${roastId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleShare}>
      {copied ? "$ url_copied!" : "$ share_roast"}
    </Button>
  );
};
