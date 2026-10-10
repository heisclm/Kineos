"use client";

import { useEffect } from "react";

// Frequency Capping: Only allow 1 popunder/onclick ad every 3 hours per user
// This ensures ads aren't annoying while still monetizing active visitors
const ONCLICK_COOLDOWN_HOURS = 3;
const COOLDOWN_MS = ONCLICK_COOLDOWN_HOURS * 60 * 60 * 1000;
const ONCLICK_STORAGE_KEY = "kineos_onclick_last_triggered";

export function MonetagAds() {
  const isEnabled =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_MONETAG_ENABLED === "true";

  useEffect(() => {
    if (!isEnabled || process.env.NEXT_PUBLIC_MONETAG_ENABLED === "false") {
      return;
    }

    try {
      const lastTriggered = localStorage.getItem(ONCLICK_STORAGE_KEY);
      const now = Date.now();

      // If user already experienced a popunder within the cooldown window, DO NOT inject the script
      if (lastTriggered && now - Number(lastTriggered) < COOLDOWN_MS) {
        return;
      }

      // User is eligible for an Onclick ad: Dynamically inject Zone 12000343
      const script = document.createElement("script");
      script.dataset.zone = "12000343";
      script.src = "https://al5sm.com/tag.min.js";
      script.async = true;
      document.body.appendChild(script);

      // Listen for the user's first click to record the timestamp and start the cooldown
      const handleUserClick = () => {
        try {
          localStorage.setItem(ONCLICK_STORAGE_KEY, Date.now().toString());
        } catch {
          // Ignore private mode storage restrictions
        }
        window.removeEventListener("click", handleUserClick, true);
      };

      window.addEventListener("click", handleUserClick, true);

      return () => {
        window.removeEventListener("click", handleUserClick, true);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } catch {
      // Graceful fallback if localStorage is unavailable
    }
  }, [isEnabled]);

  if (!isEnabled || process.env.NEXT_PUBLIC_MONETAG_ENABLED === "false") {
    return null;
  }

  return (
    <>
      {/* Monetag Multi-Tag / In-Page Push (Zone 11986009) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='11986009',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
      {/* Monetag Vignette / Interstitial (Zone 11986011) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='11986011',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
        }}
      />
    </>
  );
}

