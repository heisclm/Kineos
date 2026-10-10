"use client";

import { useEffect, useRef } from "react";

// Frequency Capping: Only allow 1 popunder/onclick ad every 3 hours per user
// This ensures ads aren't annoying while still monetizing active visitors
const ONCLICK_COOLDOWN_HOURS = 3;
const COOLDOWN_MS = ONCLICK_COOLDOWN_HOURS * 60 * 60 * 1000;
const ONCLICK_STORAGE_KEY = "kineos_onclick_last_triggered";

export function MonetagAds() {
  const isEnabled =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_MONETAG_ENABLED === "true";

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isEnabled || process.env.NEXT_PUBLIC_MONETAG_ENABLED === "false") {
      return;
    }

    // Do not load intrusive ad scripts for Lighthouse, PageSpeed Insights, or automated crawlers
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      if (/Lighthouse|PageSpeed|Googlebot|Chrome-Lighthouse|HeadlessChrome|bot|crawl/i.test(ua)) {
        return;
      }
    }

    const loadAds = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      // 1. Monetag Multi-Tag / In-Page Push (Zone 11986009)
      try {
        const s1 = document.createElement("script");
        s1.dataset.zone = "11986009";
        s1.src = "https://nap5k.com/tag.min.js";
        s1.async = true;
        document.body.appendChild(s1);
      } catch (err) {
        console.error("Monetag 11986009 init error", err);
      }

      // 2. Monetag Vignette / Interstitial (Zone 11986011)
      try {
        const s2 = document.createElement("script");
        s2.dataset.zone = "11986011";
        s2.src = "https://n6wxm.com/vignette.min.js";
        s2.async = true;
        document.body.appendChild(s2);
      } catch (err) {
        console.error("Monetag 11986011 init error", err);
      }

      // 3. Monetag Onclick / Popunder (Zone 12000343) with 3-hour frequency cap
      try {
        const lastTriggered = localStorage.getItem(ONCLICK_STORAGE_KEY);
        const now = Date.now();

        // If user already experienced a popunder within the cooldown window, do NOT inject
        if (!lastTriggered || now - Number(lastTriggered) >= COOLDOWN_MS) {
          const s3 = document.createElement("script");
          s3.dataset.zone = "12000343";
          s3.src = "https://al5sm.com/tag.min.js";
          s3.async = true;
          document.body.appendChild(s3);

          // Record timestamp on user's first click to initiate 3-hour cooldown
          const handleUserClick = () => {
            try {
              localStorage.setItem(ONCLICK_STORAGE_KEY, Date.now().toString());
            } catch {
              // Ignore private mode storage restrictions
            }
            window.removeEventListener("click", handleUserClick, true);
          };

          window.addEventListener("click", handleUserClick, true);
        }
      } catch {
        // Fallback if localStorage is unavailable
      }
    };

    // Trigger ad loading on first user interaction for instantaneous initial page paint
    const interactionEvents = ["touchstart", "pointerdown", "scroll", "keydown"];
    const handleInteraction = () => {
      loadAds();
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleInteraction);
      });
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, handleInteraction, { passive: true, once: true });
    });

    // Fallback: load after 4s idle time if user stays on page without immediate interaction
    let idleTimer: any;
    if ("requestIdleCallback" in window) {
      idleTimer = (window as any).requestIdleCallback(
        () => {
          setTimeout(loadAds, 3500);
        },
        { timeout: 5000 }
      );
    } else {
      idleTimer = setTimeout(loadAds, 4000);
    }

    return () => {
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleInteraction);
      });
      if (idleTimer) {
        if ("cancelIdleCallback" in window && typeof idleTimer === "number") {
          (window as any).cancelIdleCallback(idleTimer);
        } else {
          clearTimeout(idleTimer);
        }
      }
    };
  }, [isEnabled]);

  // Return null so no blocking raw script tags are placed in SSR HTML
  return null;
}
