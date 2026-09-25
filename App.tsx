import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './utils/supabase';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { DonationWorkflowCard } from './components/DonationWorkflowCard';
import { NotificationsScreen } from './components/NotificationsScreen';
import { openAppSettings, openExternalUrl, showMessage } from './utils/interaction';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}


type IncomingDonorRequest = {
  responseId: string;
  requestId: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  city: string;
  area: string;
  requiredDate: string | null;
  requiredTime: string | null;
  isEmergency: boolean;
  requestStatus: string;
  responseStatus: string;
  createdAt: string;
};

type IncomingDonorRequestRow = {
  response_id: string; request_id: string; patient_name: string; blood_group: string;
  units_required: number; hospital_name: string; city: string; area: string;
  required_date: string | null; required_time: string | null; is_emergency: boolean;
  request_status: string; response_status: string; created_at: string;
};

const mapIncomingRequest = (row: IncomingDonorRequestRow): IncomingDonorRequest => ({
  responseId: row.response_id, requestId: row.request_id, patientName: row.patient_name,
  bloodGroup: row.blood_group, unitsRequired: row.units_required, hospitalName: row.hospital_name,
  city: row.city, area: row.area, requiredDate: row.required_date, requiredTime: row.required_time,
  isEmergency: row.is_emergency, requestStatus: row.request_status,
  responseStatus: row.response_status, createdAt: row.created_at,
});

type OpenBloodRequest = {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  hospitalName: string;
  city: string;
  area: string;
  requiredDate: string | null;
  requiredTime: string | null;
  isEmergency: boolean;
  status: string;
  createdAt: string;
};

type OpenBloodRequestRow = {
  id: string; patient_name: string; blood_group: string; units_required: number; hospital_name: string;
  city: string; area: string | null; required_date: string | null; required_time: string | null;
  is_emergency: boolean; status: string; created_at: string;
};

const mapOpenBloodRequest = (row: OpenBloodRequestRow): OpenBloodRequest => ({
  id: row.id, patientName: row.patient_name, bloodGroup: row.blood_group, unitsRequired: row.units_required,
  hospitalName: row.hospital_name, city: row.city, area: row.area || '',
  requiredDate: row.required_date, requiredTime: row.required_time,
  isEmergency: row.is_emergency, status: row.status, createdAt: row.created_at,
});

interface KolkataHeroSlide {
  source: ImageSourcePropType;
  landmark: string;
  neighborhood: string;
}

const KOLKATA_HERO_SLIDES: KolkataHeroSlide[] = [
  {
    source: require('./assets/kolkata_1.jpg'),
    landmark: 'Heritage Tramways',
    neighborhood: 'Esplanade • Kolkata',
  },
  {
    source: require('./assets/kolkata_2.jpg'),
    landmark: 'Vidyasagar Setu',
    neighborhood: 'Hooghly River • Kolkata',
  },
  {
    source: require('./assets/kolkata_3.jpg'),
    landmark: 'Victoria Memorial',
    neighborhood: 'Twilight Reflections • Kolkata',
  },
  {
    source: require('./assets/kolkata_4.jpg'),
    landmark: 'Victoria Memorial',
    neighborhood: 'Heritage Grounds • Kolkata',
  },
  {
    source: require('./assets/kolkata_5.jpg'),
    landmark: 'Howrah Bridge',
    neighborhood: 'Rabindra Setu • Kolkata',
  },
  {
    source: require('./assets/kolkata_6.jpg'),
    landmark: 'Iconic Yellow Cabs',
    neighborhood: 'City of Joy • Kolkata',
  },
];

function KolkataHeroBanner() {
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [slotAIndex, setSlotAIndex] = useState(0);
  const [slotBIndex, setSlotBIndex] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const activeSlotRef = useRef<'A' | 'B'>('A');
  activeSlotRef.current = activeSlot;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      opacityA.stopAnimation();
      opacityB.stopAnimation();
      scaleA.stopAnimation();
      scaleB.stopAnimation();
    };
  }, [opacityA, opacityB, scaleA, scaleB]);

  const goToSlide = (nextIndex: number) => {
    if (!isMountedRef.current || isTransitioningRef.current) return;
    if (nextIndex === currentIndexRef.current) return;

    isTransitioningRef.current = true;
    const curSlot = activeSlotRef.current;

    if (curSlot === 'A') {
      setSlotBIndex(nextIndex);
      opacityB.setValue(0);
      scaleB.setValue(1.03);

      Animated.parallel([
        Animated.timing(opacityB, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityA, {
          toValue: 0,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleB, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start((result) => {
        if (!isMountedRef.current) return;
        if (result.finished) {
          setActiveSlot('B');
          setCurrentIndex(nextIndex);
          isTransitioningRef.current = false;
        }
      });
    } else {
      setSlotAIndex(nextIndex);
      opacityA.setValue(0);
      scaleA.setValue(1.03);

      Animated.parallel([
        Animated.timing(opacityA, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityB, {
          toValue: 0,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleA, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start((result) => {
        if (!isMountedRef.current) return;
        if (result.finished) {
          setActiveSlot('A');
          setCurrentIndex(nextIndex);
          isTransitioningRef.current = false;
        }
      });
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current || isTransitioningRef.current) return;
      const next = (currentIndexRef.current + 1) % KOLKATA_HERO_SLIDES.length;
      goToSlide(next);
    }, 5500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, activeSlot]);

  const handleDotPress = (idx: number) => {
    if (idx === currentIndex || isTransitioningRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    goToSlide(idx);
  };

  const currentSlide = KOLKATA_HERO_SLIDES[currentIndex] || KOLKATA_HERO_SLIDES[0];

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCarouselContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.heroCarouselSlide,
            {
              opacity: opacityA,
              transform: [{ scale: scaleA }],
              zIndex: activeSlot === 'A' ? 2 : 1,
            },
          ]}
        >
          <Image
            source={KOLKATA_HERO_SLIDES[slotAIndex].source}
            resizeMode="cover"
            style={styles.heroCarouselImage}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.heroCarouselSlide,
            {
              opacity: opacityB,
              transform: [{ scale: scaleB }],
              zIndex: activeSlot === 'B' ? 2 : 1,
            },
          ]}
        >
          <Image
            source={KOLKATA_HERO_SLIDES[slotBIndex].source}
            resizeMode="cover"
            style={styles.heroCarouselImage}
          />
        </Animated.View>

        <LinearGradient
          colors={[
            'rgba(15, 23, 42, 0.45)',
            'rgba(15, 23, 42, 0.05)',
            'rgba(15, 23, 42, 0.35)',
            'rgba(10, 15, 30, 0.88)',
          ]}
          locations={[0, 0.32, 0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.heroContent} pointerEvents="box-none">
        <View style={styles.locationBadge}>
          <View style={styles.locationBadgeIcon}>
            <MaterialCommunityIcons name="map-marker-radius" size={13} color="#ffffff" />
          </View>
          <Text style={styles.locationLandmarkText} numberOfLines={1}>
            {currentSlide.landmark}
          </Text>
          <Text style={styles.locationDividerText}>•</Text>
          <Text style={styles.locationSubText} numberOfLines={1}>
            {currentSlide.neighborhood}
          </Text>
        </View>

        <Text style={styles.heroTitle}>Every drop can save a life</Text>
        <Text style={styles.heroSubtitle}>Kolkata, let&apos;s help each other.</Text>

        <View style={styles.carouselIndicatorsCapsule}>
          {KOLKATA_HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <Pressable
                key={idx}
                onPress={() => handleDotPress(idx)}
                style={styles.carouselDotTouch}
                accessibilityRole="button"
                accessibilityLabel={`View ${slide.landmark}`}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <View
                  style={[
                    styles.carouselDot,
                    isActive && styles.carouselDotActive,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function HomeScreen({
  onRequestBlood,
  onFindDonor,
  onRequests,
  onProfile,
  onNotifications,
}: {
  onRequestBlood: () => void;
  onFindDonor: () => void;
  onRequests: () => void;
  onProfile: () => void;
  onNotifications: () => void;
}) {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [incomingRequest, setIncomingRequest] = useState<IncomingDonorRequest | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      if (!user) return;
      const [result, inbox] = await Promise.all([supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null), supabase.rpc('get_donor_inbox')]);
      if (mounted && !result.error) setUnreadNotifications(result.count || 0);
      if (mounted && !inbox.error) {
        const pending = ((inbox.data || []) as IncomingDonorRequestRow[]).map(mapIncomingRequest).find((item) => item.responseStatus === 'pending');
        setIncomingRequest(pending || null);
      }
    };
    void loadUnread();
    const interval = setInterval(() => void loadUnread(), 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="water" size={26} color="#760009" />
            <Text style={styles.title}>Home</Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton} onPress={onNotifications} accessibilityLabel="Notifications">
              <MaterialCommunityIcons name="bell-outline" size={22} color="#59413e" />
              {unreadNotifications > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable style={styles.avatar} onPress={onProfile} accessibilityLabel="Open profile">
              <MaterialCommunityIcons name="account" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <KolkataHeroBanner />

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
          <Pressable style={styles.quickCard} onPress={onProfile} accessibilityLabel="Donate Blood">
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
              <Text style={styles.quickTitle}>Find Compatible Donors</Text>
              <Text style={styles.quickSubtitle}>For your open request</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Requests For You</Text>
            <Pressable onPress={onRequests} accessibilityLabel="View all requests"><Text style={styles.sectionLink}>View All</Text></Pressable>
          </View>

          {incomingRequest ? <View style={styles.requestCard}>
            <View style={styles.requestBody}>
              <Text style={styles.bloodBadge}>{incomingRequest.bloodGroup}</Text>

              <View style={styles.requestInfo}>
                <View style={styles.statusRow}>
                  {incomingRequest.isEmergency ? <Text style={styles.urgentBadge}>URGENT</Text> : null}
                  <Text style={styles.unitsText}>• {incomingRequest.unitsRequired} units required</Text>
                </View>

                <Text style={styles.requestLocation}>{incomingRequest.hospitalName}, {incomingRequest.city || 'Kolkata'}</Text>
                <Text style={styles.requestMeta}>
                  <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#59413e" />
                  {' '}{[incomingRequest.area, incomingRequest.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>

            <Pressable style={styles.secondaryButton} onPress={onRequests} accessibilityLabel="Respond to urgent request">
              <Text style={styles.secondaryButtonText}>Respond</Text>
            </Pressable>
          </View> : <View style={styles.requestCard}><Text style={styles.requestLocation}>No pending blood requests have been sent to you.</Text><Pressable style={styles.secondaryButton} onPress={onRequests}><Text style={styles.secondaryButtonText}>View Requests</Text></Pressable></View>}
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <Pressable style={[styles.tabItem, styles.tabItemActive]} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#760009" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Home</Text>
        </Pressable>

        <Pressable style={styles.tabItem} onPress={onFindDonor} accessibilityLabel="Find Donor">
          <MaterialCommunityIcons name="account-search" size={20} color="#59413e" />
          <Text style={styles.tabText}>Find Donor</Text>
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
  id: string;
  name: string;
  blood: string;
  city: string;
  area: string;
  phone: string;
  available: boolean;
  isNearby?: boolean;
};

const NEARBY_DISTANCE_KM = 5;

const compatibleBloodGroups = (recipientGroup: string) => {
  switch (recipientGroup) {
    case 'O+': return ['O+', 'O-'];
    case 'O-': return ['O-'];
    case 'A+': return ['A+', 'A-', 'O+', 'O-'];
    case 'A-': return ['A-', 'O-'];
    case 'B+': return ['B+', 'B-', 'O+', 'O-'];
    case 'B-': return ['B-', 'O-'];
    case 'AB+': return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    case 'AB-': return ['A-', 'B-', 'AB-', 'O-'];
    default: return [recipientGroup];
  }
};

function FindDonorScreen({
  onBack,
  onHome,
  onFindDonor,
  onRequests,
  onProfile,
  onRequestBlood,
  requestId,
}: {
  onBack: () => void;
  onHome: () => void;
  onFindDonor?: () => void;
  onRequests: () => void;
  onProfile: () => void;
  onRequestBlood: () => void;
  requestId?: string | null;
}) {
  const { user } = useAuth();
  const [selectedBlood, setSelectedBlood] = useState<string>('A+');
  const [userBloodGroup, setUserBloodGroup] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'exact' | 'compatible'>('exact');
  const [userCity, setUserCity] = useState<string>('Kolkata');
  const [userArea, setUserArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [myDonorProfile, setMyDonorProfile] = useState<Donor | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [sentStatusByDonor, setSentStatusByDonor] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sendingDonorId, setSendingDonorId] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Get the current device GPS position for proximity matching.
  // Coordinates are kept in memory for the active search; when the user is an available
  // donor, the latest coordinates are also stored on their private profile so other
  // searches can perform server-side proximity matching without exposing exact coordinates.
  useEffect(() => {
    let mounted = true;

    const updateGpsLocation = async () => {
      if (!user?.id) return;

      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (permission.status !== 'granted') {
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setGpsCoords(coords);

        const profileResult = await supabase
          .from('profiles')
          .select('donor_available')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profileResult.data?.donor_available === true) {
          await supabase
            .from('profiles')
            .update({
              latitude: coords.latitude,
              longitude: coords.longitude,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
      } catch (err) {
        console.warn('Unable to refresh GPS location for nearby donor matching:', err);
      }
    };

    void updateGpsLocation();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Fetch logged in user's profile to default to their blood group and city
  useEffect(() => {
    let mounted = true;
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, blood_group, city, area, phone, donor_available, is_test_account')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;
        const blood = prof?.blood_group || user.user_metadata?.blood_group || 'A+';
        const city = prof?.city || 'Kolkata';
        const area = prof?.area || '';
        const available = Boolean(prof?.donor_available) && prof?.is_test_account !== true;

        setUserBloodGroup(blood);
        setUserCity(city);
        setUserArea(area);
        setMyDonorProfile(
          prof
            ? {
                id: user.id,
                name: prof.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
                blood,
                city,
                area,
                phone: prof.phone || '',
                available,
              }
            : null,
        );

        // If not opened from an explicit request, default to the user's blood group
        if (!requestId) {
          setSelectedBlood(blood);
        }
      } catch (err) {
        console.warn('Unable to load user profile in FindDonorScreen:', err);
      }
    };

    void fetchUserProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id, requestId]);

  // Load specific request if requestId provided
  useEffect(() => {
    let mounted = true;
    const loadRequest = async () => {
      if (!requestId) {
        setRequest(null);
        return;
      }

      const result = await supabase
        .from('blood_requests')
        .select('id, patient_name, blood_group, units_required, hospital_name, hospital_address, city, area, required_date, required_time, status, is_emergency, contact_phone')
        .eq('id', requestId)
        .maybeSingle();

      if (!mounted) return;
      if (result.data) {
        const mapped = toBloodRequest(result.data as BloodRequestRow);
        setRequest(mapped);
        setSelectedBlood(mapped.bloodGroup);
        if (mapped.city) setUserCity(mapped.city);
        if (mapped.area) setUserArea(mapped.area);
      }

      const responseResult = await supabase
        .from('donor_responses')
        .select('donor_id, status')
        .eq('request_id', requestId);

      if (!mounted) return;
      if (!responseResult.error && responseResult.data) {
        const nextStatuses: Record<string, string> = {};
        responseResult.data.forEach((row) => {
          nextStatuses[row.donor_id] = row.status;
        });
        setSentStatusByDonor(nextStatuses);
      }
    };

    void loadRequest();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  const loadDonors = async (
    bloodGroup: string,
    mode: 'exact' | 'compatible',
    currentCity: string
  ) => {
    setLoading(true);
    setErrorMessage('');

    const targetCity = (currentCity || '').trim();
    const bloodGroupsToQuery = mode === 'exact' ? [bloodGroup] : compatibleBloodGroups(bloodGroup);

    try {
      if (!targetCity) {
        setDonors([]);
        setErrorMessage('Add your city in Profile to find donors near you.');
        return;
      }

      const rpcRes = await supabase.rpc('get_available_donors_with_nearby', {
        p_blood_groups: bloodGroupsToQuery,
        p_city: targetCity,
        p_user_lat: gpsCoords?.latitude ?? null,
        p_user_lng: gpsCoords?.longitude ?? null,
        p_nearby_km: NEARBY_DISTANCE_KM,
      });

      if (rpcRes.error) {
        throw new Error(rpcRes.error.message);
      }

      const rows = (rpcRes.data || []) as Array<{
        id: string;
        full_name: string;
        blood_group: string;
        city: string;
        area: string;
        phone?: string | null;
        donor_available: boolean;
        is_nearby: boolean;
      }>;

      const mapped: Donor[] = rows.map((row) => ({
        id: row.id,
        name: row.full_name || 'BloodConnect Donor',
        blood: row.blood_group,
        city: row.city || targetCity,
        area: row.area || '',
        phone: row.phone || '',
        available: row.donor_available ?? true,
        isNearby: row.is_nearby === true,
      }));

      mapped.sort((a, b) => {
        if (a.isNearby && !b.isNearby) return -1;
        if (!a.isNearby && b.isNearby) return 1;
        if (a.phone && !b.phone) return -1;
        if (!a.phone && b.phone) return 1;
        return a.name.localeCompare(b.name);
      });

      setDonors(mapped);
    } catch (err) {
      setErrorMessage('Unable to load donors: ' + (err instanceof Error ? err.message : 'Please try again.'));
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDonors(selectedBlood, filterMode, userCity);
  }, [selectedBlood, filterMode, userCity, gpsCoords?.latitude, gpsCoords?.longitude]);

  const sendDonorRequest = async (donor: Donor) => {
    if (!requestId) return;
    setSendingDonorId(donor.id);
    setErrorMessage('');
    try {
      const result = await supabase.rpc('send_donor_request', {
        p_request_id: requestId,
        p_donor_id: donor.id,
      });
      if (result.error) throw new Error(result.error.message);
      setSentStatusByDonor((current) => ({ ...current, [donor.id]: 'pending' }));
      showMessage('Request sent', donor.name + ' has received your blood-help request.');
    } catch (error) {
      setErrorMessage('Unable to send request: ' + (error instanceof Error ? error.message : 'Please try again.'));
    } finally {
      setSendingDonorId(null);
    }
  };

  const requestDonor = (donor: Donor) => {
    if (!requestId) {
      showMessage('Contact Donor Directly', `You can contact ${donor.name} directly using the Call, SMS, or WhatsApp buttons below.`);
      return;
    }

    const message = donor.blood + ' donor in ' + (donor.area || donor.city) + '. The donor will receive a pending blood-help request and must respond before they are considered accepted.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Request ' + donor.name + '?\n\n' + message)) void sendDonorRequest(donor);
      return;
    }
    Alert.alert('Request ' + donor.name + '?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send Request', onPress: () => void sendDonorRequest(donor) },
    ]);
  };

  const handleCall = (phone: string, donorName: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone) {
      showMessage('Contact Info', `${donorName} has not shared a direct phone number yet.`);
      return;
    }
    void Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      showMessage('Unable to place call', `Please dial ${cleanPhone} directly.`);
    });
  };

  const handleSMS = (phone: string, donorName: string, bloodGroup: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone) {
      showMessage('Contact Info', `${donorName} has not shared a direct phone number yet.`);
      return;
    }
    const message = encodeURIComponent(
      `Hello ${donorName}, I found your contact on BloodConnect. We urgently need a ${bloodGroup} blood donation in ${userCity || 'Kolkata'}. Could you please help?`
    );
    const separator = Platform.OS === 'ios' ? '&' : '?';
    void Linking.openURL(`sms:${cleanPhone}${separator}body=${message}`).catch(() => {
      showMessage('Unable to send SMS', `Please text ${cleanPhone} directly.`);
    });
  };

  const handleWhatsApp = (phone: string, donorName: string, bloodGroup: string) => {
    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (!cleanPhone) {
      showMessage('Contact Info', `${donorName} has not shared a direct phone number yet.`);
      return;
    }
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    const message = encodeURIComponent(
      `Hello ${donorName}, I found your contact on BloodConnect. We urgently need a ${bloodGroup} blood donation in ${userCity || 'Kolkata'}. Could you please help?`
    );
    void Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`).catch(() => {
      showMessage('WhatsApp', 'Unable to open WhatsApp. Please check if the app is installed.');
    });
  };

  const filteredDonors = donors.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.area.toLowerCase().includes(q) ||
      d.blood.toLowerCase().includes(q)
    );
  });

  const visibleMyDonorProfile =
    myDonorProfile &&
    myDonorProfile.available &&
    (!userCity.trim() ||
      !myDonorProfile.city.trim() ||
      myDonorProfile.city.toLowerCase().trim().split(',')[0].trim() ===
        userCity.toLowerCase().trim().split(',')[0].trim()) &&
    (filterMode === 'exact'
      ? myDonorProfile.blood === selectedBlood
      : compatibleBloodGroups(selectedBlood).includes(myDonorProfile.blood)) &&
    (!searchQuery.trim() ||
      myDonorProfile.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      myDonorProfile.city.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      myDonorProfile.area.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      myDonorProfile.blood.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      ? myDonorProfile
      : null;

  const visibleDonorCount = filteredDonors.length + (visibleMyDonorProfile ? 1 : 0);

  return (
    <View style={styles.findDonorScreen}>
      <StatusBar style="dark" />

      <View style={styles.findDonorHeader}>
        <View style={styles.findDonorHeaderLeft}>
          <Pressable style={styles.requestBackButton} onPress={onBack} accessibilityLabel="Go back">
            <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
          </Pressable>
          <Text style={styles.requestTitle}>Find Donor</Text>
        </View>
        <View style={styles.findDonorHeaderActions}>
          <Pressable
            style={styles.findDonorHeaderIcon}
            onPress={() =>
              void openExternalUrl(
                'https://www.google.com/maps/search/?api=1&query=' +
                  encodeURIComponent((userArea ? userArea + ', ' : '') + (userCity || 'Kolkata') + ', West Bengal'),
                'open Google Maps',
              )
            }
            accessibilityLabel="Open map"
          >
            <MaterialCommunityIcons name="map-marker" size={20} color="#191c1e" />
          </Pressable>
          <Pressable style={styles.findDonorHeaderIcon} onPress={onProfile} accessibilityLabel="Open profile">
            <MaterialCommunityIcons name="account" size={20} color="#191c1e" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.findDonorScroll} contentContainerStyle={styles.findDonorContent} showsVerticalScrollIndicator={false}>
        {request ? (
          <View style={styles.findDonorCard}>
            <Text style={styles.findDonorLabel}>Blood request</Text>
            <Text style={styles.findDonorLocation}>{request.patientName}</Text>
            <Text style={styles.findDonorMeta}>
              {request.bloodGroup} • {request.unitsRequired} units • {request.hospitalName}
            </Text>
            <Text style={styles.findDonorMeta}>
              {[request.area, request.city].filter(Boolean).join(', ')} • {formatRequestDeadline(request)}
            </Text>
          </View>
        ) : (
          <View style={styles.findDonorCard}>
            <View style={styles.findDonorLocationRow}>
              <View style={styles.findDonorLocationInfo}>
                <View style={styles.findDonorIconCircle}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#760009" />
                </View>
                <View>
                  <Text style={styles.findDonorLabel}>Your City / Location</Text>
                  <Text style={styles.findDonorLocation}>{userCity || 'Kolkata'}{userArea ? `, ${userArea}` : ''}</Text>
                </View>
              </View>
              <Pressable onPress={onProfile} accessibilityLabel="Change location in profile">
                <Text style={styles.findDonorChange}>Edit</Text>
              </Pressable>
            </View>
            <Text style={styles.findDonorSubtitle}>
              Showing verified {filterMode === 'exact' ? selectedBlood : 'compatible'} blood donors available in {userCity || 'Kolkata'}. Reach out directly via call or message.
            </Text>
          </View>
        )}

        <View style={styles.findDonorSectionHeader}>
          <Text style={styles.findDonorSectionTitle}>Select Blood Group</Text>
          <Text style={styles.findDonorLabel}>
            {userBloodGroup ? `Your group: ${userBloodGroup}` : 'Tap to filter'}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bloodChoiceRow}>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
            <Pressable
              key={group}
              onPress={() => setSelectedBlood(group)}
              style={[styles.bloodChoice, selectedBlood === group && styles.bloodChoiceSelected]}
              accessibilityLabel={`Select blood group ${group}`}
            >
              <Text style={[styles.bloodChoiceText, selectedBlood === group && styles.bloodChoiceTextSelected]}>
                {group}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.modeToggleRow}>
          <Pressable
            style={[styles.modeToggleChip, filterMode === 'exact' && styles.modeToggleChipActive]}
            onPress={() => setFilterMode('exact')}
            accessibilityLabel={`Exact ${selectedBlood} donors only`}
          >
            <Text style={[styles.modeToggleText, filterMode === 'exact' && styles.modeToggleTextActive]}>
              Exact {selectedBlood} Donors
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeToggleChip, filterMode === 'compatible' && styles.modeToggleChipActive]}
            onPress={() => setFilterMode('compatible')}
            accessibilityLabel={`Compatible donors for ${selectedBlood}`}
          >
            <Text style={[styles.modeToggleText, filterMode === 'compatible' && styles.modeToggleTextActive]}>
              All Compatible ({compatibleBloodGroups(selectedBlood).join(', ')})
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#59413e" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Filter by area or name in ${userCity || 'Kolkata'}...`}
            placeholderTextColor="#8d706d"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Clear search">
              <MaterialCommunityIcons name="close-circle" size={18} color="#8d706d" />
            </Pressable>
          ) : null}
        </View>

        {errorMessage ? <Text style={styles.profileErrorText}>{errorMessage}</Text> : null}

        <View style={styles.findDonorResults}>
          <View style={styles.findDonorResultsHeader}>
            <View>
              <Text style={styles.findDonorSectionTitle}>
                {visibleDonorCount} {filterMode === 'exact' ? selectedBlood : 'Compatible'} {visibleDonorCount === 1 ? 'Donor' : 'Donors'} Found
              </Text>
              <Text style={styles.findDonorLabel}>
                In {userCity || 'Kolkata'}{userArea ? ` • Prioritizing ${userArea}` : ''}
              </Text>
            </View>
          </View>

          {loading ? (
            <Text style={styles.authLoadingText}>Loading available donors...</Text>
          ) : visibleDonorCount > 0 ? (
            <>
              {visibleMyDonorProfile ? (
                <View style={styles.myDonorCard}>
                  <View style={styles.myDonorTopRow}>
                    <View style={styles.myDonorLabelTag}>
                      <MaterialCommunityIcons name="account-heart" size={16} color="#760009" />
                      <Text style={styles.myDonorLabelText}>Your donor profile</Text>
                    </View>
                    <View style={styles.myDonorBadgeRow}>
                      <Text style={styles.myDonorBadge}>You</Text>
                      <Text style={styles.availableBadge}>Available</Text>
                    </View>
                  </View>

                  <View style={styles.myDonorHeader}>
                    <View style={styles.donorAvatar}>
                      <MaterialCommunityIcons name="account" size={28} color="#760009" />
                      <View style={styles.onlineDot} />
                    </View>

                    <View style={styles.donorInfo}>
                      <View style={styles.donorNameRow}>
                        <Text style={styles.donorName}>{visibleMyDonorProfile.name}</Text>
                        <Text style={styles.donorBlood}>{visibleMyDonorProfile.blood}</Text>
                      </View>
                      <Text style={styles.donorMeta}>
                        📍 {[visibleMyDonorProfile.city || userCity || 'Kolkata', visibleMyDonorProfile.area].filter(Boolean).join(' / ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.myDonorNotice}>
                    <MaterialCommunityIcons name="heart-pulse" size={18} color="#760009" />
                    <View style={styles.myDonorNoticeContent}>
                      <Text style={styles.myDonorNoticeText}>
                        Your donor profile is active and visible for this search.
                      </Text>
                      <Text style={styles.myDonorNoticeSubtext}>
                        You cannot send a blood request to your own account.
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {filteredDonors.map((donor) => {
              const responseStatus = sentStatusByDonor[donor.id];

              return (
                <View key={donor.id} style={styles.donorCard}>
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
                      <Text style={styles.donorMeta}>
                        📍 {[donor.area, donor.city].filter(Boolean).join(', ') || userCity || 'Kolkata'}
                      </Text>
                      {donor.isNearby ? (
                        <View style={styles.sameAreaBadge}>
                          <MaterialCommunityIcons name="crosshairs-gps" size={13} color="#065f46" />
                          <Text style={styles.sameAreaBadgeText}>Near You (GPS)</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.availableBadge}>Available</Text>
                  </View>

                  <View style={styles.donorContactBox}>
                    <View style={styles.donorPhoneRow}>
                      <MaterialCommunityIcons name="phone" size={16} color="#760009" />
                      <Text style={styles.donorPhoneText}>
                        {donor.phone ? donor.phone : 'Phone not provided'}
                      </Text>
                    </View>

                    <View style={styles.contactActionsRow}>
                      {donor.phone ? (
                        <>
                          <Pressable
                            style={styles.contactCallBtn}
                            onPress={() => handleCall(donor.phone, donor.name)}
                            accessibilityLabel={`Call ${donor.name}`}
                          >
                            <MaterialCommunityIcons name="phone" size={16} color="#ffffff" />
                            <Text style={styles.contactBtnText}>Call</Text>
                          </Pressable>

                          <Pressable
                            style={styles.contactSmsBtn}
                            onPress={() => handleSMS(donor.phone, donor.name, donor.blood)}
                            accessibilityLabel={`SMS ${donor.name}`}
                          >
                            <MaterialCommunityIcons name="message-text" size={16} color="#191c1e" />
                            <Text style={styles.contactDarkBtnText}>SMS</Text>
                          </Pressable>

                          <Pressable
                            style={styles.contactWaBtn}
                            onPress={() => handleWhatsApp(donor.phone, donor.name, donor.blood)}
                            accessibilityLabel={`WhatsApp ${donor.name}`}
                          >
                            <MaterialCommunityIcons name="whatsapp" size={16} color="#ffffff" />
                            <Text style={styles.contactBtnText}>WhatsApp</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Text style={styles.noPhoneText}>Direct contact info not shared by donor.</Text>
                      )}
                    </View>
                  </View>

                  {requestId ? (
                    <Pressable
                      style={[styles.donorRequestButton, responseStatus && styles.donorRequestButtonDisabled, { marginTop: 10 }]}
                      disabled={responseStatus === 'pending' || responseStatus === 'accepted' || sendingDonorId === donor.id}
                      onPress={() => requestDonor(donor)}
                    >
                      <Text style={styles.donorRequestText}>
                        {sendingDonorId === donor.id
                          ? 'Sending...'
                          : responseStatus === 'accepted'
                            ? 'Accepted'
                            : responseStatus === 'pending'
                              ? 'Request Pending'
                              : responseStatus === 'declined'
                                ? 'Request Again'
                                : 'Send Blood Request'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
              })}
            </>
          ) : (
            <View style={styles.donorEmptyState}>
              <View style={styles.donorEmptyIcon}>
                <MaterialCommunityIcons name="water" size={32} color="#760009" />
              </View>
              <Text style={styles.emptyStateTitle}>
                No {filterMode === 'exact' ? selectedBlood : 'compatible'} donors found in {searchQuery ? `"${searchQuery}"` : userCity || 'Kolkata'}
              </Text>
              <Text style={styles.emptyStateText}>
                {filterMode === 'exact'
                  ? `There are currently no registered ${selectedBlood} donors marked as available here. You can check all compatible groups or post a blood request.`
                  : 'There are currently no registered compatible donors marked as available here. You can post an open blood request to alert donors across the city.'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                {filterMode === 'exact' ? (
                  <Pressable
                    style={styles.profileOutlineButton}
                    onPress={() => setFilterMode('compatible')}
                  >
                    <Text style={styles.profileOutlineButtonText}>View Compatible Groups</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={styles.profilePrimaryButtonSmall}
                  onPress={onRequestBlood}
                >
                  <Text style={styles.profilePrimaryButtonText}>Request Blood</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>
        <Pressable style={[styles.bottomNavItem, styles.bottomNavItemActive]} accessibilityLabel="Find Donor">
          <MaterialCommunityIcons name="account-search" size={20} color="#760009" />
          <Text style={[styles.bottomNavText, styles.bottomNavTextActive]}>Find Donor</Text>
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

type BloodRequestConnectionRow = {
  request_id: string;
  patient_name: string | null;
  blood_group: string;
  units_required: number;
  hospital_name: string;
  hospital_address: string | null;
  city: string;
  area: string | null;
  required_date: string | null;
  required_time: string | null;
  is_emergency: boolean;
  status: string;
  requester_phone: string;
  is_requester: boolean;
  accepted_donor_id: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  donor_blood_group: string | null;
  donor_city: string | null;
  donor_area: string | null;
};

type BloodRequestConnection = {
  isRequester: boolean;
  requesterPhone: string;
  selectedDonorId: string | null;
  donorName: string | null;
  donorPhone: string | null;
  donorBloodGroup: string | null;
  donorCity: string | null;
  donorArea: string | null;
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


function RequestsScreen({
  onHome,
  onFindDonor,
  onProfile,
  onRequestDetails,
}: {
  onHome: () => void;
  onFindDonor: () => void;
  onProfile: () => void;
  onRequestDetails: (requestId: string) => void;
}) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingDonorRequest[]>([]);
  const [openRequests, setOpenRequests] = useState<OpenBloodRequest[]>([]);
  const [selectedOpenRequest, setSelectedOpenRequest] = useState<OpenBloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setErrorMessage(userError?.message || 'You must be signed in to view requests.');
      setLoading(false);
      return;
    }

    const [ownResult, inboxResult, openResult] = await Promise.all([
      supabase
        .from('blood_requests')
        .select('id, patient_name, blood_group, units_required, hospital_name, hospital_address, city, area, required_date, required_time, status, is_emergency, contact_phone')
        .eq('requester_id', userData.user.id)
        .neq('status', 'cancelled')
        .neq('patient_name', 'Donor Directory Seeker')
        .neq('patient_name', 'Donor Inquiry')
        .order('created_at', { ascending: false }),
      supabase.rpc('get_donor_inbox'),
      supabase.rpc('get_open_blood_requests_with_patient_for_donor'),
    ]);

    if (ownResult.error) {
      setErrorMessage('Unable to load your requests: ' + ownResult.error.message);
    } else {
      setRequests((ownResult.data as BloodRequestRow[]).map(toBloodRequest));
    }

    if (inboxResult.error) {
      setErrorMessage((current) =>
        current
          ? current + ' | Donor inbox: ' + inboxResult.error.message
          : 'Donor inbox unavailable: ' + inboxResult.error.message,
      );
    } else {
      setIncomingRequests(((inboxResult.data || []) as IncomingDonorRequestRow[]).map(mapIncomingRequest));
    }

    if (openResult.error) {
      setErrorMessage((current) => current ? current + ' | Nearby requests: ' + openResult.error.message : 'Nearby requests unavailable: ' + openResult.error.message);
    } else {
      setOpenRequests(
        ((openResult.data || []) as OpenBloodRequestRow[])
          .map(mapOpenBloodRequest)
          .filter((req) => req.patientName !== 'Donor Directory Seeker' && req.patientName !== 'Donor Inquiry')
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadRequests();
  }, [user?.id]);

  const respondToDonorRequest = async (item: IncomingDonorRequest, status: 'accepted' | 'declined') => {
    if (!user) return;

    setRespondingId(item.responseId);
    setErrorMessage('');

    const result = await supabase.rpc('respond_to_donor_request', {
      p_response_id: item.responseId,
      p_status: status,
    });

    if (result.error) {
      setErrorMessage(
        'Unable to ' +
          (status === 'accepted' ? 'accept' : 'decline') +
          ' this request: ' +
          result.error.message,
      );
      setRespondingId(null);
      return;
    }

    setIncomingRequests((current) =>
      current.map((entry) =>
        entry.responseId === item.responseId ? { ...entry, responseStatus: status } : entry,
      ),
    );
    setRespondingId(null);

    showMessage(
      status === 'accepted' ? 'Donation request accepted' : 'Request declined',
      status === 'accepted'
        ? 'The requester can now see that you accepted. Hospital screening is still required before donation is confirmed.'
        : 'The requester has been notified that you are unavailable.',
    );
  };

  const withdrawAcceptance = async (item: IncomingDonorRequest) => {
    setRespondingId(item.responseId);
    setErrorMessage('');
    try {
      const result = await supabase.rpc('withdraw_donor_response', { p_response_id: item.responseId });
      if (result.error) throw new Error(result.error.message);
      setIncomingRequests((current) => current.map((entry) => entry.responseId === item.responseId ? { ...entry, responseStatus: 'withdrawn' } : entry));
    } catch (error) {
      setErrorMessage('Unable to withdraw this response: ' + (error instanceof Error ? error.message : 'Please try again.'));
    } finally {
      setRespondingId(null);
    }
  };

  const confirmWithdraw = (item: IncomingDonorRequest) => {
    const message = 'You will become unavailable for this response. The requester will be notified.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Withdraw acceptance?\n\n' + message)) void withdrawAcceptance(item);
      return;
    }
    Alert.alert('Withdraw acceptance?', message, [
      { text: 'Keep acceptance', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => void withdrawAcceptance(item) },
    ]);
  };

  const respondToOpenRequest = async (item: OpenBloodRequest) => {
    setRespondingId(item.id);
    setErrorMessage('');
    try {
      const result = await supabase.rpc('respond_to_open_blood_request', { p_request_id: item.id });
      if (result.error) throw new Error(result.error.message);
      setSelectedOpenRequest(null);
      showMessage('You can help', 'The requester has been notified that you can help.');
      onRequestDetails(item.id);
    } catch (error) {
      setErrorMessage('Unable to respond to this request: ' + (error instanceof Error ? error.message : 'Please try again.'));
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <View style={styles.requestScreen}>
      <StatusBar style="dark" />

      <View style={styles.requestsHeader}>
        <Pressable style={styles.requestBackButton} onPress={onHome} accessibilityLabel="Go back to home">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
        </Pressable>
        <Text style={styles.requestTitle}>Blood Requests</Text>
        <Pressable style={styles.requestHeaderIcon} onPress={() => void loadRequests()} accessibilityLabel="Refresh requests">
          <MaterialCommunityIcons name="refresh" size={20} color="#760009" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.requestsListScroll}
        contentContainerStyle={styles.requestsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void loadRequests()} tintColor="#760009" colors={['#760009']} />}
      >
        {errorMessage ? <Text style={styles.profileErrorText}>{errorMessage}</Text> : null}

        {loading ? (
          <Text style={styles.authLoadingText}>Loading requests...</Text>
        ) : (
          <>
            <Text style={styles.requestsSectionTitle}>My Blood Requests</Text>

            {requests.length > 0 ? (
              requests.map((request) => (
                <Pressable
                  key={request.id}
                  style={styles.bloodRequestCard}
                  onPress={() => onRequestDetails(request.id)}
                  accessibilityLabel={'Open ' + request.patientName + ' blood request'}
                >
                  <View style={styles.requestCardTopRow}>
                    <View style={styles.requestCardBloodBadge}>
                      <Text style={styles.requestCardBloodText}>{request.bloodGroup}</Text>
                    </View>
                    <View style={styles.requestCardCopy}>
                      <View style={styles.requestCardStatusRow}>
                        {request.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
                        <Text style={styles.openStatusBadge}>{request.status.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.requestCardPatient}>{request.patientName}</Text>
                      <Text style={styles.findDonorMeta}>{request.unitsRequired} units required - {request.hospitalName}</Text>
                      <Text style={styles.findDonorMeta}>{[request.area, request.city].filter(Boolean).join(', ')} - {formatRequestDeadline(request)}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color="#8d706d" />
                  </View>
                  <Text style={styles.requestCardHint}>Tap to view request details</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <MaterialCommunityIcons name="water" size={42} color="#760009" />
                </View>
                <Text style={styles.emptyStateTitle}>No Blood Requests Yet</Text>
                <Text style={styles.emptyStateText}>Your blood requests will appear here.</Text>
              </View>
            )}

            <Text style={styles.requestsSectionTitle}>Open Blood Requests Near You</Text>
            <Text style={styles.requestsSectionSubtitle}>Compatible requests appear here when your profile is marked available to donate. Only approximate request areas are shown.</Text>
            {openRequests.length > 0 ? openRequests.map((item) => (
              <View key={item.id} style={styles.incomingRequestCard}>
                <View style={styles.requestCardTopRow}>
                  <View style={styles.requestCardBloodBadge}><Text style={styles.requestCardBloodText}>{item.bloodGroup}</Text></View>
                  <View style={styles.requestCardCopy}>
                    <View style={styles.requestCardStatusRow}>
                      {item.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
                      <Text style={styles.openStatusBadge}>{item.unitsRequired} {item.unitsRequired === 1 ? 'UNIT' : 'UNITS'}</Text>
                    </View>
                    <Text style={styles.requestCardPatient}>{item.patientName || 'Patient name not provided'}</Text>
                    <Text style={styles.findDonorMeta}>Hospital: {item.hospitalName}</Text>
                    <Text style={styles.findDonorMeta}>{[item.area, item.city].filter(Boolean).join(', ')}</Text>
                    <Text style={styles.findDonorMeta}>Needed: {[item.requiredDate, item.requiredTime].filter(Boolean).join(', ') || 'As soon as possible'}</Text>
                  </View>
                </View>
                <View style={styles.incomingActions}>
                  <Pressable style={styles.donorRequestButton} onPress={() => setSelectedOpenRequest(item)}>
                    <Text style={styles.donorRequestText}>View Request</Text>
                  </Pressable>
                </View>
              </View>
            )) : <View style={styles.detailsInfoBox}><MaterialCommunityIcons name="map-search-outline" size={22} color="#760009" /><View style={styles.detailsInfoCopy}><Text style={styles.detailsValue}>No compatible open requests nearby</Text><Text style={styles.detailsMuted}>Mark your profile available and complete your blood group and city to see matching requests.</Text></View></View>}

            <Text style={styles.requestsSectionTitle}>Requests For You</Text>
            <Text style={styles.requestsSectionSubtitle}>
              Blood-help requests sent to you because your donor profile is available.
            </Text>

            {incomingRequests.length > 0 ? (
              incomingRequests.map((item) => {
                const isPending = item.responseStatus === 'pending';

                return (
                  <View key={item.responseId} style={styles.incomingRequestCard}>
                    <View style={styles.requestCardTopRow}>
                      <View style={styles.requestCardBloodBadge}>
                        <Text style={styles.requestCardBloodText}>{item.bloodGroup}</Text>
                      </View>
                      <View style={styles.requestCardCopy}>
                        <View style={styles.requestCardStatusRow}>
                          {item.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
                          <Text style={styles.openStatusBadge}>{item.responseStatus.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.requestCardPatient}>{item.patientName}</Text>
                        <Text style={styles.findDonorMeta}>{item.unitsRequired} units - {item.hospitalName}</Text>
                        <Text style={styles.findDonorMeta}>{[item.area, item.city].filter(Boolean).join(', ')}</Text>
                        <Text style={styles.findDonorMeta}>Needed: {[item.requiredDate, item.requiredTime].filter(Boolean).join(', ') || 'As soon as possible'}</Text>
                      </View>
                    </View>

                    <View style={styles.incomingPrivacyBox}>
                      <MaterialCommunityIcons name="shield-lock-outline" size={18} color="#760009" />
                      <Text style={styles.privacyText}>Donor home address and private contact details are not shown here.</Text>
                    </View>

                    {isPending ? (
                      <View style={styles.incomingActions}>
                        <Pressable
                          style={styles.donorRequestButtonSecondary}
                          disabled={respondingId === item.responseId}
                          onPress={() => void respondToDonorRequest(item, 'declined')}
                        >
                          <Text style={styles.donorRequestButtonSecondaryText}>
                            {respondingId === item.responseId ? 'Please wait...' : 'I’m Unable'}
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.donorRequestButton}
                          disabled={respondingId === item.responseId}
                          onPress={() => void respondToDonorRequest(item, 'accepted')}
                        >
                          <Text style={styles.donorRequestText}>
                            {respondingId === item.responseId ? 'Please wait...' : 'I Can Help'}
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <>
                        <View style={styles.incomingStatusBox}>
                          <MaterialCommunityIcons
                            name={
                              item.responseStatus === 'accepted'
                                ? 'check-circle'
                                : item.responseStatus === 'withdrawn'
                                  ? 'backup-restore'
                                  : 'close-circle'
                            }
                            size={18}
                            color="#760009"
                          />
                          <Text style={styles.findDonorMeta}>
                            {item.responseStatus === 'accepted'
                              ? 'You accepted this request. Hospital screening is still required.'
                              : item.responseStatus === 'withdrawn'
                                ? 'You withdrew your acceptance.'
                                : 'You declined this request.'}
                          </Text>
                        </View>

                        {item.responseStatus === 'accepted' ? (
                          <View style={styles.incomingActions}>
                            <Pressable style={styles.detailsSecondaryButton} onPress={() => onRequestDetails(item.requestId)}>
                              <Text style={styles.detailsSecondaryText}>View Donation Details</Text>
                            </Pressable>
                            <Pressable
                              style={styles.donorWithdrawButton}
                              disabled={respondingId === item.responseId}
                              onPress={() => confirmWithdraw(item)}
                            >
                              <MaterialCommunityIcons name="backup-restore" size={17} color="#760009" />
                              <Text style={styles.donorWithdrawText}>
                                {respondingId === item.responseId ? 'Please wait...' : 'Withdraw Acceptance'}
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </>
                    )}

                    <DonationWorkflowCard requestId={item.requestId} />
                  </View>
                );
              })
            ) : (
              <View style={styles.detailsInfoBox}>
                <MaterialCommunityIcons name="account-heart-outline" size={22} color="#760009" />
                <View style={styles.detailsInfoCopy}>
                  <Text style={styles.detailsValue}>No donor requests yet</Text>
                  <Text style={styles.detailsMuted}>New blood-help requests will appear here when another user requests you.</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={Boolean(selectedOpenRequest)} transparent animationType="slide" onRequestClose={() => setSelectedOpenRequest(null)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Open Blood Request</Text>
            {selectedOpenRequest ? <>
              <View style={styles.requestCardStatusRow}>
                <Text style={styles.requestCardBloodText}>{selectedOpenRequest.bloodGroup}</Text>
                <Text style={styles.profileValueText}>{selectedOpenRequest.unitsRequired} {selectedOpenRequest.unitsRequired === 1 ? 'unit' : 'units'} required</Text>
                {selectedOpenRequest.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
              </View>
              <Text style={styles.profileModalLabel}>Patient</Text>
              <Text style={styles.profileValueText}>{selectedOpenRequest.patientName || 'Not provided'}</Text>
              <Text style={styles.profileModalLabel}>Hospital</Text>
              <Text style={styles.profileValueText}>{selectedOpenRequest.hospitalName}</Text>
              <Text style={styles.profileModalLabel}>Approximate area</Text>
              <Text style={styles.profileValueText}>{[selectedOpenRequest.area, selectedOpenRequest.city].filter(Boolean).join(', ')}</Text>
              <Text style={styles.profileModalLabel}>Required by</Text>
              <Text style={styles.profileValueText}>{[selectedOpenRequest.requiredDate, selectedOpenRequest.requiredTime].filter(Boolean).join(', ') || 'As soon as possible'}</Text>
              <Text style={styles.profileFinePrint}>Requester contact details and exact coordinates are private. The requester will be notified if you offer to help.</Text>
              <View style={styles.profileModalActions}>
                <Pressable style={styles.profileModalCancel} onPress={() => setSelectedOpenRequest(null)}><Text style={styles.profileModalCancelText}>Close</Text></Pressable>
                <Pressable style={styles.profileModalSave} disabled={respondingId === selectedOpenRequest.id} onPress={() => void respondToOpenRequest(selectedOpenRequest)}><Text style={styles.profileModalSaveText}>{respondingId === selectedOpenRequest.id ? 'Sending...' : 'I Can Help'}</Text></Pressable>
              </View>
            </> : null}
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Home</Text>
        </Pressable>
        <Pressable style={styles.bottomNavItem} onPress={onFindDonor} accessibilityLabel="Find Donor">
          <MaterialCommunityIcons name="account-search" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Find Donor</Text>
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
  const [connectionDetails, setConnectionDetails] = useState<BloodRequestConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [donorResponses, setDonorResponses] = useState<Array<{ id: string; donorId: string; status: string; createdAt: string }>>([]);
  const detailsScrollRef = useRef<ScrollView>(null);
  const [donorResponsesY, setDonorResponsesY] = useState(0);
  const [editRequestVisible, setEditRequestVisible] = useState(false);
  const [requestOptionsVisible, setRequestOptionsVisible] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editDraft, setEditDraft] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: '1',
    hospitalName: '',
    hospitalAddress: '',
    city: 'Kolkata',
    area: '',
    requiredDate: '',
    requiredTime: '',
    isEmergency: true,
    contactPhone: '',
  });

  const refreshRequest = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setErrorMessage('');

    if (!requestId) {
      setRequest(null);
      setErrorMessage('No blood request was selected. Please go back and choose a request.');
      setLoading(false);
      return;
    }

    const [connectionResult, { data: responseData, error: responseError }] = await Promise.all([
      supabase.rpc('get_blood_request_connection_details', { p_request_id: requestId }).maybeSingle(),
      supabase
        .from('donor_responses')
        .select('id, donor_id, status, created_at')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true }),
    ]);

    if (connectionResult.error || !connectionResult.data) {
      setRequest(null);
      setConnectionDetails(null);
      setErrorMessage(`Unable to load request: ${connectionResult.error?.message || 'This request is not available to your account.'}`);
      setLoading(false);
      return;
    }

    const row = connectionResult.data as BloodRequestConnectionRow;
    setRequest({
      id: row.request_id,
      patientName: row.patient_name || '',
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
      contactPhone: row.requester_phone,
    });
    setConnectionDetails({
      isRequester: row.is_requester,
      requesterPhone: row.requester_phone,
      selectedDonorId: row.accepted_donor_id,
      donorName: row.donor_name,
      donorPhone: row.donor_phone,
      donorBloodGroup: row.donor_blood_group,
      donorCity: row.donor_city,
      donorArea: row.donor_area,
    });

    if (responseError) {
      setErrorMessage(`Request loaded, but donor responses could not be loaded: ${responseError.message}`);
    } else {
      setDonorResponses((responseData || []).map((row) => ({
        id: row.id,
        donorId: row.donor_id,
        status: row.status,
        createdAt: row.created_at,
      })));
    }

    setLoading(false);
  };

  useEffect(() => {
    void refreshRequest(true);
    const interval = setInterval(() => {
      void refreshRequest(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId]);

  const openEditRequest = () => {
    if (!request) return;
    if (request.status !== 'open') {
      showMessage('Request already matched', 'This request can only be fully edited while it is still open. Manage the active donor workflow from the request details.');
      return;
    }
    setEditDraft({
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      unitsRequired: String(request.unitsRequired),
      hospitalName: request.hospitalName,
      hospitalAddress: request.hospitalAddress || [request.area, request.city].filter(Boolean).join(', '),
      city: request.city || 'Kolkata',
      area: request.area || '',
      requiredDate: request.requiredDate || '',
      requiredTime: request.requiredTime || '',
      isEmergency: request.isEmergency,
      contactPhone: request.contactPhone || '',
    });
    setEditRequestVisible(true);
  };

  const saveEditedRequest = async () => {
    if (!request) return;
    if (!editDraft.patientName.trim() || !editDraft.hospitalName.trim() || !editDraft.hospitalAddress.trim() || !editDraft.contactPhone.trim()) {
      showMessage('Missing details', 'Patient name, hospital, address and contact number are required.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setErrorMessage('You must be signed in to edit this request.');
      return;
    }

    const units = Math.max(1, Math.min(10, Number(editDraft.unitsRequired) || 1));
    const locationParts = editDraft.hospitalAddress.split(',').map((part) => part.trim()).filter(Boolean);
    setEditSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('blood_requests')
      .update({
        patient_name: editDraft.patientName.trim(),
        blood_group: editDraft.bloodGroup,
        units_required: units,
        hospital_name: editDraft.hospitalName.trim(),
        hospital_address: editDraft.hospitalAddress.trim(),
        city: editDraft.city.trim() || locationParts[0] || 'Kolkata',
        area: editDraft.area.trim() || locationParts.slice(1).join(', ') || null,
        required_date: editDraft.requiredDate.trim() || null,
        required_time: editDraft.requiredTime.trim() || null,
        is_emergency: editDraft.isEmergency,
        contact_phone: editDraft.contactPhone.trim(),
        latitude: null,
        longitude: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)
      .eq('requester_id', userData.user.id);

    if (error) {
      setErrorMessage('Unable to update request: ' + error.message);
      setEditSaving(false);
      return;
    }

    setEditRequestVisible(false);
    setEditSaving(false);
    await refreshRequest(false);
    showMessage('Request updated', 'Your blood request has been updated.');
  };

  const cancelRequest = async () => {
    if (!request) return;
    const { error } = await supabase.from('blood_requests').update({ status: 'cancelled' }).eq('id', request.id);
    if (error) {
      setErrorMessage(`Unable to cancel request: ${error.message}`);
      return;
    }
    setRequest({ ...request, status: 'cancelled' });
  };

  const confirmCancelRequest = () => {
    const message = 'Are you sure you want to cancel this request?';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        void cancelRequest();
      }
      return;
    }

    Alert.alert('Cancel Request', message, [
      { text: 'Keep Open', style: 'cancel' },
      { text: 'Cancel Request', style: 'destructive', onPress: () => void cancelRequest() },
    ]);
  };

  const callContact = (phone: string | null, person: string) => {
    if (!phone) {
      showMessage('Phone unavailable', `${person}'s phone number is not available.`);
      return;
    }
    void openExternalUrl('tel:' + phone, `call ${person}`);
  };

  const whatsappContact = (phone: string | null, person: string) => {
    const digits = phone?.replace(/\D/g, '') || '';
    if (!digits) {
      showMessage('WhatsApp unavailable', `${person}'s phone number is not available.`);
      return;
    }
    void openExternalUrl('https://wa.me/' + (digits.startsWith('91') ? digits : '91' + digits), `contact ${person} on WhatsApp`);
  };

  const openHospitalDirections = () => {
    if (!request) return;
  const destination = [request.hospitalName, request.hospitalAddress || [request.area, request.city].filter(Boolean).join(', ')].filter(Boolean).join(', ');
    void openExternalUrl(
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(destination),
      'open hospital directions in Google Maps',
    );
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

      <ScrollView ref={detailsScrollRef} style={styles.detailsScroll} contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsHeader}>
          <Pressable style={styles.detailsIconButton} onPress={onBack} accessibilityLabel="Go back to requests">
            <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
          </Pressable>
          <Text style={styles.detailsTitle}>Blood Request Details</Text>
          {connectionDetails?.isRequester ? <Pressable
            style={styles.detailsIconButton}
            onPress={() => setRequestOptionsVisible(true)}
            accessibilityLabel="More options"
          >
            <MaterialCommunityIcons name="dots-vertical" size={22} color="#191c1e" />
          </Pressable> : <View style={styles.detailsIconButton} />}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsTopRow}>
            <View style={styles.detailsBadgeRow}>
              {request.isEmergency ? <Text style={styles.urgentStatusBadge}>URGENT</Text> : null}
              <Text style={styles.openStatusBadge}>{request.status.toUpperCase()}</Text>
            </View>
            <View style={styles.detailsBloodBadge}>
              <MaterialCommunityIcons name="water" size={20} color="#760009" />
              <Text style={styles.detailsBloodText}>{request.bloodGroup}</Text>
            </View>
          </View>
          <Text style={styles.detailsHeading}>{request.isEmergency ? 'Emergency Blood Request' : 'Blood Request'}</Text>
          <Text style={styles.detailsMuted}>This request was submitted through BloodConnect. Contact the hospital directly for urgent medical advice.</Text>
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
            {connectionDetails?.isRequester && request.patientName ? <View><Text style={styles.detailsLabel}>Patient Name</Text><Text style={styles.detailsValue}>{request.patientName}</Text></View> : null}
            <View><Text style={styles.detailsLabel}>Blood Group</Text><Text style={styles.detailsAccentValue}>{request.bloodGroup}</Text></View>
            <View><Text style={styles.detailsLabel}>Units Required</Text><Text style={styles.detailsValue}>{request.unitsRequired} Units</Text></View>
            <View><Text style={styles.detailsLabel}>Required By</Text><Text style={styles.detailsValue}>{formatRequestDeadline(request)}</Text></View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}><MaterialCommunityIcons name="hospital" size={22} color="#760009" /><Text style={styles.detailsSectionTitle}>Hospital Information</Text></View>
          <Text style={styles.detailsHospitalName}>{request.hospitalName}</Text>
          <Text style={styles.detailsMuted}><MaterialCommunityIcons name="map-marker" size={16} color="#760009" /> {request.hospitalAddress || [request.area, request.city].filter(Boolean).join(', ') || 'Location not provided'}</Text>
          <View style={styles.approxLocationBox}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#760009" />
            <Text style={styles.detailsMuted}>Hospital location: {request.hospitalAddress || [request.area, request.city].filter(Boolean).join(', ') || 'Location not provided'}</Text>
          </View>
          <Pressable
            style={styles.detailsSecondaryButton}
            onPress={() =>
              openHospitalDirections()
            }
          >
            <MaterialCommunityIcons name="map-outline" size={18} color="#760009" /><Text style={styles.detailsSecondaryText}>View Hospital Location</Text>
          </Pressable>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}>
            <MaterialCommunityIcons name="account-lock-outline" size={22} color="#760009" />
            <Text style={styles.detailsSectionTitle}>Connection Details</Text>
          </View>
          {connectionDetails?.isRequester ? (
            connectionDetails.selectedDonorId ? (
              <>
                <Text style={styles.detailsHospitalName}>Your Donor</Text>
                <View style={styles.detailsGrid}>
                  <View><Text style={styles.detailsLabel}>Name</Text><Text style={styles.detailsValue}>{connectionDetails.donorName || 'BloodConnect donor'}</Text></View>
                  <View><Text style={styles.detailsLabel}>Blood Group</Text><Text style={styles.detailsAccentValue}>{connectionDetails.donorBloodGroup || 'Not available'}</Text></View>
                  <View><Text style={styles.detailsLabel}>Approximate area</Text><Text style={styles.detailsValue}>{[connectionDetails.donorArea, connectionDetails.donorCity].filter(Boolean).join(', ') || 'Kolkata'}</Text></View>
                </View>
                <View style={styles.incomingActions}>
                  <Pressable style={styles.donorRequestButton} onPress={() => callContact(connectionDetails.donorPhone, 'donor')}>
                    <Text style={styles.donorRequestText}>Call Donor</Text>
                  </Pressable>
                  <Pressable style={styles.donorRequestButtonSecondary} onPress={() => whatsappContact(connectionDetails.donorPhone, 'donor')}>
                    <Text style={styles.donorRequestButtonSecondaryText}>WhatsApp Donor</Text>
                  </Pressable>
                </View>
              </>
            ) : donorResponses.some((item) => item.status === 'accepted') ? (
              <>
                <Text style={styles.detailsValue}>An eligible donor has accepted.</Text>
                <Text style={styles.detailsMuted}>Donor contact details appear here after you select an accepted donor.</Text>
              </>
            ) : (
              <>
                <Text style={styles.detailsValue}>Waiting for donor acceptance</Text>
                <Text style={styles.detailsMuted}>No personal contact details are shared until a donor accepts.</Text>
              </>
            )
          ) : (
            <>
              <Text style={styles.detailsHospitalName}>Your Donation Details</Text>
              <View style={styles.detailsGrid}>
                <View><Text style={styles.detailsLabel}>Requester contact number</Text><Text style={styles.detailsValue}>{connectionDetails?.requesterPhone || 'Not available'}</Text></View>
                <View><Text style={styles.detailsLabel}>Blood Group and Units</Text><Text style={styles.detailsAccentValue}>{request.bloodGroup} · {request.unitsRequired} {request.unitsRequired === 1 ? 'unit' : 'units'}</Text></View>
                <View><Text style={styles.detailsLabel}>Hospital</Text><Text style={styles.detailsValue}>{request.hospitalName}</Text></View>
                <View><Text style={styles.detailsLabel}>Hospital address</Text><Text style={styles.detailsValue}>{request.hospitalAddress || [request.area, request.city].filter(Boolean).join(', ')}</Text></View>
                <View><Text style={styles.detailsLabel}>Required by</Text><Text style={styles.detailsValue}>{formatRequestDeadline(request)}</Text></View>
              </View>
              <View style={styles.incomingActions}>
                <Pressable style={styles.donorRequestButton} onPress={() => callContact(connectionDetails?.requesterPhone || null, 'requester')}>
                  <Text style={styles.donorRequestText}>Call Requester</Text>
                </Pressable>
                <Pressable style={styles.donorRequestButtonSecondary} onPress={openHospitalDirections}>
                  <Text style={styles.donorRequestButtonSecondaryText}>Open in Google Maps</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsSectionHeading}>
            <MaterialCommunityIcons name="timeline" size={22} color="#760009" />
            <Text style={styles.detailsSectionTitle}>Request Timeline</Text>
            <Text style={styles.stepBadge}>Live status</Text>
          </View>
          {[
            ['check', 'Request Status', `Current status: ${request.status}.`, true],
            ['account-group', 'Donor Responses (' + donorResponses.length + ')', donorResponses.length ? 'Responses are shown below.' : 'No donor responses are recorded yet.', donorResponses.length > 0],
            ...(request.status === 'fulfilled' ? [['check-circle-outline', 'Marked Fulfilled', 'The requester marked this request fulfilled. Hospital records are the source of truth for donation completion.', true]] : []),
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

        {connectionDetails?.isRequester ? <View style={styles.detailsCard} onLayout={(event) => setDonorResponsesY(event.nativeEvent.layout.y)}>
          <View style={styles.detailsSectionHeading}>
            <Text style={styles.detailsSectionTitle}>Donor Responses ({donorResponses.length})</Text>
            {donorResponses.some((item) => item.status === 'accepted') ? <Text style={styles.activeMatchBadge}>Accepted</Text> : null}
            <Pressable
              style={styles.detailsRefreshButton}
              onPress={() => void refreshRequest(false)}
              accessibilityLabel="Refresh donor responses"
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#760009" />
            </Pressable>
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
        </View> : null}

        <DonationWorkflowCard requestId={request.id} />

        {connectionDetails?.isRequester ? <>
          {request.status === 'open' ? <Pressable style={styles.detailsPrimaryButton} onPress={onFindDonor}>
            <MaterialCommunityIcons name="account-search" size={22} color="#ffffff" />
            <Text style={styles.detailsPrimaryText}>Find Compatible Donors</Text>
          </Pressable> : null}
          <Pressable
            style={styles.detailsSecondaryButton}
            onPress={() => detailsScrollRef.current?.scrollTo({ y: Math.max(0, donorResponsesY - 20), animated: true })}
          >
            <MaterialCommunityIcons name="account-group" size={18} color="#191c1e" />
            <Text style={styles.detailsSecondaryDarkText}>View Donor Responses</Text>
          </Pressable>
          <View style={styles.detailsButtonRow}>
            <Pressable style={styles.detailsHalfButton} onPress={openEditRequest} disabled={request.status !== 'open'}><MaterialCommunityIcons name="pencil-outline" size={18} color="#191c1e" /><Text style={styles.detailsSecondaryDarkText}>Edit Request</Text></Pressable>
            <Pressable style={styles.detailsHalfButton} onPress={confirmCancelRequest}><MaterialCommunityIcons name="close-circle-outline" size={18} color="#ba1a1a" /><Text style={styles.cancelText}>Cancel Request</Text></Pressable>
          </View>
        </> : null}

        <View style={styles.detailsInfoBox}><MaterialCommunityIcons name="shield-check-outline" size={22} color="#760009" /><View style={styles.detailsInfoCopy}><Text style={styles.detailsValue}>Contact and privacy</Text><Text style={styles.detailsMuted}>Contact details are shown only to the requester and an accepted donor through this request. Confirm identity and arrangements directly with the hospital.</Text></View></View>
      </ScrollView>

      <Modal visible={Boolean(connectionDetails?.isRequester && requestOptionsVisible)} transparent animationType="fade" onRequestClose={() => setRequestOptionsVisible(false)}>
        <Pressable style={styles.profileModalBackdrop} onPress={() => setRequestOptionsVisible(false)}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Request options</Text>
            {[
              { icon: 'refresh', label: 'Refresh', action: () => void refreshRequest(false) },
              { icon: 'account-search', label: 'Find Compatible Donors', action: onFindDonor },
              { icon: 'pencil-outline', label: 'Edit Request', action: openEditRequest },
              ...(request.status !== 'cancelled' && request.status !== 'fulfilled' ? [{ icon: 'close-circle-outline', label: 'Cancel Request', action: confirmCancelRequest }] : []),
            ].map(({ icon, label, action }) => (
              <Pressable key={label} style={styles.profileSettingRow} onPress={() => { setRequestOptionsVisible(false); action(); }}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#760009" />
                <Text style={styles.profileValueText}>{label}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.profileModalCancel} onPress={() => setRequestOptionsVisible(false)}>
              <Text style={styles.profileModalCancelText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={editRequestVisible} transparent animationType="slide" onRequestClose={() => setEditRequestVisible(false)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>Edit Blood Request</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              <Text style={styles.profileModalLabel}>Patient Name</Text>
              <TextInput value={editDraft.patientName} onChangeText={(value) => setEditDraft((current) => ({ ...current, patientName: value }))} style={styles.profileModalInput} placeholder="Patient name" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Blood Group</Text>
              <View style={styles.profileBloodGrid}>
                {bloodGroups.map((group) => (
                  <Pressable key={group} onPress={() => setEditDraft((current) => ({ ...current, bloodGroup: group }))} style={[styles.profileBloodChoice, editDraft.bloodGroup === group && styles.profileBloodChoiceSelected]}>
                    <Text style={[styles.profileBloodChoiceText, editDraft.bloodGroup === group && styles.profileBloodChoiceTextSelected]}>{group}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.profileModalLabel}>Units Required</Text>
              <TextInput value={editDraft.unitsRequired} onChangeText={(value) => setEditDraft((current) => ({ ...current, unitsRequired: value.replace(/[^0-9]/g, '') }))} keyboardType="number-pad" style={styles.profileModalInput} placeholder="1" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Hospital Name</Text>
              <TextInput value={editDraft.hospitalName} onChangeText={(value) => setEditDraft((current) => ({ ...current, hospitalName: value }))} style={styles.profileModalInput} placeholder="Hospital name" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Hospital Address</Text>
              <TextInput value={editDraft.hospitalAddress} onChangeText={(value) => setEditDraft((current) => ({ ...current, hospitalAddress: value }))} style={styles.profileModalInput} placeholder="Hospital address" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>City</Text>
              <TextInput value={editDraft.city} onChangeText={(value) => setEditDraft((current) => ({ ...current, city: value }))} style={styles.profileModalInput} placeholder="Kolkata" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Area</Text>
              <TextInput value={editDraft.area} onChangeText={(value) => setEditDraft((current) => ({ ...current, area: value }))} style={styles.profileModalInput} placeholder="Area" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Required Date (YYYY-MM-DD)</Text>
              <TextInput value={editDraft.requiredDate} onChangeText={(value) => setEditDraft((current) => ({ ...current, requiredDate: value }))} style={styles.profileModalInput} placeholder="YYYY-MM-DD" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Required Time (HH:MM)</Text>
              <TextInput value={editDraft.requiredTime} onChangeText={(value) => setEditDraft((current) => ({ ...current, requiredTime: value }))} style={styles.profileModalInput} placeholder="HH:MM" placeholderTextColor="#8d706d" />
              <Text style={styles.profileModalLabel}>Contact Number</Text>
              <TextInput value={editDraft.contactPhone} onChangeText={(value) => setEditDraft((current) => ({ ...current, contactPhone: value }))} keyboardType="phone-pad" style={styles.profileModalInput} placeholder="+91..." placeholderTextColor="#8d706d" />
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleTitle}>Emergency Request</Text>
                  <Text style={styles.toggleSubtitle}>Notify compatible donors immediately.</Text>
                </View>
                <Switch value={editDraft.isEmergency} onValueChange={(value) => setEditDraft((current) => ({ ...current, isEmergency: value }))} trackColor={{ false: '#d9dfe4', true: '#760009' }} thumbColor="#ffffff" />
              </View>
            </ScrollView>
            <View style={styles.profileModalActions}>
              <Pressable style={styles.profileModalCancel} onPress={() => setEditRequestVisible(false)}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.profileModalSave} onPress={() => void saveEditedRequest()} disabled={editSaving}>
                <Text style={styles.profileModalSaveText}>{editSaving ? 'Saving...' : 'Save Changes'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <Pressable style={styles.bottomNavItem} onPress={onHome} accessibilityLabel="Home"><MaterialCommunityIcons name="home" size={20} color="#59413e" /><Text style={styles.bottomNavText}>Home</Text></Pressable>
        <Pressable style={styles.bottomNavItem} onPress={onFindDonor} accessibilityLabel="Find Donor"><MaterialCommunityIcons name="account-search" size={20} color="#59413e" /><Text style={styles.bottomNavText}>Find Donor</Text></Pressable>
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
  onFindDonor,
  onRequests,
  onNotifications,
  onOpenRequest,
  onSignOut,
}: {
  onHome: () => void;
  onFindDonor: () => void;
  onRequests: () => void;
  onNotifications: () => void;
  onOpenRequest: (requestId: string) => void;
  onSignOut: () => Promise<void>;
}) {
  const { user, createProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [latestRequest, setLatestRequest] = useState<BloodRequest | null>(null);
  const [draftProfile, setDraftProfile] = useState<ProfileData>({
    name: '',
    phone: '',
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    area: '',
    donorAvailable: false,
  });
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [emergencyContactId, setEmergencyContactId] = useState<string | null>(null);
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

    const latestRequestResult = await supabase
      .from('blood_requests')
      .select('id, patient_name, blood_group, units_required, hospital_name, hospital_address, city, area, required_date, required_time, status, is_emergency, contact_phone')
      .eq('requester_id', userData.user.id)
      .neq('status', 'cancelled')
      .neq('patient_name', 'Donor Directory Seeker')
      .neq('patient_name', 'Donor Inquiry')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestRequestResult.error) {
      setProfileError((current) => current || `Unable to load your blood requests: ${latestRequestResult.error.message}`);
    } else {
      setLatestRequest(latestRequestResult.data ? toBloodRequest(latestRequestResult.data as BloodRequestRow) : null);
    }

    const contactResult = await supabase
      .from('emergency_contacts')
      .select('id, name, phone, relationship')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (contactResult.error) {
      setProfileError((current) => current || `Unable to load your emergency contact: ${contactResult.error.message}`);
    }

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
      bloodGroup: data.blood_group || '',
      dateOfBirth: data.date_of_birth || '',
      gender: data.gender || '',
      city: data.city || '',
      area: data.area || '',
      donorAvailable: data.donor_available ?? false,
    };
    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    setAvailableToDonate(nextProfile.donorAvailable);
    setEmergencyContactId(contactResult.data?.id || null);
    setEmergencyContact(
      contactResult.data
        ? { name: contactResult.data.name, phone: contactResult.data.phone, relationship: contactResult.data.relationship }
        : data.emergency_contact_name || data.emergency_contact_phone
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
        blood_group: draftProfile.bloodGroup || null,
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
      showMessage('Missing details', 'Please complete all emergency contact fields.');
      return;
    }
    setSaving(true);
    setProfileError('');
    try {
      if (!user) throw new Error('Your authenticated user could not be found.');
      const contactRow = {
        user_id: user.id,
        name: draftContact.name.trim(),
        phone: draftContact.phone.trim(),
        relationship: draftContact.relationship.trim(),
      };
      const result = emergencyContactId
        ? await supabase.from('emergency_contacts').update(contactRow).eq('id', emergencyContactId)
        : await supabase.from('emergency_contacts').insert(contactRow).select('id').single();
      if (result.error) throw new Error(result.error.message);
      if ('data' in result && result.data?.id) setEmergencyContactId(result.data.id);
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
    if (nextValue && (!profile.bloodGroup || !profile.city)) {
      showMessage('Complete your profile', 'Add your blood group and city before marking yourself available to donate.');
      return;
    }
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
    const result = await createProfile({ fullName: fallbackName, bloodGroup: user?.user_metadata?.blood_group || null });
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

  const openProfileSetting = async (label: string) => {
    if (label === 'Notifications') {
      onNotifications();
      return;
    }
    if (label === 'Location Permissions') {
      await openAppSettings();
      return;
    }
    if (label === 'My Phone Number') {
      openEditProfile();
      return;
    }
    if (label === 'Privacy' || label === 'Privacy Settings') {
      showMessage(
        'BloodConnect Privacy',
        'Your donor home address is not shown to other users. Exact donor location and personal contact details are shared only with appropriate consent.',
      );
      return;
    }
    if (label === 'Location Sharing') {
      showMessage(
        'Location Sharing',
        'BloodConnect shows approximate donor area before acceptance. Exact donor location is not shared publicly.',
      );
      return;
    }
    if (label === 'Help & Support') {
      showMessage('Help & Support', 'For urgent medical needs, contact the hospital or local emergency services directly. BloodConnect coordinates requests and does not provide medical advice or emergency response.');
      return;
    }
    if (label === 'About BloodConnect') {
      showMessage('About BloodConnect', 'BloodConnect — Kolkata blood donation coordination app.');
    }
  };

  const loadDonationHistory = async () => {
    if (!user) return;
    setProfileError('');
    const result = await supabase
      .from('donation_history')
      .select('donation_date, hospital_name, blood_group, notes')
      .eq('donor_id', user.id)
      .order('donation_date', { ascending: false });

    if (result.error) {
      showMessage('Donation History', result.error.message);
      return;
    }

    const rows = (result.data || []) as Array<{
      donation_date: string;
      hospital_name: string | null;
      blood_group: string | null;
      notes: string | null;
    }>;

    showMessage(
      'Donation History',
      rows.length
        ? rows
            .map(
              (row) =>
                [row.donation_date, row.hospital_name || 'Hospital not added', row.blood_group || profile.bloodGroup, row.notes]
                  .filter(Boolean)
                  .join(' • '),
            )
            .join('\n\n')
        : 'No donation history has been added yet. Records you add here are self-reported.',
    );
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
              <Text style={styles.profileBloodText}>{profile.bloodGroup || 'Not provided'}</Text>
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
              <Text style={styles.profileAccentText}>{profile.bloodGroup || 'Not provided'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Date of Birth</Text>
              <Text style={styles.profileValueText}>{profile.dateOfBirth || 'Not added yet'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileMutedText}>Gender</Text>
              <Text style={styles.profileValueText}>{profile.gender || 'Not added yet'}</Text>
            </View>
          </View>
          <Pressable style={styles.profilePrimaryButton} onPress={openEditProfile}>
            <MaterialCommunityIcons name="update" size={18} color="#ffffff" />
            <Text style={styles.profilePrimaryButtonText}>Update Information</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardHeadingRow}>
            <Text style={styles.profileSectionTitle}>My Blood Requests</Text>
            {latestRequest ? <Text style={styles.profileStatusPill}>{latestRequest.status}</Text> : null}
          </View>
          {latestRequest ? <View style={styles.profileRequestPreview}>
            <View style={styles.profileRequestTopRow}>
              <Text style={styles.profileRequestBlood}>{latestRequest.bloodGroup}</Text>
              <Text style={styles.profileRequestUnits}>{latestRequest.unitsRequired} units required</Text>
            </View>
            <View style={styles.profileLocationRow}>
              <MaterialCommunityIcons name="hospital" size={16} color="#59413e" />
              <Text style={styles.profileMutedText}>{latestRequest.hospitalName}, {latestRequest.city}</Text>
            </View>
          </View> : <Text style={styles.profileMutedText}>You have no active blood requests.</Text>}
          <View style={styles.profileButtonRow}>
            {latestRequest ? <Pressable style={styles.profilePrimaryButtonSmall} onPress={() => onOpenRequest(latestRequest.id)}>
              <Text style={styles.profilePrimaryButtonText}>View Request</Text>
            </Pressable> : null}
            <Pressable style={styles.profileSecondaryButton} onPress={onRequests}>
              <Text style={styles.profileSecondaryButtonText}>View All</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Contact &amp; Privacy</Text>
          {[
              ['phone', 'My Phone Number', profile.phone || 'Not provided'],
            ['map-marker', 'Location Sharing', 'Request area only'],
            ['lock', 'Privacy Settings', 'View details'],
          ].map(([icon, label, value]) => (
            <Pressable key={label} style={styles.profileSettingRow} onPress={() => void openProfileSetting(label)}>
              <View style={styles.profileSettingLabel}>
                <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color="#59413e" />
                <Text style={styles.profileValueText}>{label}</Text>
              </View>
              <View style={styles.profileSettingValue}>
                <Text style={styles.profileMutedText}>{value}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#59413e" />
              </View>
            </Pressable>
          ))}
          <Text style={styles.profilePrivacyNote}>BloodConnect does not expose your exact GPS coordinates to other users. When donor availability is enabled, your latest GPS position may be stored privately for nearby matching.</Text>
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
          <Text style={styles.profileMutedText}>Your personal donation history. Entries are self-reported and do not confirm medical eligibility.</Text>
          <Pressable style={styles.profileSecondaryButtonFull} onPress={() => void loadDonationHistory()}>
            <Text style={styles.profileSecondaryButtonText}>View Full History</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Settings</Text>
          {[
            ['bell-outline', 'Notifications'],
            ['shield-check-outline', 'Privacy'],
            ['crosshairs-gps', 'Location Permissions'],
            ['help-circle-outline', 'Help & Support'],
            ['information-outline', 'About BloodConnect'],
          ].map(([icon, label]) => (
            <Pressable key={label} style={styles.profileSettingRow} onPress={() => void openProfileSetting(label)}>
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

        <Pressable style={styles.bottomNavItem} onPress={onFindDonor} accessibilityLabel="Find Donor">
          <MaterialCommunityIcons name="account-search" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Find Donor</Text>
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
  onFindDonor,
  onRequests,
  onProfile,
}: {
  onBack: () => void;
  onHome: () => void;
  onFindDonor: () => void;
  onRequests: () => void;
  onProfile: () => void;
}) {
  const { user } = useAuth();
  const [selectedBlood, setSelectedBlood] = useState('');
  const [units, setUnits] = useState(2);
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [requiredDate, setRequiredDate] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [scheduleDateDraft, setScheduleDateDraft] = useState('');
  const [scheduleTimeDraft, setScheduleTimeDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fillCurrentLocation = async () => {
    setErrorMessage('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        showMessage('Location permission needed', 'Allow BloodConnect to use your location while the app is open to fill the request location.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      setLocationCoords({ latitude, longitude });

      let label = '';
      if (Platform.OS !== 'web') {
        try {
          const places = await Location.reverseGeocodeAsync({ latitude, longitude });
          const place = places[0];
          label = [place?.subregion, place?.district, place?.city, place?.region]
            .filter((value): value is string => Boolean(value?.trim()))
            .filter((value, index, values) => values.findIndex((part) => part.toLowerCase() === value.toLowerCase()) === index)
            .join(', ');
        } catch {
          // Reverse geocoding is unavailable on web and can fail on-device.
        }
      }

      if (label) {
        setLocation(label);
        showMessage('Location added', 'The approximate current area has been added to the hospital/location field. Verify that it is the hospital location before submitting.');
      } else {
        const currentLocation = location.trim();
        setLocation(currentLocation);
        showMessage('Address lookup unavailable', 'Your location was detected, but this platform could not convert it to an address. Enter the hospital area or full address manually.');
      }
    } catch (error) {
      showMessage('Unable to get location', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const openSchedule = () => {
    setScheduleDateDraft(requiredDate);
    setScheduleTimeDraft(requiredTime);
    setScheduleVisible(true);
  };

  const useCurrentDateTime = () => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    setScheduleDateDraft(now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()));
    setScheduleTimeDraft(pad(now.getHours()) + ':' + pad(now.getMinutes()));
  };

  const saveSchedule = () => {
    if (scheduleDateDraft) {
      const parsedDate = new Date(`${scheduleDateDraft}T00:00:00`);
      const pad = (value: number) => String(value).padStart(2, '0');
      const localDate = `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}`;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDateDraft) || Number.isNaN(parsedDate.getTime()) || localDate !== scheduleDateDraft) {
        showMessage('Invalid date', 'Enter a real date using YYYY-MM-DD.');
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        showMessage('Invalid date', 'The required date cannot be in the past.');
        return;
      }
    }
    if (scheduleTimeDraft) {
      const match = scheduleTimeDraft.match(/^(\d{2}):(\d{2})$/);
      if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
        showMessage('Invalid time', 'Enter a real time using HH:MM.');
        return;
      }
    }
    setRequiredDate(scheduleDateDraft);
    setRequiredTime(scheduleTimeDraft);
    setScheduleVisible(false);
  };

  const handleSubmit = async () => {
    if (!patientName.trim() || !selectedBlood || !hospitalName.trim() || !location.trim() || !phone.trim()) {
      showMessage('Missing details', 'Please enter the patient name, required blood group, hospital, location and contact number.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      showMessage('Invalid phone number', 'Enter a valid 10 digit Indian mobile number.');
      return;
    }

    if (!user) {
      setErrorMessage('You must be signed in to create a blood request.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    const { data: createdRequest, error } = await supabase.from('blood_requests').insert({
      requester_id: user.id,
      patient_name: patientName.trim(),
      blood_group: selectedBlood,
      units_required: units,
      hospital_name: hospitalName.trim(),
      hospital_address: location.trim(),
      city: 'Kolkata',
      area: location.trim() || null,
      // Keep exact device coordinates private; the entered/derived location is used as the hospital location label.
      latitude: null,
      longitude: null,
      required_date: requiredDate || null,
      required_time: requiredTime || null,
      is_emergency: emergencyMode,
      contact_phone: '+91' + phoneDigits,
      status: 'open',
    }).select('id').single();

    if (error) {
      setErrorMessage(`Unable to submit blood request: ${error.message}`);
      setSaving(false);
      return;
    }

    if (createdRequest?.id) {
      void supabase.functions.invoke('send-blood-request-push', {
        body: { requestId: createdRequest.id },
      }).then(({ error: pushError }) => {
        if (pushError) console.warn('Unable to send donor push alerts:', pushError.message);
      }).catch((pushError: unknown) => console.warn('Unable to send donor push alerts:', pushError));
    }

    setPatientName('');
    setHospitalName('');
    setLocation('');
    setPhone('');
    setSelectedBlood('');
    setUnits(2);
    setEmergencyMode(true);
    setRequiredDate('');
    setRequiredTime('');
    setLocationCoords(null);
    setSaving(false);
    if (Platform.OS === 'web') {
      showMessage('Request submitted', 'Your blood request has been saved.');
      onRequests();
    } else {
      Alert.alert('Request submitted', 'Your blood request has been saved.', [{ text: 'View Requests', onPress: onRequests }]);
    }
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
                <Text style={styles.scheduleSubtitle}>This name, requested blood group, hospital and approximate area are shown to compatible donors. Do not add extra medical details here.</Text>
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
                    onChangeText={(value) => {
                      setLocation(value);
                      setLocationCoords(null);
                    }}
                    placeholder="Hospital area or full address"
                    placeholderTextColor="#8d706d"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <Pressable style={styles.inlineAction} onPress={() => void fillCurrentLocation()}>
                <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#760009" />
                <Text style={styles.inlineActionText}>Use Current Location</Text>
              </Pressable>

            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>When is blood needed?</Text>

            <View style={styles.card}>
              <Pressable style={styles.scheduleRow} onPress={openSchedule} accessibilityLabel="Select required date and time">
                <View style={styles.scheduleTextWrap}>
                  <MaterialCommunityIcons name="calendar" size={18} color="#760009" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleTitle}>Select required date &amp; time</Text>
                    <Text style={styles.scheduleSubtitle}>
                      {requiredDate || requiredTime ? [requiredDate, requiredTime].filter(Boolean).join(' • ') : 'Immediate / As soon as possible'}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#8d706d" />
              </Pressable>

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
                <MaterialCommunityIcons name="lock" size={14} color="#59413e" /> This number is shown to donors who accept this request so they can coordinate directly with you.
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Request Summary</Text>
              <View style={styles.priorityPill}>
                <Text style={styles.priorityText}>{emergencyMode ? 'Emergency' : 'Standard'}</Text>
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
                <Text style={styles.summaryValue}>{hospitalName || 'Not entered yet'}</Text>
              </View>

              <View style={styles.summaryRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color="#760009" />
                <Text style={styles.summaryKey}>Location:</Text>
                <Text style={styles.summaryValue}>{location || 'Not entered yet'}</Text>
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

      <Modal visible={scheduleVisible} transparent animationType="slide" onRequestClose={() => setScheduleVisible(false)}>
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            <Text style={styles.profileModalTitle}>When is blood needed?</Text>
            <Text style={styles.profileModalLabel}>Required date (YYYY-MM-DD)</Text>
            <TextInput
              value={scheduleDateDraft}
              onChangeText={setScheduleDateDraft}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Text style={styles.profileModalLabel}>Required time (HH:MM)</Text>
            <TextInput
              value={scheduleTimeDraft}
              onChangeText={setScheduleTimeDraft}
              placeholder="HH:MM"
              placeholderTextColor="#8d706d"
              style={styles.profileModalInput}
            />
            <Pressable style={styles.profileOutlineButton} onPress={useCurrentDateTime}>
              <MaterialCommunityIcons name="clock-fast" size={18} color="#760009" />
              <Text style={styles.profileOutlineButtonText}>Use Current Date &amp; Time</Text>
            </Pressable>
            <View style={styles.profileModalActions}>
              <Pressable style={styles.profileModalCancel} onPress={() => setScheduleVisible(false)}>
                <Text style={styles.profileModalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.profileModalSave} onPress={saveSchedule}>
                <Text style={styles.profileModalSaveText}>Save Schedule</Text>
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

        <Pressable style={styles.bottomNavItem} onPress={onFindDonor} accessibilityLabel="Find Donor">
          <MaterialCommunityIcons name="account-search" size={20} color="#59413e" />
          <Text style={styles.bottomNavText}>Find Donor</Text>
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
    backgroundColor: '#ffffff',
  },
  heroCarouselContainer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  heroCarouselSlide: {
    ...StyleSheet.absoluteFill,
  },
  heroCarouselImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#ffffff',
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
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
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
    height: 284,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 'auto',
  },
  locationBadgeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLandmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  locationDividerText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 11,
  },
  locationSubText: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: 11,
    fontWeight: '500',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  carouselIndicatorsCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  carouselDotTouch: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  carouselDotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginTop: -24,
    marginBottom: 18,
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
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
    backgroundColor: '#ffffff',
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
  modeToggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  modeToggleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e2e5',
  },
  modeToggleChipActive: {
    backgroundColor: '#ffe3df',
    borderColor: '#760009',
  },
  modeToggleText: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  modeToggleTextActive: {
    color: '#760009',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e2e5',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#191c1e',
    fontSize: 14,
    padding: 0,
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
  myDonorCard: {
    backgroundColor: '#fff7f5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffdad6',
    shadowColor: '#991b1b',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  myDonorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffdad6',
  },
  myDonorLabelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  myDonorLabelText: {
    color: '#760009',
    fontSize: 13,
    fontWeight: '700',
  },
  myDonorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  myDonorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  myDonorBadge: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    backgroundColor: '#760009',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  myDonorNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffdad6',
  },
  myDonorNoticeContent: {
    flex: 1,
  },
  myDonorNoticeText: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  myDonorNoticeSubtext: {
    color: '#8d706d',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
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
  sameAreaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  sameAreaBadgeText: {
    color: '#065f46',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  donorContactBox: {
    backgroundColor: '#fdf7f6',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffdad6',
  },
  donorPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  donorPhoneText: {
    color: '#191c1e',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  contactCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#760009',
    borderRadius: 10,
    paddingVertical: 9,
  },
  contactSmsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d4d8',
    borderRadius: 10,
    paddingVertical: 9,
  },
  contactWaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 9,
  },
  contactBtnText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  contactDarkBtnText: {
    color: '#191c1e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  noPhoneText: {
    color: '#7c5855',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
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

  donorRequestButtonDisabled: {
    backgroundColor: '#e0e3e5',
  },
  donorRequestButtonSecondary: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8d706d',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  donorRequestButtonSecondaryText: {
    color: '#191c1e',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  incomingRequestCard: {
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
  incomingPrivacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f2f4f6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  incomingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  donorWithdrawButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f0d8d5',
    backgroundColor: '#fff7f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  donorWithdrawText: {
    color: '#760009',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  incomingStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8dcdc',
    borderRadius: 12,
    padding: 10,
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
  detailsRefreshButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f2f4f6', alignItems: 'center', justifyContent: 'center' },
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

  requestsListScroll: {
    flex: 1,
  },
  requestsListContent: {
    paddingHorizontal: 24,
    paddingBottom: 112,
    gap: 12,
  },
  requestsSectionTitle: {
    color: '#191c1e',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    marginTop: 8,
  },
  requestsSectionSubtitle: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 17,
    marginTop: -4,
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
  bloodRequestCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginHorizontal: 24, shadowColor: '#991b1b', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  requestCardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  requestCardBloodBadge: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#ffdad6', alignItems: 'center', justifyContent: 'center' },
  requestCardBloodText: { color: '#760009', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  requestCardCopy: { flex: 1, gap: 3 },
  requestCardStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestCardPatient: { color: '#191c1e', fontSize: 18, lineHeight: 26, fontWeight: '600' },
  requestCardHint: { color: '#760009', fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 12 },
});

function AppContent() {
  const { session, loading, signIn, signUp, signOut } = useAuth();
  const [screen, setScreen] = useState<'home' | 'request' | 'requests' | 'requestDetails' | 'profile' | 'findDonor' | 'notifications'>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestDetailsReturnScreen, setRequestDetailsReturnScreen] = useState<'requests' | 'notifications' | 'profile'>('requests');
  const [findDonorReturnScreen, setFindDonorReturnScreen] = useState<'home' | 'requestDetails'>('home');
  const [notificationsReturnScreen, setNotificationsReturnScreen] = useState<'home' | 'profile'>('home');
  const goHome = () => { setSelectedRequestId(null); setScreen('home'); };
  const goFindDonor = () => { setSelectedRequestId(null); setFindDonorReturnScreen('home'); setScreen('findDonor'); };
  const goRequests = () => { setSelectedRequestId(null); setScreen('requests'); };
  const goProfile = () => { setSelectedRequestId(null); setScreen('profile'); };
  const openFindDonorFromHome = () => {
    setSelectedRequestId(null);
    setFindDonorReturnScreen('home');
    setScreen('findDonor');
  };
  const openFindDonorFromDetails = () => { setFindDonorReturnScreen('requestDetails'); setScreen('findDonor'); };
  const openNotifications = (source: 'home' | 'profile') => { setNotificationsReturnScreen(source); setScreen('notifications'); };
  const openRequestDetails = (requestId: string, source: 'requests' | 'notifications' | 'profile') => {
    setRequestDetailsReturnScreen(source);
    setSelectedRequestId(requestId);
    setScreen('requestDetails');
  };

  useEffect(() => {
    if (!session || Platform.OS === 'web' || !Constants.isDevice) return;
    let active = true;
    const register = async () => {
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
        if (!projectId) return;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('blood-requests', {
            name: 'Blood request alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
          });
        }
        const permission = await Notifications.getPermissionsAsync();
        const finalStatus = permission.status === 'granted'
          ? permission.status
          : (await Notifications.requestPermissionsAsync()).status;
        if (finalStatus !== 'granted' || !active) return;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (!active) return;
        await supabase.from('device_push_tokens').upsert({
          user_id: session.user.id,
          expo_push_token: token,
          platform: Platform.OS,
        }, { onConflict: 'expo_push_token' });
      } catch (error) {
        console.warn('Unable to register push notifications:', error);
      }
    };
    void register();
    const openFromNotification = (response: Notifications.NotificationResponse) => {
      const requestId = response.notification.request.content.data?.requestId;
      if (typeof requestId === 'string') openRequestDetails(requestId, 'notifications');
    };
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) openFromNotification(lastResponse);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    return () => {
      active = false;
      responseSubscription.remove();
    };
  }, [session?.user.id]);

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
        onFindDonor={goFindDonor}
        onRequests={goRequests}
        onProfile={goProfile}
        onNotifications={() => openNotifications('home')}
      />
    );
  }

  if (screen === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setScreen(notificationsReturnScreen)}
        onHome={goHome}
        onRequests={goRequests}
        onProfile={goProfile}
        onOpenRequest={(requestId) => openRequestDetails(requestId, 'notifications')}
      />
    );
  }

  if (screen === 'request') {
    return (
      <RequestBloodScreen
        onBack={goHome}
        onHome={goHome}
        onFindDonor={goFindDonor}
        onRequests={goRequests}
        onProfile={goProfile}
      />
    );
  }

  if (screen === 'requests') {
    return (
      <RequestsScreen
        onHome={goHome}
        onFindDonor={goFindDonor}
        onProfile={goProfile}
        onRequestDetails={(requestId) => openRequestDetails(requestId, 'requests')}
      />
    );
  }

  if (screen === 'requestDetails') {
    return (
      <BloodRequestDetailsScreen
        onBack={() => setScreen(requestDetailsReturnScreen)}
        onHome={goHome}
        onFindDonor={openFindDonorFromDetails}
        onRequests={goRequests}
        onProfile={goProfile}
        requestId={selectedRequestId || ''}
      />
    );
  }

  if (screen === 'findDonor') {
    return (
      <FindDonorScreen
        onBack={() => setScreen(findDonorReturnScreen)}
        onHome={goHome}
        onFindDonor={goFindDonor}
        onRequests={goRequests}
        onProfile={goProfile}
        onRequestBlood={() => setScreen('request')}
        requestId={selectedRequestId}
      />
    );
  }

  return (
    <ProfileScreen
      onHome={goHome}
      onFindDonor={goFindDonor}
      onRequests={goRequests}
      onNotifications={() => openNotifications('profile')}
      onOpenRequest={(requestId) => openRequestDetails(requestId, 'profile')}
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
