'use client'
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  // We define the logic
  const initPostHog = () => {
    const EU_COUNTRY_CODES = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'NO', 'IS', 'LI'
    ];

    const countryMeta = document.querySelector('meta[name="geo-country"]');
    const countryCode = countryMeta?.getAttribute('content')?.toUpperCase() || 'NAN';
    const isEUUser = EU_COUNTRY_CODES.includes(countryCode);

    if (process.env.NEXT_PUBLIC_ENV==="production" && !isEUUser) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        session_recording: { maskAllInputs: true },
      });
      console.log("PostHog initialized for:", countryCode);
    }
  };

  // If the DOM is already ready, run it.
  // Otherwise, wait for 'DOMContentLoaded'
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostHog);
  } else {
    initPostHog();
  }
}

