"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SecretAdminTrigger() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Reset click count if they don't click fast enough (1.5 seconds)
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => {
    // Trigger on 5 fast clicks
    if (clickCount >= 5) {
      router.push("/admin");
      setClickCount(0);
    }
  }, [clickCount, router]);

  useEffect(() => {
    // Alternatively, keyboard shortcut: Ctrl + Shift + K (or Cmd + Shift + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'k' || e.code === 'KeyK')) {
        e.preventDefault();
        router.push("/admin");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div 
      className="absolute inset-0 cursor-default"
      onClick={() => setClickCount(p => p + 1)}
      aria-hidden="true"
    />
  );
}
