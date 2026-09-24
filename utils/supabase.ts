import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() || '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Keep module initialization safe in web deployments even if Cloudflare has not
// embedded the build-time EXPO_PUBLIC_* variables yet. The app can render its
// auth screen and report a configuration/network error instead of becoming a
// completely blank page.
const clientUrl = supabaseUrl || 'https://placeholder.invalid';
const clientKey = supabaseKey || 'bloodconnect-web-config-missing';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
