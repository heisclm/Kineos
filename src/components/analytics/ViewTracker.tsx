"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/features/analytics/analytics.actions";

export function ViewTracker({ id, type }: { id: string; type: "movie" | "series" }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      incrementViewCount(id, type);
      tracked.current = true;
    }
  }, [id, type]);

  return null;
}
