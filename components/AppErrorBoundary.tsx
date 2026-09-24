import { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('BloodConnect runtime error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.screen}>
        <Text style={styles.title}>BloodConnect could not start</Text>
        <Text style={styles.message}>
          {Platform.OS === 'web'
            ? 'The web app hit a runtime error. Refresh after the latest deployment finishes.'
            : 'The app hit a runtime error. Please restart the app.'}
        </Text>
        <Text selectable style={styles.error}>
          {this.state.error.message || String(this.state.error)}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f7f9fb' },
  title: { color: '#191c1e', fontSize: 24, lineHeight: 32, fontWeight: '700', textAlign: 'center' },
  message: { color: '#59413e', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 640 },
  error: { color: '#ba1a1a', backgroundColor: '#ffdad6', borderRadius: 12, padding: 12, marginTop: 18, maxWidth: 760 },
});
