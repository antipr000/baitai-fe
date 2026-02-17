import posthog from 'posthog-js'

// Check if the user is in the EU based on the meta tag injected by layout
const EU_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'NO', 'IS', 'LI'
];

let isEUUser = false;
if (typeof document !== 'undefined') {
  const countryMeta = document.querySelector('meta[name="geo-country"]');
  const countryCode = countryMeta ? countryMeta.getAttribute('content') : 'NAN';
  isEUUser = EU_COUNTRY_CODES.includes(countryCode?.toUpperCase() || '');
}

if (process.env.NODE_ENV !== "development" && !isEUUser) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    session_recording: {
      maskAllInputs: true,
      // maskTextSelector: "*", // GDPR: Mask all text
    },
  });
}