import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwv9RW78-JfebQWjT2TUScOmIeBnv3NQXDzTuiciY9uZbrJJkyU4Lg8ByPzzTeSg1dUxAueLjxliDQkm4u65_yKtzsQu2bgK5cGwsWwyxopzRSbuUdbD2UPIf9rs1v-HqTtXyhxJH1WjNBbdYznIrigrooMsZYL0KqfnT1vz_IoxcjQaTAPpjkpq3fJf5MWxH-5LMdheTkRypPl4e2fBRNSzam2IrIocXg206shWo16lHVyeujyPUfA';
const logoImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSk6a55NuwAytbnzJJPnsRtAfy8KaH9s2AX5xnGC1tMryE2hrKW2bKPuZHfxU-LghrmXOvWZSoOzRatbsAAy6w_4p3XBtBj1tf10-TlKq9uDbbHHAIFEFx7xMF-d7AhjHMHZylGhaGwlmPmOhnzvpw7VRog9pXWIQPdOpq5H2dHA0ng97Ly18mZRdGDB1N0zlbdWpM89e6lcz6m2U-V4Y7BIYzhS8fo4qKCG4YdXJ5jy8apzX0Ebj_A';

function HomeScreen({
  onRequestBlood,
  onRequests,
  onProfile,
}: {
  onRequestBlood: () => void;
  onRequests: () => void;
  onProfile: () => void;
}) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: logoImage }} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Home</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton} accessibilityLabel="Notifications">
              <MaterialCommunityIcons name="bell-outline" size={22} color="#59413e" />
            </Pressable>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={18} color="#ffffff" />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.locationBadge}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#ffffff" />
              <Text style={styles.locationText}>Kolkata, West Bengal</Text>
            </View>

            <Text style={styles.heroTitle}>Every drop can save a life</Text>
            <Text style={styles.heroSubtitle}>Kolkata, let&apos;s help each other.</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconWrap}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#ba1a1a" />
            </View>

            <View style={styles.alertTextWrap}>
              <Text style={styles.cardTitle}>Need Blood?</Text>
              <Text style={styles.cardSubtitle}>Find compatible blood donors near you</Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={onRequestBlood} accessibilityLabel="Request Blood">
            <MaterialCommunityIcons name="water" size={18} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Request Blood</Text>
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} accessibilityLabel="Donate Blood">
            <View style={styles.quickIconWrap}>
              <MaterialCommunityIcons name="heart" size={20} color="#760009" />
            </View>
            <View>
              <Text style={styles.quickTitle}>Donate Blood</Text>
              <Text style={styles.quickSubtitle}>Become a donor</Text>
            </View>
          </Pressable>

          <Pressable style={styles.quickCard} accessibilityLabel="Find Donor">
            <View style={styles.quickIconWrapAlt}>
              <MaterialCommunityIcons name="magnify" size={20} color="#191c1e" />
            </View>
            <View>
              <Text style={styles.quickTitle}>Find Donor</Text>
              <Text style={styles.quickSubtitle}>Search nearby donors</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Urgent Requests</Text>
            <Text style={styles.sectionLink}>View All</Text>
          </View>

          <View style={styles.requestCard}>
            <View style={styles.requestBody}>
              <View style={styles.bloodBadge}>O+</View>

              <View style={styles.requestInfo}>
                <View style={styles.statusRow}>
                  <Text style={styles.urgentBadge}>URGENT</Text>
                  <Text style={styles.unitsText}>• 2 units required</Text>
                </View>

                <Text style={styles.requestLocation}>AMRI Hospital, Kolkata</Text>
                <Text style={styles.requestMeta}>
                  <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#59413e" />
                  {' '}Posted 25 mins ago
                </Text>
              </View>
            </View>

            <Pressable style={styles.secondaryButton} accessibilityLabel="Respond to urgent request">
              <Text style={styles.secondaryButtonText}>Respond</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <Pressable style={[styles.tabItem, styles.tabItemActive]} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#760009" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Home</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={onRequests} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#59413e" />
          <Text style={styles.tabText}>Requests</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={onProfile} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={styles.tabText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RequestsScreen({ onHome, onProfile }: { onHome: () => void; onProfile: () => void }) {
  return (
    <View style={styles.requestScreen}>
      <StatusBar style="dark" />

      <View style={styles.requestsHeader}>
        <Pressable style={styles.requestBackButton} onPress={onHome} accessibilityLabel="Go back to home">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
        </Pressable>
        <Text style={styles.requestTitle}>Blood Requests</Text>
        <View style={styles.requestHeaderIcon}>
          <MaterialCommunityIcons name="water" size={20} color="#760009" />
        </View>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyStateIcon}>
          <MaterialCommunityIcons name="water" size={42} color="#760009" />
        </View>
        <Text style={styles.emptyStateTitle}>No Blood Requests Yet</Text>
        <Text style={styles.emptyStateText}>Your active blood requests will appear here.</Text>
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>

        <Pressable style={[styles.bottomNavItem, styles.bottomNavItemActive]} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#760009" />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Requests</Text>
        </Pressable>

        <Pressable style={styles.bottomNavItem} onPress={onProfile} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProfileScreen({ onHome, onRequests }: { onHome: () => void; onRequests: () => void }) {
  return (
    <View style={styles.requestScreen}>
      <StatusBar style="dark" />

      <View style={styles.requestsHeader}>
        <Pressable style={styles.requestBackButton} onPress={onHome} accessibilityLabel="Go back to home">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
        </Pressable>
        <Text style={styles.requestTitle}>Profile</Text>
        <View style={styles.requestHeaderIcon}>
          <MaterialCommunityIcons name="account" size={20} color="#760009" />
        </View>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyStateIcon}>
          <MaterialCommunityIcons name="account-outline" size={42} color="#760009" />
        </View>
        <Text style={styles.emptyStateTitle}>Profile</Text>
        <Text style={styles.emptyStateText}>Profile features are coming soon.</Text>
      </View>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>

        <Pressable style={styles.bottomNavItem} onPress={onRequests} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Requests</Text>
        </Pressable>

        <Pressable style={[styles.bottomNavItem, styles.bottomNavItemActive]} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#760009" />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RequestBloodScreen({
  onBack,
  onHome,
  onRequests,
  onProfile,
}: {
  onBack: () => void;
  onHome: () => void;
  onRequests: () => void;
  onProfile: () => void;
}) {
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [units, setUnits] = useState(2);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('Kolkata, West Bengal');
  const [phone, setPhone] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(true);

  const handleSubmit = () => {
    if (!patientName.trim() || !hospitalName.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please complete the patient, hospital and contact information.');
      return;
    }

    Alert.alert('Request submitted', `Your ${selectedBlood} blood request for ${patientName.trim()} has been recorded.`);
  };

  return (
    <View style={styles.requestScreen}>
      <StatusBar style="dark" />

      <View style={styles.requestHeader}>
        <Pressable style={styles.requestBackButton} onPress={onBack} accessibilityLabel="Go back to home">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
        </Pressable>
        <Text style={styles.requestTitle}>Request Blood</Text>
        <View style={styles.requestHeaderIcon}>
          <MaterialCommunityIcons name="water" size={20} color="#760009" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.pageWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.requestBodyScreen}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.stepRow}>
            <View style={styles.stepItem}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>Patient Details</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepItem}>
              <View style={styles.stepDotDim} />
              <Text style={styles.stepTextMuted}>Blood</Text>
            </View>
            <View style={styles.stepDivider} />
            <View style={styles.stepItem}>
              <View style={styles.stepDotDim} />
              <Text style={styles.stepTextMuted}>Hospital</Text>
            </View>
          </View>

          <View style={styles.emergencyBanner}>
            <View style={styles.emergencyGlow}>
              <MaterialCommunityIcons name="alert-circle" size={120} color="#760009" />
            </View>
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyIcon}>
                <MaterialCommunityIcons name="bullhorn" size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emergencyTitle}>Need blood urgently?</Text>
                <Text style={styles.emergencyText}>
                  Fill in the details below and we&apos;ll help connect you with suitable donors nearby.
                </Text>
                <View style={styles.labelPill}>
                  <MaterialCommunityIcons name="eye" size={14} color="#760009" />
                  <Text style={styles.labelPillText}>Visible to compatible donors in Kolkata</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Patient Information</Text>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Patient Full Name</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="account" size={18} color="#8d706d" style={styles.leftIcon} />
                  <TextInput
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter patient's full name"
                    placeholderTextColor="#8d706d"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Blood Group Required</Text>
                <View style={styles.bloodGrid}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <Pressable
                      key={group}
                      onPress={() => setSelectedBlood(group)}
                      style={[styles.bloodButton, selectedBlood === group && styles.bloodButtonSelected]}
                    >
                      <Text
                        style={[
                          styles.bloodButtonText,
                          selectedBlood === group && styles.bloodButtonTextSelected,
                        ]}
                      >
                        {group}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.unitsRow}>
                <View style={styles.unitsLabelWrap}>
                  <MaterialCommunityIcons name="water" size={18} color="#760009" />
                  <Text style={styles.unitsLabel}>Units Required</Text>
                </View>

                <View style={styles.unitsStepper}>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => setUnits((current) => Math.max(1, current - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color="#191c1e" />
                  </Pressable>
                  <Text style={styles.stepperValue}>{units}</Text>
                  <Pressable
                    style={styles.stepperButton}
                    onPress={() => setUnits((current) => Math.min(10, current + 1))}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="#191c1e" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Hospital Information</Text>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Hospital Name</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="hospital" size={18} color="#8d706d" style={styles.leftIcon} />
                  <TextInput
                    value={hospitalName}
                    onChangeText={setHospitalName}
                    placeholder="Enter hospital name (e.g. AMRI Hospital)"
                    placeholderTextColor="#8d706d"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location / Address in Kolkata</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#8d706d" style={styles.leftIcon} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Kolkata, West Bengal"
                    placeholderTextColor="#8d706d"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <Pressable style={styles.inlineAction}>
                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#760009" />
                <Text style={styles.inlineActionText}>Use Current Location</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>When is blood needed?</Text>

            <View style={styles.card}>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleTextWrap}>
                  <MaterialCommunityIcons name="calendar" size={18} color="#760009" />
                  <View>
                    <Text style={styles.scheduleTitle}>Select required date &amp; time</Text>
                    <Text style={styles.scheduleSubtitle}>Immediate / As soon as possible</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#8d706d" />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleTitle}>Emergency Request</Text>
                  <Text style={styles.toggleSubtitle}>Notify nearby compatible donors immediately</Text>
                </View>
                <Switch
                  value={emergencyMode}
                  onValueChange={setEmergencyMode}
                  trackColor={{ false: '#d9dfe4', true: '#760009' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>Contact Information</Text>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <View style={styles.inputWrap}>
                  <Text style={{ position: 'absolute', left: 14, zIndex: 1, color: '#8d706d', fontWeight: '600' }}>
                    +91
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter mobile number"
                    placeholderTextColor="#8d706d"
                    style={[styles.formInput, { paddingLeft: 52 }]}
                  />
                </View>
              </View>

              <Text style={styles.scheduleSubtitle}>
                <MaterialCommunityIcons name="lock" size={14} color="#59413e" /> This number will be used by verified donors to contact you. (Not public)
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Request Summary</Text>
              <View style={styles.priorityPill}>
                <Text style={styles.priorityText}>Priority Active</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="water" size={18} color="#760009" />
                <Text style={styles.summaryKey}>Blood:</Text>
                <Text style={styles.summaryValue}>{selectedBlood} ({units} Units)</Text>
              </View>

              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="hospital" size={18} color="#760009" />
                <Text style={styles.summaryKey}>Hospital:</Text>
                <Text style={styles.summaryValue}>{hospitalName || 'AMRI Hospital'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#760009" />
                <Text style={styles.summaryKey}>Location:</Text>
                <Text style={styles.summaryValue}>{location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.submitWrap}>
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <MaterialCommunityIcons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Blood Request</Text>
            </Pressable>

            <Text style={styles.infoNote}>
              By submitting, you confirm that the information provided is accurate and intended for emergency medical use.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>

        <Pressable style={[styles.bottomNavItem, styles.bottomNavItemActive]} onPress={onRequests} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#760009" />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Requests</Text>
        </Pressable>

        <Pressable style={styles.bottomNavItem} onPress={onProfile} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(247, 249, 251, 0.8)',
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#191c1e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#760009',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 88,
    paddingBottom: 120,
  },
  heroCard: {
    position: 'relative',
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#b02d29',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(118, 0, 9, 0.58)',
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  locationText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginTop: -34,
    marginBottom: 18,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  alertIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#191c1e',
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#59413e',
  },
  primaryButton: {
    backgroundColor: '#760009',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    minHeight: 116,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickIconWrapAlt: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eceef0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    color: '#191c1e',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  quickSubtitle: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#191c1e',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  sectionLink: {
    color: '#760009',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  requestBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  bloodBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f2f4f6',
    color: '#760009',
    fontSize: 20,
    lineHeight: 56,
    textAlign: 'center',
    fontWeight: '700',
  },
  requestInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  urgentBadge: {
    backgroundColor: '#ffdad6',
    color: '#93000a',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  unitsText: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
  },
  requestLocation: {
    color: '#191c1e',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  requestMeta: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryButton: {
    backgroundColor: '#fe7c74',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#721315',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247, 249, 251, 0.9)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: '#ffe3df',
    borderRadius: 28,
    marginHorizontal: 12,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#59413e',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#760009',
    fontWeight: '700',
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  requestScreen: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  requestBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eceef0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#191c1e',
  },
  requestHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBodyScreen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f4f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#760009',
  },
  stepDotDim: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d6d8db',
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#dfe2e5',
    marginHorizontal: 4,
  },
  stepText: {
    color: '#191c1e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  stepTextMuted: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  emergencyBanner: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#ffdad6',
    padding: 18,
    marginBottom: 20,
  },
  emergencyGlow: {
    position: 'absolute',
    right: -18,
    bottom: -18,
    opacity: 0.15,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    zIndex: 1,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#760009',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#8e1214',
    marginBottom: 4,
  },
  emergencyText: {
    color: '#554243',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  labelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  labelPillText: {
    color: '#760009',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    color: '#191c1e',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#59413e',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  formInput: {
    flex: 1,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 42,
    paddingRight: 14,
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 24,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodButton: {
    width: '23%',
    minWidth: 70,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodButtonSelected: {
    backgroundColor: '#760009',
  },
  bloodButtonText: {
    color: '#191c1e',
    fontSize: 14,
    fontWeight: '600',
  },
  bloodButtonTextSelected: {
    color: '#ffffff',
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eff1f3',
    paddingTop: 16,
  },
  unitsLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitsLabel: {
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  unitsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 22,
    textAlign: 'center',
    color: '#191c1e',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  inlineActionText: {
    color: '#760009',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
  },
  scheduleTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  scheduleTitle: {
    color: '#191c1e',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  scheduleSubtitle: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  toggleSubtitle: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#f2f4f6',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e1bfbb',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  priorityPill: {
    backgroundColor: '#ffdad6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityText: {
    color: '#8e1214',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  summaryGrid: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  summaryKey: {
    color: '#59413e',
    fontSize: 13,
    lineHeight: 18,
  },
  summaryValue: {
    color: '#191c1e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  submitWrap: {
    marginTop: 10,
    marginBottom: 30,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#760009',
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#760009',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  infoNote: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247, 249, 251, 0.9)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  bottomNavItemActive: {
    backgroundColor: '#ffe3df',
    borderRadius: 28,
    marginHorizontal: 12,
    paddingVertical: 8,
  },
  bottomNavText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#59413e',
    fontWeight: '500',
  },
  bottomNavTextActive: {
    color: '#760009',
    fontWeight: '700',
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 96,
  },
  emptyStateIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffdad6',
    marginBottom: 20,
  },
  emptyStateTitle: {
    color: '#191c1e',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#59413e',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default function App() {
  const [screen, setScreen] = useState<'home' | 'request' | 'requests' | 'profile'>('home');

  if (screen === 'home') {
    return (
      <HomeScreen
        onRequestBlood={() => setScreen('request')}
        onRequests={() => setScreen('requests')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'request') {
    return (
      <RequestBloodScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onRequests={() => setScreen('requests')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'requests') {
    return <RequestsScreen onHome={() => setScreen('home')} onProfile={() => setScreen('profile')} />;
  }

  return <ProfileScreen onHome={() => setScreen('home')} onRequests={() => setScreen('requests')} />;
}
