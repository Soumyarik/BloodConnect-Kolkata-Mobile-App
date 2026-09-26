import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Cities, States } from 'countries-states-cities-service';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type ProfileSetupInput = {
  fullName: string;
  phone: string;
  state: string;
  city: string;
  bloodGroup: string;
  donorAvailable: boolean;
};

type ProfileSetupScreenProps = {
  initial: Partial<ProfileSetupInput>;
  onSave: (input: ProfileSetupInput) => Promise<{ error: Error | null }>;
};

type PickerType = 'state' | 'city' | null;

const INDIA_STATES = States.getStates({
  filters: { country_code: 'IN' },
  sort: { mode: 'alphabetical', key: 'name' },
});

export function ProfileSetupScreen({ initial, onSave }: ProfileSetupScreenProps) {
  const [fullName, setFullName] = useState(initial.fullName || '');
  const [phone, setPhone] = useState(initial.phone || '');
  const [state, setState] = useState(initial.state || '');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState(initial.city || '');
  const [bloodGroup, setBloodGroup] = useState(initial.bloodGroup || '');
  const [donorAvailable, setDonorAvailable] = useState(Boolean(initial.donorAvailable));
  const [cities, setCities] = useState<Array<{ name: string; state_code?: string }>>([]);
  const [picker, setPicker] = useState<PickerType>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const matchingState = INDIA_STATES.find(
      (item) => item.name.toLowerCase() === (initial.state || '').toLowerCase(),
    );
    if (matchingState) {
      setStateCode(matchingState.state_code || '');
    }
  }, [initial.state]);

  useEffect(() => {
    if (!stateCode) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const stateCities = Cities.getCities({
        filters: { country_code: 'IN', state_code: stateCode },
        sort: { mode: 'alphabetical', key: 'name' },
      });
      const uniqueCities = Array.from(
        new Map(stateCities.map((item) => [item.name.toLowerCase(), item])).values(),
      );
      setCities(uniqueCities);
    } catch (error) {
      setCities([]);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load cities for this state.');
    } finally {
      setLoadingCities(false);
    }
  }, [stateCode]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (picker === 'state') {
      return INDIA_STATES.filter((item) => !query || item.name.toLowerCase().includes(query));
    }
    return cities.filter((item) => !query || item.name.toLowerCase().includes(query));
  }, [cities, picker, search]);

  const openPicker = (type: PickerType) => {
    setSearch('');
    setErrorMessage('');
    setPicker(type);
  };

  const selectState = (name: string, code: string) => {
    setState(name);
    setStateCode(code);
    setCity('');
    setPicker(null);
  };

  const selectCity = (name: string) => {
    setCity(name);
    setPicker(null);
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!validatePhone(phone)) {
      setErrorMessage('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!state) {
      setErrorMessage('Please select your state.');
      return;
    }
    if (!city) {
      setErrorMessage('Please select your city.');
      return;
    }
    if (!bloodGroup) {
      setErrorMessage('Please select your blood group.');
      return;
    }

    setSaving(true);
    const result = await onSave({
      fullName: fullName.trim(),
      phone: phone.trim(),
      state,
      city,
      bloodGroup,
      donorAvailable,
    });
    setSaving(false);

    if (result.error) setErrorMessage(result.error.message);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="account-edit-outline" size={28} color="#760009" />
        </View>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          Add the required details once so BloodConnect can match you with the right blood requests and nearby donors.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Required information</Text>

          <Text style={styles.label}>Full name *</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#8d706d"
            style={styles.input}
            autoCapitalize="words"
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
          <Pressable style={styles.selectButton} onPress={() => openPicker('state')}>
            <Text style={[styles.selectText, !state && styles.placeholder]}>
              {state || 'Select your state / UT'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#59413e" />
          </Pressable>

          <Text style={styles.label}>City *</Text>
          <Pressable
            style={[styles.selectButton, !state && styles.selectDisabled]}
            onPress={() => state && openPicker('city')}
            disabled={!state}
          >
            <Text style={[styles.selectText, !city && styles.placeholder]}>
              {city || (state ? 'Select your city' : 'Select state first')}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#59413e" />
          </Pressable>

          {loadingCities ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color="#760009" />
              <Text style={styles.inlineLoadingText}>Loading cities...</Text>
            </View>
          ) : null}

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

          <View style={styles.privacyBox}>
            <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#760009" />
            <Text style={styles.privacyText}>
              Your exact home/device location is not shown to other users. GPS proximity is handled separately.
            </Text>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.saveButton} onPress={() => void handleSave()} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle-outline" size={19} color="#ffffff" />
                <Text style={styles.saveText}>Save &amp; Continue</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{picker === 'state' ? 'Select State / UT' : 'Select City'}</Text>
                <Text style={styles.modalSubtitle}>
                  {picker === 'state'
                    ? String(filteredOptions.length) + ' options'
                    : String(filteredOptions.length) + ' cities'}
                </Text>
              </View>
              <Pressable style={styles.modalClose} onPress={() => setPicker(null)} accessibilityLabel="Close selector">
                <MaterialCommunityIcons name="close" size={20} color="#59413e" />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={19} color="#59413e" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={picker === 'state' ? 'Search state...' : 'Search city...'}
                placeholderTextColor="#8d706d"
                style={styles.searchInput}
                autoFocus
              />
            </View>

            <ScrollView style={styles.optionsList} keyboardShouldPersistTaps="handled">
              {filteredOptions.map((item) => {
                const name = item.name;
                const code =
                  picker === 'state'
                    ? String((item as { state_code?: string }).state_code || '')
                    : '';
                return (
                  <Pressable
                    key={name + '-' + (code || picker || 'city')}
                    style={styles.optionRow}
                    onPress={() => (picker === 'state' ? selectState(name, code) : selectCity(name))}
                  >
                    <Text style={styles.optionText}>{name}</Text>
                    <MaterialCommunityIcons
                      name={picker === 'state' ? 'map-marker-outline' : 'city-variant-outline'}
                      size={19}
                      color="#8d706d"
                    />
                  </Pressable>
                );
              })}
              {!filteredOptions.length ? (
                <View style={styles.emptyOptions}>
                  <MaterialCommunityIcons name="map-search-outline" size={24} color="#8d706d" />
                  <Text style={styles.emptyOptionsText}>
                    No matching {picker === 'state' ? 'state' : 'city'} found.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f9fb' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 },
  headerIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  title: { color: '#191c1e', fontSize: 28, lineHeight: 36, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#59413e', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, shadowColor: '#991b1b', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  sectionLabel: { color: '#760009', fontSize: 12, lineHeight: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  label: { color: '#59413e', fontSize: 13, lineHeight: 18, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  input: { minHeight: 48, backgroundColor: '#f2f4f6', borderRadius: 12, paddingHorizontal: 14, color: '#191c1e', fontSize: 15, lineHeight: 21 },
  selectButton: { minHeight: 48, backgroundColor: '#f2f4f6', borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: '#191c1e', fontSize: 15, lineHeight: 21, flex: 1 },
  placeholder: { color: '#8d706d' },
  selectDisabled: { opacity: 0.6 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodButton: { width: '22%', minHeight: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f4f6' },
  bloodButtonSelected: { backgroundColor: '#760009' },
  bloodText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  bloodTextSelected: { color: '#ffffff' },
  donorCard: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff7f5', borderWidth: 1, borderColor: '#ffdad6', borderRadius: 16, padding: 14 },
  donorCopy: { flex: 1 },
  donorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  donorTitle: { color: '#191c1e', fontSize: 14, lineHeight: 19, fontWeight: '700' },
  donorSubtitle: { color: '#59413e', fontSize: 11, lineHeight: 16, marginTop: 3 },
  privacyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f2f4f6', borderRadius: 12, padding: 11, marginTop: 12 },
  privacyText: { flex: 1, color: '#59413e', fontSize: 11, lineHeight: 16 },
  inlineLoading: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  inlineLoadingText: { color: '#59413e', fontSize: 11, lineHeight: 16 },
  errorText: { color: '#ba1a1a', backgroundColor: '#ffdad6', borderRadius: 12, padding: 11, fontSize: 13, lineHeight: 18, marginTop: 12 },
  saveButton: { minHeight: 50, borderRadius: 999, backgroundColor: '#760009', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 18 },
  saveText: { color: '#ffffff', fontSize: 14, lineHeight: 20, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(25, 28, 30, 0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '82%', padding: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalTitle: { color: '#191c1e', fontSize: 20, lineHeight: 27, fontWeight: '700' },
  modalSubtitle: { color: '#59413e', fontSize: 11, lineHeight: 16, marginTop: 2 },
  modalClose: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  searchBox: { minHeight: 46, borderRadius: 12, backgroundColor: '#f2f4f6', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, marginBottom: 8 },
  searchInput: { flex: 1, color: '#191c1e', fontSize: 14, padding: 0 },
  optionsList: { maxHeight: 500 },
  optionRow: { minHeight: 48, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#eceef0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '500', flex: 1 },
  emptyOptions: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 7 },
  emptyOptionsText: { color: '#59413e', fontSize: 13, lineHeight: 18 },
});
