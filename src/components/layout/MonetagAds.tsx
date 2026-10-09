export function MonetagAds() {
  const isEnabled = process.env.NEXT_PUBLIC_MONETAG_ENABLED === "true";

  if (!isEnabled) {
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
