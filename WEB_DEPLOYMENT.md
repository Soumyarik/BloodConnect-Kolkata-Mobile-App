# Build and host the web app

This Expo project can be exported as a static website and served by any static web host.

## Build

Install the project dependencies, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`, then run:

```sh
npm run build:web
```

The finished website is written to `web-build/`. Upload the **contents** of that folder to your hosting provider's static site output directory. Rebuild after changing either Supabase setting; these values are embedded in the browser bundle at build time.

The browser key must be a Supabase publishable key (or the legacy `anon` key). Never use a Supabase `service_role` or secret key in this app. Browser keys are visible to visitors, so database access must remain protected by Row Level Security. The checked-in migrations enable RLS on the app's public tables.

## Supabase Auth setup

After choosing the public domain, set that HTTPS URL as the Supabase project's **Site URL** in Authentication → URL Configuration. Add the production URL and any preview or local development URLs you use to **Redirect URLs**. Email confirmation links use the Site URL by default.

## Browser features

Location autofill needs the visitor's permission and a secure context (HTTPS, or localhost during development). Expo push notifications are native-only; the web app still includes its in-app notifications screen.
