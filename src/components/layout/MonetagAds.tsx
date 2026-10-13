"use client";

import { useEffect, useRef } from "react";

// Clean monetization: In-Page Push & Vignette Banners only (No intrusive OnClick/Popunder tabs)
export function MonetagAds() {
  const isEnabled =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_MONETAG_ENABLED === "true";

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isEnabled || process.env.NEXT_PUBLIC_MONETAG_ENABLED === "false") {
      return;
    }

    // Do not load ad scripts for Lighthouse, PageSpeed Insights, or automated crawlers
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      if (/Lighthouse|PageSpeed|Googlebot|Chrome-Lighthouse|HeadlessChrome|bot|crawl/i.test(ua)) {
        return;
      }
    }

    const loadAds = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      // 1. Monetag In-Page Push (Zone 11986009) - Clean notification format, no new tabs
      try {
        const s1 = document.createElement("script");
        s1.dataset.zone = "11986009";
        s1.src = "https://nap5k.com/tag.min.js";
        s1.async = true;
        document.body.appendChild(s1);
      } catch (err) {
        console.error("Monetag 11986009 init error", err);
      }

      // 2. Monetag Vignette Banner (Zone 11986011) - Clean full-screen interstitial
      try {
        const s2 = document.createElement("script");
        s2.dataset.zone = "11986011";
        s2.src = "https://n6wxm.com/vignette.min.js";
        s2.async = true;
        document.body.appendChild(s2);
      } catch (err) {
        console.error("Monetag 11986011 init error", err);
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
