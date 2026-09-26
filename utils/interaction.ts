import { Alert, Linking, Platform } from 'react-native';

export function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export async function openExternalUrl(url: string, action: string) {
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    showMessage('Unable to open link', `Unable to ${action}: ${error instanceof Error ? error.message : 'Please try again.'}`);
    return false;
  }
}

export async function openAppSettings() {
  if (Platform.OS === 'web') {
    showMessage('Location permissions', 'Manage this site’s location permission in your browser’s site settings, then reload BloodConnect.');
    return;
  }
  try {
    await Linking.openSettings();
  } catch (error) {
    showMessage('Unable to open settings', error instanceof Error ? error.message : 'Please open your device settings manually.');
  }
}

export function sanitizeUserErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error) return fallbackMessage;

  const rawMessage =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : '';

  if (!rawMessage) return fallbackMessage;

  const msg = rawMessage.trim();

  // Network / connectivity issues
  if (
    msg.includes('Network request failed') ||
    msg.includes('Failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('network error') ||
    msg.includes('NetworkError')
  ) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  // Session / auth issues
  if (
    msg.includes('JWT expired') ||
    msg.includes('invalid claim') ||
    msg.includes('Invalid Refresh Token') ||
    msg.includes('not authenticated') ||
    msg.includes('Session from session_id claim was not found')
  ) {
    return 'Your session has expired. Please log in again.';
  }

  // Postgres / PostgREST internal technical errors (PGRST, relation, syntax, column, constraint)
  if (
    msg.startsWith('PGRST') ||
    msg.includes('relation "') ||
    msg.includes('function ') ||
    msg.includes('syntax error') ||
    msg.includes('row-level security') ||
    msg.includes('violates foreign key') ||
    msg.includes('duplicate key value') ||
    msg.includes('schema "public"') ||
    msg.includes('JSON object requested')
  ) {
    return fallbackMessage;
  }

  // Known clean business logic messages from SQL RPCs or validators:
  if (
    msg.length < 180 &&
    !msg.includes('sql') &&
    !msg.includes('SELECT') &&
    !msg.includes('INSERT') &&
    !msg.includes('UPDATE') &&
    !msg.includes('DELETE') &&
    !msg.includes('RPC')
  ) {
    return msg;
  }

  return fallbackMessage;
}

