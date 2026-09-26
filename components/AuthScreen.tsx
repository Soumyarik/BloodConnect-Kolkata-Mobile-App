import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BloodConnectLogo } from './BloodConnectLogo';
import { Cities, States } from 'countries-states-cities-service';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
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
    phone: string;
    state: string;
    city: string;
    bloodGroup: string;
    donorAvailable: boolean;
  }) => Promise<{ error: Error | null }>;
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const indiaStates = States.getStates({
  filters: { country_code: 'IN' },
  sort: { mode: 'alphabetical', key: 'name' },
});

export function AuthScreen({ signIn, signUp }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [donorAvailable, setDonorAvailable] = useState(false);
  const [picker, setPicker] = useState<'state' | 'city' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const cities = useMemo(() => {
    if (!stateCode) return [];
    try {
      return Cities.getCities({
        filters: { country_code: 'IN', state_code: stateCode },
        sort: { mode: 'alphabetical', key: 'name' },
      });
    } catch {
      return [];
    }
  }, [stateCode]);

  const pickerOptions = useMemo(() => {
    const query = pickerSearch.trim().toLowerCase();
    const options = picker === 'state' ? indiaStates : cities;
    return options.filter((item) => !query || item.name.toLowerCase().includes(query));
  }, [cities, picker, pickerSearch]);

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setErrorMessage('');
    setNotice('');
    setPicker(null);
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
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
      if (!validatePhone(phone)) {
        setErrorMessage('Enter a valid 10-digit Indian mobile number.');
        return;
      }
      if (!state) {
        setErrorMessage('Select your state.');
        return;
      }
      if (!city) {
        setErrorMessage('Select your city.');
        return;
      }
      if (!bloodGroup) {
        setErrorMessage('Select your blood group.');
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
      : await signUp({ fullName, email, password, phone, state, city, bloodGroup, donorAvailable });
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
        <BloodConnectLogo size={128} />
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

              <Text style={styles.label}>Phone number *</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile number"
                placeholderTextColor="#8d706d"
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={13}
              />

              <Text style={styles.label}>State *</Text>
              <Pressable
                style={styles.selectButton}
                onPress={() => {
                  setPickerSearch('');
                  setPicker('state');
                }}
              >
                <Text style={[styles.selectText, !state && styles.placeholder]}>
                  {state || 'Select your state / UT'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#59413e" />
              </Pressable>

              <Text style={styles.label}>City *</Text>
              <Pressable
                style={[styles.selectButton, !state && styles.selectDisabled]}
                onPress={() => {
                  if (!state) return;
                  setPickerSearch('');
                  setPicker('city');
                }}
                disabled={!state}
              >
                <Text style={[styles.selectText, !city && styles.placeholder]}>
                  {city || (state ? 'Select your city' : 'Select state first')}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#59413e" />
              </Pressable>

              <Text style={styles.label}>Blood group *</Text>
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

              <View style={styles.donorCard}>
                <View style={styles.donorCopy}>
                  <View style={styles.donorTitleRow}>
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#760009" />
                    <Text style={styles.donorTitle}>Available to donate blood</Text>
                  </View>
                  <Text style={styles.donorSubtitle}>
                    Turn this on only when you are currently willing to receive donor requests.
                  </Text>
                </View>
                <Switch
                  value={donorAvailable}
                  onValueChange={setDonorAvailable}
                  trackColor={{ false: '#d9dfe4', true: '#760009' }}
                  thumbColor="#ffffff"
                />
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

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{picker === 'state' ? 'Select State / UT' : 'Select City'}</Text>
                <Text style={styles.modalSubtitle}>{picker === 'state' ? 'All Indian states and union territories' : 'Cities for ' + state}</Text>
              </View>
              <Pressable style={styles.modalClose} onPress={() => setPicker(null)}>
                <MaterialCommunityIcons name="close" size={20} color="#59413e" />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={19} color="#59413e" />
              <TextInput
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder={picker === 'state' ? 'Search state...' : 'Search city...'}
                placeholderTextColor="#8d706d"
                style={styles.searchInput}
                autoFocus
              />
            </View>

            <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
              {pickerOptions.map((item) => {
                const code = picker === 'state'
                  ? String((item as { state_code?: string }).state_code || '')
                  : '';
                return (
                  <Pressable
                    key={item.name + '-' + (code || picker)}
                    style={styles.optionRow}
                    onPress={() => {
                      if (picker === 'state') {
                        setState(item.name);
                        setStateCode(code);
                        setCity('');
                      } else {
                        setCity(item.name);
                      }
                      setPicker(null);
                    }}
                  >
                    <Text style={styles.optionText}>{item.name}</Text>
                    <MaterialCommunityIcons
                      name={picker === 'state' ? 'map-marker-outline' : 'city-variant-outline'}
                      size={19}
                      color="#8d706d"
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  selectButton: { minHeight: 48, backgroundColor: '#f2f4f6', borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: '#191c1e', fontSize: 15, lineHeight: 21, flex: 1 },
  placeholder: { color: '#8d706d' },
  selectDisabled: { opacity: 0.6 },
  donorCard: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff7f5', borderWidth: 1, borderColor: '#ffdad6', borderRadius: 16, padding: 14 },
  donorCopy: { flex: 1 },
  donorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  donorTitle: { color: '#191c1e', fontSize: 14, lineHeight: 19, fontWeight: '700' },
  donorSubtitle: { color: '#59413e', fontSize: 11, lineHeight: 16, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(25, 28, 30, 0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '82%', padding: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalTitle: { color: '#191c1e', fontSize: 20, lineHeight: 27, fontWeight: '700' },
  modalSubtitle: { color: '#59413e', fontSize: 11, lineHeight: 16, marginTop: 2, maxWidth: 300 },
  modalClose: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 46, borderRadius: 12, backgroundColor: '#f2f4f6', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 8 },
  searchInput: { flex: 1, color: '#191c1e', fontSize: 14, padding: 0 },
  optionsList: { maxHeight: 500 },
  optionRow: { minHeight: 48, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#eceef0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '500', flex: 1 },
  errorText: { color: '#ba1a1a', fontSize: 13, lineHeight: 18, marginTop: 12 },
  noticeText: { color: '#166534', backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, fontSize: 13, lineHeight: 18, marginTop: 12 },
  submitButton: { minHeight: 50, borderRadius: 999, backgroundColor: '#760009', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  submitText: { color: '#ffffff', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  switchText: { color: '#760009', fontSize: 13, lineHeight: 18, fontWeight: '600', textAlign: 'center', marginTop: 16 },
});
