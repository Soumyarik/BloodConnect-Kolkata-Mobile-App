import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './utils/supabase';

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwv9RW78-JfebQWjT2TUScOmIeBnv3NQXDzTuiciY9uZbrJJkyU4Lg8ByPzzTeSg1dUxAueLjxliDQkm4u65_yKtzsQu2bgK5cGwsWwyxopzRSbuUdbD2UPIf9rs1v-HqTtXyhxJH1WjNBbdYznIrigrooMsZYL0KqfnT1vz_IoxcjQaTAPpjkpq3fJf5MWxH-5LMdheTkRypPl4e2fBRNSzam2IrIocXg206shWo16lHVyeujyPUfA';
const logoImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSk6a55NuwAytbnzJJPnsRtAfy8KaH9s2AX5xnGC1tMryE2hrKW2bKPuZHfxU-LghrmXOvWZSoOzRatbsAAy6w_4p3XBtBj1tf10-TlKq9uDbbHHAIFEFx7xMF-d7AhjHMHZylGhaGwlmPmOhnzvpw7VRog9pXWIQPdOpq5H2dHA0ng97Ly18mZRdGDB1N0zlbdWpM89e6lcz6m2U-V4Y7BIYzhS8fo4qKCG4YdXJ5jy8apzX0Ebj_A';

function HomeScreen({
  onRequestBlood,
  onFindDonor,
  onRequests,
  onProfile,
}: {
  onRequestBlood: () => void;
  onFindDonor: () => void;
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

          <Pressable style={styles.quickCard} onPress={onFindDonor} accessibilityLabel="Find Donor">
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
              <Text style={styles.bloodBadge}>O+</Text>

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

type Donor = {
  name: string;
  blood: string;
  distance: string;
  lastDonation: string;
  available: boolean;
};

const mockDonors: Donor[] = [
  {
    name: 'Rahul S.',
    blood: 'O+',
    distance: 'Approx. 2.1 km away',
    lastDonation: '3 months ago',
    available: true,
  },
  {
    name: 'Ananya M.',
    blood: 'O+',
    distance: 'Approx. 4.5 km away',
    lastDonation: '6 months ago',
    available: true,
  },
];

function FindDonorScreen({
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
  const [radius, setRadius] = useState('10 km');
  const [requestSentDonor, setRequestSentDonor] = useState<Donor | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const visibleDonors = showEmptyState
    ? []
    : mockDonors.filter((donor) => donor.blood === selectedBlood && donor.available);

  const requestDonor = (donor: Donor) => {
    Alert.alert(
      `Request ${donor.name}?`,
      `Send a blood-help request for ${donor.blood} blood at the hospital. The donor must respond before they are considered accepted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: () => setRequestSentDonor(donor),
        },
      ],
    );
  };

  return (
    <View style={styles.findDonorScreen}>
      <StatusBar style="dark" />

      <View style={styles.findDonorHeader}>
        <View style={styles.findDonorHeaderLeft}>
          <Pressable style={styles.requestBackButton} onPress={onBack} accessibilityLabel="Go back to home">
            <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
          </Pressable>
          <Text style={styles.requestTitle}>Find Donor</Text>
        </View>
        <View style={styles.findDonorHeaderActions}>
          <View style={styles.findDonorHeaderIcon}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#191c1e" />
          </View>
          <View style={styles.findDonorHeaderIcon}>
            <MaterialCommunityIcons name="account" size={20} color="#191c1e" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.findDonorScroll}
        contentContainerStyle={styles.findDonorContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.findDonorSubtitle}>
          Find a compatible donor near you - connect with nearby available donors safely.
        </Text>

        <View style={styles.findDonorCard}>
          <View style={styles.findDonorLocationRow}>
            <View style={styles.findDonorLocationInfo}>
              <View style={styles.findDonorIconCircle}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#760009" />
              </View>
              <View>
                <Text style={styles.findDonorLabel}>Current Location</Text>
                <Text style={styles.findDonorLocation}>Kolkata, West Bengal</Text>
              </View>
            </View>
            <Pressable onPress={() => Alert.alert('Location', 'Location selection will connect to a location service later.')}>
              <Text style={styles.findDonorChange}>Change</Text>
            </Pressable>
          </View>

          <View style={styles.findDonorMetaRow}>
            <Text style={styles.findDonorMeta}>Searching within {radius} radius</Text>
            <Text style={styles.findDonorActive}>{visibleDonors.length} Donors Active</Text>
          </View>

          <View style={styles.chipRow}>
            {['5 km', '10 km', '25 km', '50 km'].map((option) => (
              <Pressable
                key={option}
                onPress={() => setRadius(option)}
                style={[styles.filterChip, radius === option && styles.filterChipSelected]}
              >
                <Text style={[styles.filterChipText, radius === option && styles.filterChipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.findDonorSectionHeader}>
          <Text style={styles.findDonorSectionTitle}>Select Blood Group</Text>
          <Text style={styles.findDonorLabel}>Tap to filter</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bloodChoiceRow}>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
            <Pressable
              key={group}
              onPress={() => {
                setSelectedBlood(group);
                setShowEmptyState(false);
              }}
              style={[styles.bloodChoice, selectedBlood === group && styles.bloodChoiceSelected]}
            >
              <Text style={[styles.bloodChoiceText, selectedBlood === group && styles.bloodChoiceTextSelected]}>
                {group}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.compatibilityNote}>
          <MaterialCommunityIcons name="information-outline" size={16} color="#760009" />
          <Text style={styles.compatibilityText}>Compatible blood groups highlighted based on patient requirement.</Text>
        </View>

        <View style={styles.filterRow}>
          <Pressable style={styles.smallFilter} onPress={() => setShowEmptyState((current) => !current)}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#760009" />
            <Text style={styles.smallFilterText}>{showEmptyState ? 'Show Available' : 'Available Now'}</Text>
          </Pressable>
          <Pressable style={styles.smallFilter} onPress={() => setRadius('5 km')}>
            <MaterialCommunityIcons name="near-me" size={16} color="#760009" />
            <Text style={styles.smallFilterText}>Distance: Nearest</Text>
          </Pressable>
          <View style={styles.smallFilter}>
            <MaterialCommunityIcons name="history" size={16} color="#760009" />
            <Text style={styles.smallFilterText}>Last Donation</Text>
          </View>
        </View>

        {requestSentDonor ? (
          <View style={styles.acceptedCard}>
            <View style={styles.acceptedHeader}>
              <View style={styles.acceptedTitleRow}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#760009" />
                <Text style={styles.findDonorSectionTitle}>Request Sent</Text>
              </View>
              <Text style={styles.confirmedBadge}>Pending</Text>
            </View>
            <Text style={styles.acceptedText}>
              Your request has been sent to {requestSentDonor.name}. The donor must respond before they are considered accepted. Blood is not confirmed until the donor responds and completes the required hospital screening.
            </Text>
            <View style={styles.acceptedActions}>
              <Pressable style={styles.acceptedAction} onPress={() => Alert.alert('Waiting for donor', 'Contact details will be available only after the donor accepts your request.')}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#760009" />
                <Text style={styles.acceptedActionText}>Call</Text>
              </Pressable>
              <Pressable style={styles.acceptedAction} onPress={() => Alert.alert('Waiting for donor', 'WhatsApp contact will be available only after the donor accepts your request.')}>
                <MaterialCommunityIcons name="message-text-outline" size={20} color="#760009" />
                <Text style={styles.acceptedActionText}>WhatsApp</Text>
              </Pressable>
              <Pressable style={styles.acceptedAction} onPress={() => Alert.alert('Location not available', 'Live location sharing starts only after the donor accepts and explicitly chooses to share their location.')}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#760009" />
                <Text style={styles.acceptedActionText}>Track</Text>
              </Pressable>
            </View>
            <View style={styles.locationPrivacyBox}>
              <MaterialCommunityIcons name="lock" size={18} color="#59413e" />
              <Text style={styles.locationPrivacyText}>Exact location is shared only if the donor explicitly chooses to share it.</Text>
            </View>
            <View style={styles.pickupRow}>
              <View style={styles.pickupTextWrap}>
                <Text style={styles.pickupTitle}>Need Hospital Pickup?</Text>
                <Text style={styles.findDonorMeta}>Verified hospitals can request cab support for donors.</Text>
              </View>
              <Pressable style={styles.requestPickupButton} onPress={() => Alert.alert('Hospital Pickup', 'Pickup support will be connected to verified hospitals later. It does not confirm donor availability.')}>
                <Text style={styles.requestPickupText}>Request Pickup</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.findDonorResults}>
            <View style={styles.findDonorResultsHeader}>
              <View>
                <Text style={styles.findDonorSectionTitle}>Available Donors</Text>
                <Text style={styles.findDonorLabel}>{visibleDonors.length} compatible donors found near you</Text>
              </View>
              <Text style={styles.updatedText}>Updated just now</Text>
            </View>

            {visibleDonors.length > 0 ? (
              visibleDonors.map((donor) => (
                <View key={donor.name} style={styles.donorCard}>
                  <View style={styles.donorHeader}>
                    <View style={styles.donorAvatar}>
                      <MaterialCommunityIcons name="account" size={28} color="#59413e" />
                      <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.donorInfo}>
                      <View style={styles.donorNameRow}>
                        <Text style={styles.donorName}>{donor.name}</Text>
                        <Text style={styles.donorBlood}>{donor.blood}</Text>
                      </View>
                      <Text style={styles.donorMeta}>{donor.distance}</Text>
                      <Text style={styles.donorMeta}>Last donated: {donor.lastDonation}</Text>
                    </View>
                    <Text style={styles.availableBadge}>Available Now</Text>
                  </View>
                  <View style={styles.privacyNotice}>
                    <MaterialCommunityIcons name="lock" size={18} color="#8d706d" />
                    <Text style={styles.privacyText}>Exact address hidden. Location details are shared only after donor acceptance.</Text>
                  </View>
                  <View style={styles.donorActions}>
                    <Pressable style={styles.donorActionButton} onPress={() => Alert.alert('Call Donor', 'Calling is available after verified contact details are shared.')}>
                      <MaterialCommunityIcons name="phone" size={18} color="#191c1e" />
                      <Text style={styles.donorActionText}>Call</Text>
                    </Pressable>
                    <Pressable style={styles.donorActionButton} onPress={() => Alert.alert('WhatsApp', 'WhatsApp contact is available after donor acceptance.')}>
                      <MaterialCommunityIcons name="message-text" size={18} color="#191c1e" />
                      <Text style={styles.donorActionText}>WhatsApp</Text>
                    </Pressable>
                    <Pressable style={styles.donorRequestButton} onPress={() => requestDonor(donor)}>
                      <Text style={styles.donorRequestText}>Request</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.donorEmptyState}>
                <View style={styles.donorEmptyIcon}>
                  <MaterialCommunityIcons name="water" size={32} color="#760009" />
                </View>
                <Text style={styles.emptyStateTitle}>No compatible donors nearby</Text>
                <Text style={styles.emptyStateText}>Try increasing your search radius or selecting another location.</Text>
                <Pressable
                  style={styles.donorRequestButtonFull}
                  onPress={() => {
                    setRadius('25 km');
                    setShowEmptyState(false);
                  }}
                >
                  <Text style={styles.donorRequestText}>Increase Search Radius to 25 km</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>
        <Pressable style={styles.bottomNavItem} onPress={onRequests} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Requests</Text>
        </Pressable>
        <Pressable style={styles.bottomNavItem} onPress={onProfile} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

type BloodRequest = {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  area: string;
  requiredDate: string | null;
  requiredTime: string | null;
  status: string;
  isEmergency: boolean;
  contactPhone: string;
};

type BloodRequestRow = {
  id: string;
  patient_name: string;
  blood_group: string;
  units_required: number;
  hospital_name: string;
  hospital_address: string | null;
  city: string;
  area: string | null;
  required_date: string | null;
  required_time: string | null;
  status: string;
  is_emergency: boolean;
  contact_phone: string;
};

const toBloodRequest = (row: BloodRequestRow): BloodRequest => ({
  id: row.id,
  patientName: row.patient_name,
  bloodGroup: row.blood_group,
  unitsRequired: row.units_required,
  hospitalName: row.hospital_name,
  hospitalAddress: row.hospital_address || '',
  city: row.city,
  area: row.area || '',
  requiredDate: row.required_date,
  requiredTime: row.required_time,
  status: row.status,
  isEmergency: row.is_emergency,
  contactPhone: row.contact_phone,
});

const formatRequestDeadline = (request: BloodRequest) => {
  if (!request.requiredDate && !request.requiredTime) return 'As soon as possible';
  return [request.requiredDate, request.requiredTime].filter(Boolean).join(', ');
};

function RequestsScreen({ onHome, onProfile, onRequestDetails }: { onHome: () => void; onProfile: () => void; onRequestDetails: (requestId: string) => void }) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadRequests = async () => {
      setLoading(true);
      setErrorMessage('');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        if (mounted) {
          setErrorMessage(userError?.message || 'You must be signed in to view requests.');
          setLoading(false);
        }
        return;
      }
      const { data, error } = await supabase
        .from('blood_requests')
        .select('id, patient_name, blood_group, units_required, hospital_name, hospital_address, city, area, required_date, required_time, status, is_emergency, contact_phone')
        .eq('requester_id', userData.user.id)
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (error) setErrorMessage(`Unable to load requests: ${error.message}`);
      else setRequests((data as BloodRequestRow[]).map(toBloodRequest));
      setLoading(false);
    };
    void loadRequests();
    return () => { mounted = false; };
  }, []);

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

      {loading ? (
        <Text style={styles.authLoadingText}>Loading requests...</Text>
      ) : errorMessage ? (
        <Text style={styles.profileErrorText}>{errorMessage}</Text>
      ) : requests.length > 0 ? (
        requests.map((request) => (
        <Pressable key={request.id} style={styles.mockRequestCard} onPress={() => onRequestDetails(request.id)} accessibilityLabel={`Open ${request.patientName} blood request`}>
          <View style={styles.mockRequestTopRow}>
            <View style={styles.mockRequestBloodBadge}><Text style={styles.mockRequestBloodText}>{request.bloodGroup}</Text></View>
            <View style={styles.mockRequestCopy}>
              <View style={styles.mockRequestStatusRow}>
                {request.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
                <Text style={styles.openStatusBadge}>{request.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.mockRequestPatient}>{request.patientName}</Text>
              <Text style={styles.findDonorMeta}>{request.unitsRequired} units required - {request.hospitalName}</Text>
              <Text style={styles.findDonorMeta}>{[request.area, request.city].filter(Boolean).join(', ')} - {formatRequestDeadline(request)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#8d706d" />
          </View>
          <Text style={styles.mockRequestHint}>Tap to view request details</Text>
        </Pressable>
        ))
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <MaterialCommunityIcons name="water" size={42} color="#760009" />
          </View>
          <Text style={styles.emptyStateTitle}>No Blood Requests Yet</Text>
          <Text style={styles.emptyStateText}>Your active blood requests will appear here.</Text>
        </View>
      )}

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

function BloodRequestDetailsScreen({
  onBack,
  onHome,
  onRequests,
  onProfile,
  onFindDonor,
  requestId,
}: {
  onBack: () => void;
  onHome: () => void;
  onRequests: () => void;
  onProfile: () => void;
  onFindDonor: () => void;
  requestId: string;
}) {
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [donorResponses, setDonorResponses] = useState<Array<{ id: string; donorId: string; status: string; createdAt: string }>>([]);

  useEffect(() => {
    let mounted = true;
    const loadRequest = async () => {
      setLoading(true);
      setErrorMessage('');

      if (!requestId) {
        setRequest(null);
        setErrorMessage('No blood request was selected. Please go back and choose a request.');
        setLoading(false);
        return;
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        if (mounted) { setErrorMessage(userError?.message || 'You must be signed in to view this request.'); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from('blood_requests')
        .select('id, patient_name, blood_group, units_required, hospital_name, hospital_address, city, area, required_date, required_time, status, is_emergency, contact_phone')
        .eq('id', requestId)
        .eq('requester_id', userData.user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        setErrorMessage(`Unable to load request: ${error.message}`);
        setLoading(false);
        return;
      }
      if (!data) {
        setErrorMessage('This request could not be found or is not owned by your account.');
        setLoading(false);
        return;
      }
      const mappedRequest = toBloodRequest(data as BloodRequestRow);
      const { data: responseData, error: responseError } = await supabase
        .from('donor_responses')
        .select('id, donor_id, status, created_at')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      if (!mounted) return;
      setRequest(mappedRequest);
      if (responseError) {
        setErrorMessage(`Request loaded, but donor responses could not be loaded: ${responseError.message}`);
      } else {
        setDonorResponses((responseData || []).map((row) => ({
          id: row.id, donorId: row.donor_id, status: row.status, createdAt: row.created_at,
        })));
      }
      setLoading(false);
    };
    void loadRequest();
    return () => { mounted = false; };
  }, [requestId]);

  const cancelRequest = async () => {
    if (!request) return;
    const { error } = await supabase.from('blood_requests').update({ status: 'cancelled' }).eq('id', request.id);
    if (error) {
      setErrorMessage(`Unable to cancel request: ${error.message}`);
      return;
    }
    setRequest({ ...request, status: 'cancelled' });
  };

  if (loading) {
    return <View style={styles.detailsScreen}><Text style={styles.authLoadingText}>Loading request...</Text></View>;
  }

  if (!request) {
    return <View style={styles.detailsScreen}><Text style={styles.profileErrorText}>{errorMessage || 'Unable to load request.'}</Text><Pressable style={styles.profilePrimaryButtonSmall} onPress={onBack}><Text style={styles.profilePrimaryButtonText}>Back to Requests</Text></Pressable></View>;
  }

  return (
    <View style={styles.detailsScreen}>
      <StatusBar style="dark" />

      <ScrollView style={styles.detailsScroll} contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsHeader}>
          <Pressable style={styles.detailsIconButton} onPress={onBack} accessibilityLabel="Go back to requests">
            <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
          </Pressable>
          <Text style={styles.detailsTitle}>Blood Request Details</Text>
          <Pressable style={styles.detailsIconButton} onPress={() => Alert.alert('More options', 'More request options will be connected later.')} accessibilityLabel="More options">
            <MaterialCommunityIcons name="dots-vertical" size={22} color="#191c1e" />
          </Pressable>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsTopRow}>
            <View style={styles.detailsBadgeRow}>
              <Text style={styles.urgentStatusBadge}>URGENT</Text>
              <Text style={styles.openStatusBadge}>{request.status.toUpperCase()}</Text>
            </View>
            <View style={styles.detailsBloodBadge}>
              <MaterialCommunityIcons name="water" size={20} color="#760009" />
              <Text style={styles.detailsBloodText}>{request.bloodGroup}</Text>
            </View>
          </View>
          <Text style={styles.detailsHeading}>Urgent Blood Request</Text>
          <Text style={styles.detailsMuted}>Immediate donor match requested for urgent transfusion at Kolkata center.</Text>
          <View style={styles.detailsMetricBar}>
            <View style={styles.detailsMetric}>
              <MaterialCommunityIcons name="water" size={20} color="#760009" />
              <View><Text style={styles.detailsLabel}>Required</Text><Text style={styles.detailsMetricValue}>{request.unitsRequired} Units</Text></View>
            </View>
            <View style={styles.detailsMetric}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#760009" />
              <View><Text style={styles.detailsLabel}>Deadline</Text><Text style={styles.detailsMetricValue}>{formatRequestDeadline(request)}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}><MaterialCommunityIcons name="account-alert" size={22} color="#760009" /><Text style={styles.detailsSectionTitle}>Patient Information</Text></View>
          <View style={styles.detailsGrid}>
            <View><Text style={styles.detailsLabel}>Patient Name</Text><Text style={styles.detailsValue}>{request.patientName}</Text></View>
            <View><Text style={styles.detailsLabel}>Blood Group</Text><Text style={styles.detailsAccentValue}>O Positive ({request.bloodGroup})</Text></View>
            <View><Text style={styles.detailsLabel}>Units Required</Text><Text style={styles.detailsValue}>{request.unitsRequired} Units</Text></View>
            <View><Text style={styles.detailsLabel}>Required By</Text><Text style={styles.detailsValue}>{formatRequestDeadline(request)}</Text></View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}><MaterialCommunityIcons name="hospital" size={22} color="#760009" /><Text style={styles.detailsSectionTitle}>Hospital Information</Text></View>
          <Text style={styles.detailsHospitalName}>{request.hospitalName}</Text>
          <Text style={styles.detailsMuted}><MaterialCommunityIcons name="map-marker" size={16} color="#760009" /> {[request.area, request.city].filter(Boolean).join(', ')}</Text>
          <View style={styles.approxLocationBox}><MaterialCommunityIcons name="map-marker-radius" size={24} color="#760009" /><Text style={styles.detailsMuted}>Approximate hospital location: Dhakuria, South Kolkata</Text></View>
          <Pressable style={styles.detailsSecondaryButton} onPress={() => Alert.alert('Hospital Location', 'A real map will be connected later.')}>
            <MaterialCommunityIcons name="map-outline" size={18} color="#760009" /><Text style={styles.detailsSecondaryText}>View Hospital Location</Text>
          </Pressable>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}>
            <MaterialCommunityIcons name="timeline" size={22} color="#760009" />
            <Text style={styles.detailsSectionTitle}>Request Timeline</Text>
            <Text style={styles.stepBadge}>{donorResponses.some((item) => item.status === 'accepted') ? 'Step 3 of 5' : 'Step 2 of 5'}</Text>
          </View>
          {[
            ['check', 'Request Created', 'Your blood request is open.', true],
            ['account-group', 'Donor Responses (' + donorResponses.length + ')', donorResponses.length ? 'Donor invitations and responses are shown below.' : 'No donor responses yet.', donorResponses.length > 0],
            ['heart-outline', 'Donor Accepted', donorResponses.some((item) => item.status === 'accepted') ? 'A donor has accepted. Hospital screening is still required.' : 'Waiting for a donor to accept.', donorResponses.some((item) => item.status === 'accepted')],
            ['circle-outline', 'Medical Screening', 'Pending hospital screening.', false],
            ['circle-outline', 'Donation Completed', 'Pending verified donation completion.', false],
          ].map(([icon, title, subtitle, active], index) => (
            <View key={title as string} style={styles.timelineRow}>
              <View style={[styles.timelineIcon, active ? styles.timelineIconActive : styles.timelineIconPending]}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={15} color={active ? '#ffffff' : '#59413e'} />
              </View>
              <View style={[styles.timelineCopy, active && index === 2 && styles.timelineActiveCopy]}>
                <Text style={[styles.detailsValue, active && index === 2 && styles.detailsAccentValue]}>{title as string}</Text>
                <Text style={styles.detailsLabel}>{subtitle as string}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}>
            <Text style={styles.detailsSectionTitle}>Donor Responses ({donorResponses.length})</Text>
            {donorResponses.some((item) => item.status === 'accepted') ? <Text style={styles.activeMatchBadge}>Accepted</Text> : null}
          </View>
          {donorResponses.length > 0 ? donorResponses.map((response, index) => (
            <View key={response.id} style={styles.donorResponseRow}>
              <View style={styles.donorInitials}><Text style={styles.donorInitialsText}>D{index + 1}</Text></View>
              <View style={styles.donorResponseInfo}>
                <Text style={styles.detailsValue}>Donor {index + 1}</Text>
                <Text style={styles.detailsLabel}>Donor identity and exact location remain protected.</Text>
              </View>
              <Text style={[styles.responseStatus, response.status === 'accepted' && styles.responseAccepted]}>{response.status}</Text>
            </View>
          )) : (
            <View style={styles.detailsInfoBox}>
              <MaterialCommunityIcons name="account-search-outline" size={22} color="#760009" />
              <View style={styles.detailsInfoCopy}>
                <Text style={styles.detailsValue}>No donor responses yet</Text>
                <Text style={styles.detailsMuted}>Use Find Donor to send requests to compatible available donors.</Text>
              </View>
            </View>
          )}
        </View>

        <Pressable style={styles.detailsPrimaryButton} onPress={onFindDonor}>
          <MaterialCommunityIcons name="account-search" size={22} color="#ffffff" />
          <Text style={styles.detailsPrimaryText}>Find Compatible Donors</Text>
        </Pressable>
        <Pressable style={styles.detailsSecondaryButton} onPress={() => Alert.alert('Donor Responses', 'Donor response actions will be connected later.')}><MaterialCommunityIcons name="account-group" size={18} color="#191c1e" /><Text style={styles.detailsSecondaryDarkText}>View Donor Responses</Text></Pressable>
        <View style={styles.detailsButtonRow}>
          <Pressable style={styles.detailsHalfButton} onPress={() => Alert.alert('Edit Request', 'Request editing will be connected later.')}><MaterialCommunityIcons name="pencil-outline" size={18} color="#191c1e" /><Text style={styles.detailsSecondaryDarkText}>Edit Request</Text></Pressable>
          <Pressable style={styles.detailsHalfButton} onPress={() => Alert.alert('Cancel Request', 'Are you sure you want to cancel this request?', [{ text: 'Keep Open', style: 'cancel' }, { text: 'Cancel Request', style: 'destructive', onPress: () => void cancelRequest() }])}><MaterialCommunityIcons name="close-circle-outline" size={18} color="#ba1a1a" /><Text style={styles.cancelText}>Cancel Request</Text></Pressable>
        </View>

        <View style={styles.detailsInfoBox}><MaterialCommunityIcons name="truck-outline" size={22} color="#760009" /><View style={styles.detailsInfoCopy}><Text style={styles.detailsValue}>Hospital Pickup Information</Text><Text style={styles.detailsMuted}>Pickup information is available only for verified hospitals or authorized partners in Kolkata.</Text></View></View>
        <View style={styles.detailsInfoBox}><MaterialCommunityIcons name="shield-check-outline" size={22} color="#760009" /><View style={styles.detailsInfoCopy}><Text style={styles.detailsValue}>BloodConnect Privacy Guarantee</Text><Text style={styles.detailsMuted}>Exact donor location and personal contact information are shared only with appropriate consent.</Text></View></View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home"><MaterialCommunityIcons name="home" size={20} color="#59413e" /><Text style={styles.bottomNavText}>Home</Text></Pressable>
        <Pressable style={[styles.bottomNavItem, styles.bottomNavItemActive]} onPress={onRequests} accessibilityLabel="Requests"><MaterialCommunityIcons name="water" size={20} color="#760009" /><Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Requests</Text></Pressable>
        <Pressable style={styles.bottomNavItem} onPress={onProfile} accessibilityLabel="Profile"><MaterialCommunityIcons name="account" size={20} color="#59413e" /><Text style={styles.bottomNavText}>Profile</Text></Pressable>
      </View>
    </View>
  );
}

type ProfileData = {
  name: string;
  phone: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  area: string;
  donorAvailable: boolean;
};

type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function ProfileScreen({
  onHome,
  onRequests,
  onSignOut,
}: {
  onHome: () => void;
  onRequests: () => void;
  onSignOut: () => Promise<void>;
}) {
  const { user, createProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draftProfile, setDraftProfile] = useState<ProfileData>({
    name: '',
    phone: '',
    bloodGroup: 'O+',
    dateOfBirth: '',
    gender: '',
    city: '',
    area: '',
    donorAvailable: false,
  });
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [draftContact, setDraftContact] = useState<EmergencyContact>({ name: '', phone: '', relationship: '' });
  const [contactVisible, setContactVisible] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableToDonate, setAvailableToDonate] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [logoutVisible, setLogoutVisible] = useState(false);

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError('');

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setProfileError(userError?.message || 'Your authenticated user could not be found.');
      setProfileLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, blood_group, date_of_birth, gender, city, area, donor_available, emergency_contact_name, emergency_contact_phone')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (error) {
      setProfileError(`Unable to load your profile: ${error.message}`);
      setProfileLoading(false);
      return;
    }

    if (!data) {
      setProfileError('Your profile record could not be found. Please sign out and create your profile again.');
      setProfileLoading(false);
      return;
    }

    const nextProfile: ProfileData = {
      name: data.full_name || 'BloodConnect User',
      phone: data.phone || '',
      bloodGroup: data.blood_group || 'O+',
      dateOfBirth: data.date_of_birth || '',
      gender: data.gender || '',
      city: data.city || 'Kolkata',
      area: data.area || 'West Bengal',
      donorAvailable: data.donor_available ?? false,
    };
    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    setAvailableToDonate(nextProfile.donorAvailable);
    setEmergencyContact(
      data.emergency_contact_name || data.emergency_contact_phone
        ? {
            name: data.emergency_contact_name || '',
            phone: data.emergency_contact_phone || '',
            relationship: '',
          }
        : null,
    );
    setProfileLoading(false);
  };

  useEffect(() => {
    if (user) void loadProfile();
  }, [user]);

  const updateProfileRow = async (updates: Record<string, string | boolean | null>) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error(userError?.message || 'Your authenticated user could not be found.');
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', userData.user.id);
    if (error) throw new Error(error.message);
  };

  const openEditProfile = () => {
    if (profile) setDraftProfile(profile);
    setEditProfileVisible(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setProfileError('');
    try {
      await updateProfileRow({
        full_name: draftProfile.name.trim(),
        phone: draftProfile.phone.trim() || null,
        blood_group: draftProfile.bloodGroup,
        date_of_birth: draftProfile.dateOfBirth.trim() || null,
        gender: draftProfile.gender.trim() || null,
        city: draftProfile.city.trim() || null,
        area: draftProfile.area.trim() || null,
      });
      setProfile({ ...draftProfile, donorAvailable: availableToDonate });
      setEditProfileVisible(false);
    } catch (error) {
      setProfileError(`Unable to save your profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const openEmergencyContact = () => {
    setDraftContact(emergencyContact || { name: '', phone: '', relationship: '' });
    setContactVisible(true);
  };

  const saveEmergencyContact = async () => {
    if (!draftContact.name.trim() || !draftContact.phone.trim() || !draftContact.relationship.trim()) {
      Alert.alert('Missing details', 'Please complete all emergency contact fields.');
      return;
    }
    setSaving(true);
    setProfileError('');
    try {
      await updateProfileRow({
        emergency_contact_name: draftContact.name.trim(),
        emergency_contact_phone: draftContact.phone.trim(),
      });
      setEmergencyContact(draftContact);
      setContactVisible(false);
    } catch (error) {
      setProfileError(`Unable to save emergency contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateAvailability = async (nextValue: boolean) => {
    if (!profile) return;
    setAvailableToDonate(nextValue);
    setProfileError('');
    try {
      await updateProfileRow({ donor_available: nextValue });
      setProfile({ ...profile, donorAvailable: nextValue });
    } catch (error) {
      setAvailableToDonate(profile.donorAvailable);
      setProfileError(`Unable to update availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createMissingProfile = async () => {
    setSaving(true);
    setProfileError('');
    const fallbackName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'BloodConnect User';
    const result = await createProfile({ fullName: fallbackName, bloodGroup: 'O+' });
    if (result.error) {
      setProfileError(`Unable to create your profile: ${result.error.message}`);
    } else {
      await loadProfile();
    }
    setSaving(false);
  };

  if (profileLoading) {
    return (
      <View style={styles.profileScreen}>
        <Text style={styles.authLoadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.profileScreen}>
        <Text style={styles.profileErrorText}>{profileError || 'Unable to load your profile.'}</Text>
        <Pressable style={styles.profilePrimaryButtonSmall} onPress={() => void createMissingProfile()} disabled={saving}>
          <Text style={styles.profilePrimaryButtonText}>{saving ? 'Creating Profile...' : 'Create Profile'}</Text>
        </Pressable>
      </View>
    );
  }

  const showComingSoon = (title: string) => {
    Alert.alert(title, 'Coming soon - this feature will be connected later.');
  };

  return (
    <View style={styles.profileScreen}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.profileScroll}
        contentContainerStyle={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        {profileError ? <Text style={styles.profileErrorText}>{profileError}</Text> : null}
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <MaterialCommunityIcons name="account" size={48} color="#59413e" />
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.profileLocationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#59413e" />
            <Text style={styles.profileMutedText}>{[profile.city, profile.area].filter(Boolean).join(', ')}</Text>
          </View>
          <View style={styles.profileBadgeRow}>
            <View style={styles.profileBloodBadge}>
              <MaterialCommunityIcons name="water" size={16} color="#93000a" />
              <Text style={styles.profileBloodText}>{profile.bloodGroup}</Text>
            </View>
            <View style={styles.profileAvailabilityBadge}>
              <View style={styles.profileOnlineDot} />
              <Text style={styles.profileAvailabilityText}>
                {availableToDonate ? 'Available to Donate' : 'Currently Unavailable'}
              </Text>
            </View>
          </View>
          <Pressable style={styles.profileOutlineButton} onPress={openEditProfile}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#760009" />
            <Text style={styles.profileOutlineButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardHeadingRow}>
            <View style={styles.profileHeadingCopy}>
              <Text style={styles.profileSectionTitle}>Donor Availability</Text>
              <Text style={styles.profileMutedText}>Let people nearby know that you may be available to help.</Text>
            </View>
            <Switch
              value={availableToDonate}
              onValueChange={updateAvailability}
              trackColor={{ false: '#d9dfe4', true: '#760009' }}
              thumbColor="#ffffff"
            />
          </View>
          <Text style={styles.profileFinePrint}>You can change your availability anytime.</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Blood Information</Text>
          <View style={styles.profileInfoRows}>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Blood Group</Text>
              <Text style={styles.profileAccentText}>{profile.bloodGroup}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Last Donation</Text>
              <Text style={styles.profileValueText}>Not added yet</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Date of Birth</Text>
              <Text style={styles.profileValueText}>{profile.dateOfBirth || 'Not added yet'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Gender</Text>
              <Text style={styles.profileValueText}>{profile.gender || 'Not added yet'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Eligible to Donate</Text>
              <Text style={styles.profileSuccessPill}>Based on last donation</Text>
            </View>
          </View>
          <Pressable style={styles.profilePrimaryButton} onPress={openEditProfile}>
            <MaterialCommunityIcons name="update" size={18} color="#ffffff" />
            <Text style={styles.profilePrimaryButtonText}>Update Information</Text>
          </Pressable>
        </View>

        <View>
          <Text style={[styles.profileSectionTitle, styles.profileActivityHeading]}>My Activity</Text>
          <View style={styles.profileActivityGrid}>
            {[
              { icon: 'water', value: '2', label: 'Active requests' },
              { icon: 'hand-heart', value: '3', label: 'Donations' },
              { icon: 'heart', value: '5', label: 'People helped' },
            ].map((item) => (
              <View key={item.label} style={styles.profileActivityCard}>
                <View style={styles.profileActivityIcon}>
                  <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#760009" />
                </View>
                <Text style={styles.profileActivityValue}>{item.value}</Text>
                <Text style={styles.profileActivityLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardHeadingRow}>
            <Text style={styles.profileSectionTitle}>My Blood Requests</Text>
            <Text style={styles.profileStatusPill}>Active</Text>
          </View>
          <View style={styles.profileRequestPreview}>
            <View style={styles.profileRequestTopRow}>
              <Text style={styles.profileRequestBlood}>{profile.bloodGroup}</Text>
              <Text style={styles.profileRequestUnits}>2 units required</Text>
            </View>
            <View style={styles.profileLocationRow}>
              <MaterialCommunityIcons name="hospital" size={16} color="#59413e" />
              <Text style={styles.profileMutedText}>AMRI Hospital, Kolkata</Text>
            </View>
          </View>
          <View style={styles.profileButtonRow}>
            <Pressable style={styles.profilePrimaryButtonSmall} onPress={() => Alert.alert('Blood Request', 'Request details will be connected later.')}>
              <Text style={styles.profilePrimaryButtonText}>View Request</Text>
            </Pressable>
            <Pressable style={styles.profileSecondaryButton} onPress={onRequests}>
              <Text style={styles.profileSecondaryButtonText}>View All</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Contact &amp; Privacy</Text>
          {[
              ['phone', 'Phone Number', profile.phone || '••••••••••'],
            ['message-text', 'WhatsApp', 'Connected'],
            ['map-marker', 'Location Sharing', 'Only after acceptance'],
            ['lock', 'Privacy Settings', 'Manage'],
          ].map(([icon, label, value]) => (
            <Pressable key={label} style={styles.profileSettingRow} onPress={() => showComingSoon(label)}>
              <View style={styles.profileSettingLabel}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#59413e" />
                <Text style={styles.profileValueText}>{label}</Text>
              </View>
              <View style={styles.profileSettingValue}>
                <Text style={label === 'WhatsApp' ? styles.profileConnectedText : styles.profileMutedText}>{value}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#59413e" />
              </View>
            </Pressable>
          ))}
          <Text style={styles.profilePrivacyNote}>Exact location is shared only when you explicitly approve it.</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Emergency Contact</Text>
          <Text style={styles.profileMutedText}>Add a trusted family member who can be contacted during an emergency.</Text>
          {emergencyContact ? (
            <View style={styles.profileContactSummary}>
              <Text style={styles.profileValueText}>{emergencyContact.name}</Text>
              <Text style={styles.profileMutedText}>{emergencyContact.relationship} • {emergencyContact.phone}</Text>
            </View>
          ) : null}
          <Pressable style={styles.profileOutlineButton} onPress={openEmergencyContact}>
            <MaterialCommunityIcons name="account-plus-outline" size={18} color="#760009" />
            <Text style={styles.profileOutlineButtonText}>{emergencyContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Donation History</Text>
          {[
            ['March 2026', 'Blood donation at AMRI Hospital'],
            ['December 2025', 'Blood donation at City Blood Bank'],
          ].map(([date, description]) => (
            <View key={date} style={styles.profileHistoryRow}>
              <View style={styles.profileHistoryDot} />
              <View>
                <Text style={styles.profileAccentText}>{date}</Text>
                <Text style={styles.profileValueText}>{description}</Text>
                <Text style={styles.profileConnectedText}>Status: Completed</Text>
              </View>
            </View>
          ))}
          <Pressable style={styles.profileSecondaryButtonFull} onPress={() => Alert.alert('Donation History', 'Full history will be connected later.')}>
            <Text style={styles.profileSecondaryButtonText}>View Full History</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Settings</Text>
          {[
            ['bell-outline', 'Notifications'],
            ['shield-check-outline', 'Privacy'],
            ['crosshairs-gps', 'Location Permissions'],
            ['message-text-outline', 'WhatsApp Preferences'],
            ['help-circle-outline', 'Help & Support'],
            ['information-outline', 'About BloodConnect'],
          ].map(([icon, label]) => (
            <Pressable key={label} style={styles.profileSettingRow} onPress={() => showComingSoon(label)}>
              <View style={styles.profileSettingLabel}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#59413e" />
                <Text style={styles.profileValueText}>{label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#59413e" />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.profileLogoutButton} onPress={() => setLogoutVisible(true)}>
          <MaterialCommunityIcons name="logout" size={18} color="#ba1a1a" />
          <Text style={styles.profileLogoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editProfileVisible} transparent animationType="slide" onRequestClose={() => setEditProfileVisible(false)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Edit Profile</Text>
            <Text style={styles.profileModalLabel}>Name</Text>
            <TextInput
              value={draftProfile.name}
              onChangeText={(name) => setDraftProfile((current) => ({ ...current, name }))}
              placeholder="Your name"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Phone number</Text>
            <TextInput
              value={draftProfile.phone}
              onChangeText={(phone) => setDraftProfile((current) => ({ ...current, phone }))}
              placeholder="Your phone number"
              placeholderTextColor="#8d706d"
              keyboardType="phone-pad"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>City</Text>
            <TextInput
              value={draftProfile.city}
              onChangeText={(city) => setDraftProfile((current) => ({ ...current, city }))}
              placeholder="City"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Area</Text>
            <TextInput
              value={draftProfile.area}
              onChangeText={(area) => setDraftProfile((current) => ({ ...current, area }))}
              placeholder="Area or locality"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Date of birth</Text>
            <TextInput
              value={draftProfile.dateOfBirth}
              onChangeText={(dateOfBirth) => setDraftProfile((current) => ({ ...current, dateOfBirth }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Gender</Text>
            <TextInput
              value={draftProfile.gender}
              onChangeText={(gender) => setDraftProfile((current) => ({ ...current, gender }))}
              placeholder="Gender"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Blood group</Text>
            <View style={styles.profileBloodGrid}>
              {bloodGroups.map((group) => (
                <Pressable
                  key={group}
                  onPress={() => setDraftProfile((current) => ({ ...current, bloodGroup: group }))}
                  style={[styles.profileBloodChoice, draftProfile.bloodGroup === group && styles.profileBloodChoiceSelected]}
                >
                  <Text style={[styles.profileBloodChoiceText, draftProfile.bloodGroup === group && styles.profileBloodChoiceTextSelected]}>
                    {group}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.profileModalActions}>
              <Pressable style={styles.profileModalCancel} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.profileModalSave} onPress={saveProfile}>
                <Text style={styles.profileModalSaveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={contactVisible} transparent animationType="slide" onRequestClose={() => setContactVisible(false)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Emergency Contact</Text>
            <Text style={styles.profileModalLabel}>Name</Text>
            <TextInput
              value={draftContact.name}
              onChangeText={(name) => setDraftContact((current) => ({ ...current, name }))}
              placeholder="Contact name"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Phone number</Text>
            <TextInput
              value={draftContact.phone}
              onChangeText={(phone) => setDraftContact((current) => ({ ...current, phone }))}
              placeholder="Contact phone number"
              placeholderTextColor="#8d706d"
              keyboardType="phone-pad"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Relationship</Text>
            <TextInput
              value={draftContact.relationship}
              onChangeText={(relationship) => setDraftContact((current) => ({ ...current, relationship }))}
              placeholder="For example, sibling"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <View style={styles.profileModalActions}>
              <Pressable style={styles.profileModalCancel} onPress={() => setContactVisible(false)}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.profileModalSave} onPress={saveEmergencyContact}>
                <Text style={styles.profileModalSaveText}>{saving ? 'Saving...' : 'Save Contact'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={logoutVisible} transparent animationType="fade" onRequestClose={() => setLogoutVisible(false)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Log Out</Text>
            <Text style={styles.profileMutedText}>Are you sure you want to log out?</Text>
            {profileError ? <Text style={styles.profileErrorText}>{profileError}</Text> : null}
            <View style={styles.profileModalActions}>
              <Pressable style={styles.profileModalCancel} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.profileModalSave}
                onPress={async () => {
                  setProfileError('');
                  try {
                    await onSignOut();
                    setLogoutVisible(false);
                  } catch (error) {
                    setProfileError(`Unable to log out: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                <Text style={styles.profileModalSaveText}>Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  const { user } = useAuth();
  const [selectedBlood, setSelectedBlood] = useState('O+');
  const [units, setUnits] = useState(2);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('Kolkata, West Bengal');
  const [phone, setPhone] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!patientName.trim() || !hospitalName.trim() || !location.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please complete the patient, hospital and contact information.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in to create a blood request.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const locationParts = location.split(',').map((part) => part.trim()).filter(Boolean);
    const { error } = await supabase.from('blood_requests').insert({
      requester_id: user.id,
      patient_name: patientName.trim(),
      blood_group: selectedBlood,
      units_required: units,
      hospital_name: hospitalName.trim(),
      hospital_address: location.trim(),
      city: locationParts[0] || location.trim(),
      area: locationParts.slice(1).join(', ') || null,
      latitude: null,
      longitude: null,
      required_date: null,
      required_time: null,
      is_emergency: emergencyMode,
      contact_phone: phone.trim(),
      status: 'open',
    });

    if (error) {
      setErrorMessage(`Unable to submit blood request: ${error.message}`);
      setSaving(false);
      return;
    }

    setPatientName('');
    setHospitalName('');
    setLocation('Kolkata, West Bengal');
    setPhone('');
    setSelectedBlood('O+');
    setUnits(2);
    setEmergencyMode(true);
    setSaving(false);
    Alert.alert('Request submitted', 'Your blood request has been saved.', [{ text: 'View Requests', onPress: onRequests }]);
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
          {errorMessage ? <Text style={styles.profileErrorText}>{errorMessage}</Text> : null}
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
              <Text style={styles.submitButtonText}>{saving ? 'Submitting...' : 'Submit Blood Request'}</Text>
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
  authLoadingText: {
    color: '#59413e',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
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
  findDonorScreen: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  findDonorHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  findDonorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  findDonorHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  findDonorHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eceef0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDonorScroll: {
    flex: 1,
  },
  findDonorContent: {
    paddingHorizontal: 24,
    paddingBottom: 112,
  },
  findDonorSubtitle: {
    color: '#59413e',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  findDonorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#991b1b',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  findDonorLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  findDonorLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  findDonorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDonorLabel: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
  },
  findDonorLocation: {
    color: '#191c1e',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  findDonorChange: {
    color: '#760009',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  findDonorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  findDonorMeta: {
    color: '#59413e',
    fontSize: 13,
    lineHeight: 18,
  },
  findDonorActive: {
    color: '#760009',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eceef0',
  },
  filterChipSelected: {
    backgroundColor: '#991b1b',
  },
  filterChipText: {
    color: '#191c1e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#ffaaa1',
    fontWeight: '700',
  },
  findDonorSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  findDonorSectionTitle: {
    color: '#191c1e',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  bloodChoiceRow: {
    gap: 10,
    paddingBottom: 8,
  },
  bloodChoice: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bloodChoiceSelected: {
    backgroundColor: '#991b1b',
  },
  bloodChoiceText: {
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  bloodChoiceTextSelected: {
    color: '#ffaaa1',
  },
  compatibilityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8dcdc',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  compatibilityText: {
    flex: 1,
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  smallFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 1,
  },
  smallFilterText: {
    color: '#191c1e',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  findDonorResults: {
    marginBottom: 20,
  },
  findDonorResultsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  updatedText: {
    color: '#760009',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  donorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#991b1b',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  donorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eceef0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  donorInfo: {
    flex: 1,
  },
  donorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donorName: {
    color: '#191c1e',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  donorBlood: {
    color: '#ffaaa1',
    backgroundColor: '#991b1b',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  donorMeta: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 17,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    color: '#760009',
    backgroundColor: '#ffdad6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  privacyText: {
    flex: 1,
    color: '#59413e',
    fontSize: 11,
    lineHeight: 16,
  },
  donorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  donorActionButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: '#eceef0',
  },
  donorActionText: {
    color: '#191c1e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  donorRequestButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#991b1b',
  },
  donorRequestText: {
    color: '#ffaaa1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  donorEmptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  donorEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  donorRequestButtonFull: {
    width: '100%',
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#991b1b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  profileScreen: { flex: 1, backgroundColor: '#f7f9fb' },
  profileScroll: { flex: 1 },
  profileContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 112, gap: 16 },
  profileHero: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#991b1b', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  profileAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#eceef0', borderWidth: 5, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  profileName: { color: '#191c1e', fontSize: 24, lineHeight: 32, fontWeight: '600', marginBottom: 4 },
  profileLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  profileMutedText: { color: '#59413e', fontSize: 13, lineHeight: 19 },
  profileBadgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 },
  profileBloodBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  profileBloodText: { color: '#93000a', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  profileAvailabilityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eceef0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  profileOnlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  profileAvailabilityText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  profileOutlineButton: { width: '100%', minHeight: 46, borderRadius: 999, borderWidth: 1, borderColor: '#760009', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  profileOutlineButtonText: { color: '#760009', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#991b1b', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  profileCardHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  profileHeadingCopy: { flex: 1 },
  profileSectionTitle: { color: '#191c1e', fontSize: 20, lineHeight: 28, fontWeight: '600', marginBottom: 4 },
  profileFinePrint: { color: '#59413e', fontSize: 12, lineHeight: 16, opacity: 0.8 },
  profileInfoRows: { gap: 4, marginVertical: 10 },
  profileInfoRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  profileAccentText: { color: '#760009', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  profileValueText: { color: '#191c1e', fontSize: 13, lineHeight: 19, fontWeight: '500' },
  profileSuccessPill: { color: '#166534', backgroundColor: '#f0fdf4', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, lineHeight: 16, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  profilePrimaryButton: { minHeight: 46, borderRadius: 999, backgroundColor: '#760009', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  profilePrimaryButtonText: { color: '#ffffff', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  profileActivityHeading: { marginLeft: 4, marginBottom: 10 },
  profileActivityGrid: { flexDirection: 'row', gap: 8 },
  profileActivityCard: { flex: 1, minHeight: 126, backgroundColor: '#ffffff', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#991b1b', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  profileActivityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  profileActivityValue: { color: '#191c1e', fontSize: 20, lineHeight: 28, fontWeight: '600' },
  profileActivityLabel: { color: '#59413e', fontSize: 11, lineHeight: 15, textAlign: 'center' },
  profileStatusPill: { color: '#93000a', backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  profileRequestPreview: { backgroundColor: '#f2f4f6', borderRadius: 14, padding: 14, marginVertical: 8 },
  profileRequestTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  profileRequestBlood: { color: '#ffffff', backgroundColor: '#760009', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  profileRequestUnits: { color: '#191c1e', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  profileButtonRow: { flexDirection: 'row', gap: 8 },
  profilePrimaryButtonSmall: { flex: 1, minHeight: 42, borderRadius: 999, backgroundColor: '#760009', alignItems: 'center', justifyContent: 'center' },
  profileSecondaryButton: { flex: 1, minHeight: 42, borderRadius: 999, borderWidth: 1, borderColor: '#8d706d', alignItems: 'center', justifyContent: 'center' },
  profileSecondaryButtonText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  profileSettingRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: '#eceef0' },
  profileSettingLabel: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  profileSettingValue: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '55%' },
  profileConnectedText: { color: '#166534', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  profilePrivacyNote: { color: '#59413e', fontSize: 11, lineHeight: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eceef0' },
  profileHistoryRow: { position: 'relative', flexDirection: 'row', gap: 12, paddingLeft: 8, paddingBottom: 16, marginLeft: 4, borderLeftWidth: 2, borderLeftColor: '#e0e3e5' },
  profileHistoryDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#760009', borderWidth: 2, borderColor: '#ffffff', position: 'absolute', left: -6, top: 2 },
  profileSecondaryButtonFull: { minHeight: 44, borderRadius: 999, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  profileContactSummary: { backgroundColor: '#f2f4f6', borderRadius: 12, padding: 12, marginVertical: 12, gap: 3 },
  profileLogoutButton: { minHeight: 46, borderRadius: 999, borderWidth: 1, borderColor: '#ba1a1a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  profileLogoutText: { color: '#ba1a1a', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  profileErrorText: { color: '#ba1a1a', backgroundColor: '#ffdad6', borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 18 },
  detailsScreen: { flex: 1, backgroundColor: '#f7f9fb' },
  detailsScroll: { flex: 1 },
  detailsContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 112, gap: 14 },
  detailsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  detailsIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', elevation: 1 },
  detailsTitle: { color: '#191c1e', fontSize: 20, lineHeight: 28, fontWeight: '600' },
  detailsCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#991b1b', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  detailsTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  detailsBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentStatusBadge: { color: '#93000a', backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  openStatusBadge: { color: '#59413e', backgroundColor: '#eceef0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  detailsBloodBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  detailsBloodText: { color: '#760009', fontSize: 18, lineHeight: 24, fontWeight: '700' },
  detailsHeading: { color: '#191c1e', fontSize: 24, lineHeight: 32, fontWeight: '600', marginBottom: 4 },
  detailsMuted: { color: '#59413e', fontSize: 13, lineHeight: 19 },
  detailsMetricBar: { flexDirection: 'row', gap: 12, backgroundColor: '#f2f4f6', borderRadius: 14, padding: 12, marginTop: 16 },
  detailsMetric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailsLabel: { color: '#59413e', fontSize: 11, lineHeight: 16 },
  detailsMetricValue: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  detailsSectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  detailsSectionTitle: { flex: 1, color: '#191c1e', fontSize: 20, lineHeight: 28, fontWeight: '600' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  detailsValue: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  detailsAccentValue: { color: '#760009', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  detailsHospitalName: { color: '#191c1e', fontSize: 18, lineHeight: 26, fontWeight: '600', marginBottom: 4 },
  approxLocationBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f2f4f6', borderRadius: 12, padding: 12, marginTop: 14, marginBottom: 12 },
  detailsSecondaryButton: { minHeight: 44, borderRadius: 999, backgroundColor: '#f2f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  detailsSecondaryText: { color: '#760009', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  stepBadge: { color: '#760009', backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, lineHeight: 15, fontWeight: '700' },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timelineIconActive: { backgroundColor: '#760009' },
  timelineIconPending: { backgroundColor: '#e0e3e5' },
  timelineCopy: { flex: 1, paddingTop: 3 },
  timelineActiveCopy: { backgroundColor: '#f2f4f6', borderRadius: 10, padding: 8, marginTop: -4 },
  activeMatchBadge: { color: '#760009', backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, lineHeight: 15, fontWeight: '700' },
  donorResponseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f2f4f6', borderRadius: 12, padding: 10, marginBottom: 8 },
  donorInitials: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#991b1b', alignItems: 'center', justifyContent: 'center' },
  donorInitialsText: { color: '#ffaaa1', fontSize: 12, fontWeight: '700' },
  donorResponseInfo: { flex: 1 },
  responseBlood: { color: '#760009', backgroundColor: '#ffdad6', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, fontWeight: '700' },
  responseStatus: { color: '#59413e', backgroundColor: '#e0e3e5', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '600' },
  responseAccepted: { color: '#ffffff', backgroundColor: '#760009' },
  detailsPrimaryButton: { minHeight: 54, borderRadius: 999, backgroundColor: '#760009', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  detailsPrimaryText: { color: '#ffffff', fontSize: 16, lineHeight: 22, fontWeight: '700' },
  detailsSecondaryDarkText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  detailsButtonRow: { flexDirection: 'row', gap: 10 },
  detailsHalfButton: { flex: 1, minHeight: 44, borderRadius: 999, backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, elevation: 1 },
  cancelText: { color: '#ba1a1a', fontSize: 12, lineHeight: 17, fontWeight: '700' },
  detailsInfoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#ffffff', borderRadius: 16, padding: 14, elevation: 1 },
  detailsInfoCopy: { flex: 1, gap: 3 },
  profileModalBackdrop: { flex: 1, backgroundColor: 'rgba(25, 28, 30, 0.42)', justifyContent: 'flex-end' },
  profileModalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
  profileModalTitle: { color: '#191c1e', fontSize: 24, lineHeight: 32, fontWeight: '600', marginBottom: 8 },
  profileModalLabel: { color: '#59413e', fontSize: 13, lineHeight: 18, fontWeight: '600', marginTop: 4 },
  profileModalInput: { backgroundColor: '#f2f4f6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#191c1e', fontSize: 15, lineHeight: 21 },
  profileBloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  profileBloodChoice: { width: '22%', minHeight: 40, borderRadius: 10, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
  profileBloodChoiceSelected: { backgroundColor: '#760009' },
  profileBloodChoiceText: { color: '#191c1e', fontSize: 13, lineHeight: 18, fontWeight: '600' },
  profileBloodChoiceTextSelected: { color: '#ffffff' },
  profileModalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  profileModalCancel: { flex: 1, minHeight: 46, borderRadius: 999, backgroundColor: '#eceef0', alignItems: 'center', justifyContent: 'center' },
  profileModalCancelText: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  profileModalSave: { flex: 1, minHeight: 46, borderRadius: 999, backgroundColor: '#760009', alignItems: 'center', justifyContent: 'center' },
  profileModalSaveText: { color: '#ffffff', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  acceptedCard: {
    backgroundColor: '#f8dcdc',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  acceptedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  acceptedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmedBadge: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  acceptedText: {
    color: '#191c1e',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  acceptedActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  acceptedAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 64,
  },
  acceptedActionText: {
    color: '#191c1e',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  locationPrivacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  locationPrivacyText: {
    flex: 1,
    color: '#59413e',
    fontSize: 11,
    lineHeight: 16,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
  },
  pickupTextWrap: {
    flex: 1,
  },
  pickupTitle: {
    color: '#191c1e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  requestPickupButton: {
    backgroundColor: '#991b1b',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  requestPickupText: {
    color: '#ffaaa1',
    fontSize: 11,
    lineHeight: 16,
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
  mockRequestCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginHorizontal: 24, shadowColor: '#991b1b', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  mockRequestTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  mockRequestBloodBadge: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center' },
  mockRequestBloodText: { color: '#760009', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  mockRequestCopy: { flex: 1, gap: 3 },
  mockRequestStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mockRequestPatient: { color: '#191c1e', fontSize: 18, lineHeight: 26, fontWeight: '600' },
  mockRequestHint: { color: '#760009', fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 12 },
});

function AppContent() {
  const { session, loading, signIn, signUp, signOut } = useAuth();
  const [screen, setScreen] = useState<'home' | 'request' | 'requests' | 'requestDetails' | 'profile' | 'findDonor'>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.authLoadingText}>Loading BloodConnect...</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen signIn={signIn} signUp={signUp} />;
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        onRequestBlood={() => setScreen('request')}
        onFindDonor={() => setScreen('findDonor')}
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
    return (
      <RequestsScreen
        onHome={() => setScreen('home')}
        onProfile={() => setScreen('profile')}
        onRequestDetails={(requestId) => {
          setSelectedRequestId(requestId);
          setScreen('requestDetails');
        }}
      />
    );
  }

  if (screen === 'requestDetails') {
    return (
      <BloodRequestDetailsScreen
        onBack={() => setScreen('requests')}
        onHome={() => setScreen('home')}
        onRequests={() => setScreen('requests')}
        onProfile={() => setScreen('profile')}
        onFindDonor={() => setScreen('findDonor')}
        requestId={selectedRequestId || ''}
      />
    );
  }

  if (screen === 'findDonor') {
    return (
      <FindDonorScreen
        onBack={() => setScreen('home')}
        onHome={() => setScreen('home')}
        onRequests={() => setScreen('requests')}
        onProfile={() => setScreen('profile')}
      />
    );
  }

  return (
    <ProfileScreen
      onHome={() => setScreen('home')}
      onRequests={() => setScreen('requests')}
      onSignOut={async () => {
        const result = await signOut();
        if (result.error) throw result.error;
        setScreen('home');
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
