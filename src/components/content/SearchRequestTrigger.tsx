"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestModal } from "./RequestModal";

interface SearchRequestTriggerProps {
  initialQuery?: string;
}

export function SearchRequestTrigger({ initialQuery = "" }: SearchRequestTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mt-6 flex flex-col items-center">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full px-6 py-2.5 bg-primary text-primary-foreground font-semibold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Request "{initialQuery || "This Title"}"
        </Button>
        <span className="text-xs text-muted mt-2">
          We add requested movies and series within 24-48 hours.
        </span>
      </div>

      <RequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultTitle={initialQuery}
      />
    </>
  );
}
