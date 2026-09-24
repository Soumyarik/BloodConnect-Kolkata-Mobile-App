import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type AuthScreenProps = {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (input: {
    fullName: string;
    email: string;
    password: string;
    bloodGroup: string;
  }) => Promise<{ error: Error | null }>;
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function AuthScreen({ signIn, signUp }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setErrorMessage('');
    setNotice('');
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setNotice('');

    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password to continue.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp({ fullName, email, password, bloodGroup });
    setLoading(false);

    if (result.error) {
      if (mode === 'signup' && result.error.message.startsWith('Account created.')) {
        setNotice(result.error.message);
      } else {
        setErrorMessage(result.error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <MaterialCommunityIcons name="water" size={34} color="#ffffff" />
        </View>
        <Text style={styles.title}>BloodConnect</Text>
        <Text style={styles.subtitle}>Helping Kolkata connect, one drop at a time.</Text>

        <View style={styles.card}>
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Sign Up</Text>
            </Pressable>
          </View>

          <Text style={styles.heading}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.helperText}>
            {mode === 'login' ? 'Sign in to continue to BloodConnect.' : 'Join the local blood donation community.'}
          </Text>

          {mode === 'signup' ? (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#8d706d"
                style={styles.input}
                autoCapitalize="words"
              />
            </>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#8d706d"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#8d706d"
            style={styles.input}
            secureTextEntry
          />

          {mode === 'signup' ? (
            <>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#8d706d"
                style={styles.input}
                secureTextEntry
              />

              <Text style={styles.label}>Blood group (optional; select only if known)</Text>
              <View style={styles.bloodGrid}>
                {bloodGroups.map((group) => (
                  <Pressable
                    key={group}
                    onPress={() => setBloodGroup(group)}
                    style={[styles.bloodButton, bloodGroup === group && styles.bloodButtonSelected]}
                  >
                    <Text style={[styles.bloodText, bloodGroup === group && styles.bloodTextSelected]}>
                      {group}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <Text style={styles.submitText}>Please wait...</Text> : (
              <>
                <MaterialCommunityIcons name={mode === 'login' ? 'login' : 'account-plus'} size={18} color="#ffffff" />
                <Text style={styles.submitText}>{mode === 'login' ? 'Login' : 'Create Account'}</Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login' ? 'New to BloodConnect? Sign Up' : 'Already have an account? Login'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f9fb' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brandMark: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: '#760009', marginBottom: 12 },
  title: { color: '#191c1e', fontSize: 30, lineHeight: 38, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#59413e', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#991b1b', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  modeRow: { flexDirection: 'row', backgroundColor: '#f2f4f6', borderRadius: 12, padding: 4, marginBottom: 22 },
  modeButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, borderRadius: 9 },
  modeButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  modeText: { color: '#59413e', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  modeTextActive: { color: '#760009' },
  heading: { color: '#191c1e', fontSize: 22, lineHeight: 30, fontWeight: '600' },
  helperText: { color: '#59413e', fontSize: 13, lineHeight: 18, marginTop: 2, marginBottom: 16 },
  label: { color: '#59413e', fontSize: 13, lineHeight: 18, fontWeight: '600', marginBottom: 7, marginTop: 8 },
  input: { minHeight: 48, backgroundColor: '#f2f4f6', borderRadius: 12, paddingHorizontal: 14, color: '#191c1e', fontSize: 15, lineHeight: 21 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  bloodButton: { width: '22%', minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f4f6' },
  bloodButtonSelected: { backgroundColor: '#760009' },
  bloodText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  bloodTextSelected: { color: '#ffffff' },
  errorText: { color: '#ba1a1a', fontSize: 13, lineHeight: 18, marginTop: 12 },
  noticeText: { color: '#166534', backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, fontSize: 13, lineHeight: 18, marginTop: 12 },
  submitButton: { minHeight: 50, borderRadius: 999, backgroundColor: '#760009', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  submitText: { color: '#ffffff', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  switchText: { color: '#760009', fontSize: 13, lineHeight: 18, fontWeight: '600', textAlign: 'center', marginTop: 16 },
});
