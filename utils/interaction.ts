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
  try {
    await Linking.openSettings();
  } catch (error) {
    showMessage('Unable to open settings', error instanceof Error ? error.message : 'Please open your device settings manually.');
  }
}
