import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

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
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export function setupRealtimeWithPollingFallback({
  channel,
  onRefresh,
  pollIntervalMs,
  isMounted,
}: {
  channel: RealtimeChannel;
  onRefresh: () => void | Promise<void>;
  pollIntervalMs: number;
  isMounted: () => boolean;
}): () => void {
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let isRealtimeConnected = false;
  let wasConnectedBefore = false;

  const startPolling = () => {
    if (pollInterval || !isMounted() || AppState.currentState !== 'active') return;
    pollInterval = setInterval(() => {
      if (isMounted() && AppState.currentState === 'active') {
        void onRefresh();
      }
    }, pollIntervalMs);
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  // If realtime hasn't connected within 4 seconds, start temporary fallback polling
  const connectTimeout = setTimeout(() => {
    if (isMounted() && !isRealtimeConnected) {
      startPolling();
    }
  }, 4000);

  channel.subscribe((status) => {
    if (!isMounted()) return;
    if (status === 'SUBSCRIBED') {
      isRealtimeConnected = true;
      stopPolling();
      if (wasConnectedBefore) {
        // Reconnected: refresh latest data once
        void onRefresh();
      }
      wasConnectedBefore = true;
    } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
      isRealtimeConnected = false;
      startPolling();
    }
  });

  const appStateSub = AppState.addEventListener('change', (nextAppState) => {
    if (!isMounted()) return;
    if (nextAppState === 'active') {
      void onRefresh();
      if (!isRealtimeConnected) {
        startPolling();
      }
    } else {
      stopPolling();
    }
  });

  return () => {
    clearTimeout(connectTimeout);
    stopPolling();
    appStateSub.remove();
    void supabase.removeChannel(channel);
  };
}

