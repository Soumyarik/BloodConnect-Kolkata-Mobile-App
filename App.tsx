import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNwv9RW78-JfebQWjT2TUScOmIeBnv3NQXDzTuiciY9uZbrJJkyU4Lg8ByPzzTeSg1dUxAueLjxliDQkm4u65_yKtzsQu2bgK5cGwsWwyxopzRSbuUdbD2UPIf9rs1v-HqTtXyhxJH1WjNBbdYznIrigrooMsZYL0KqfnT1vz_IoxcjQaTAPpjkpq3fJf5MWxH-5LMdheTkRypPl4e2fBRNSzam2IrIocXg206shWo16lHVyeujyPUfA';
const logoImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCBSk6a55NuwAytbnzJJPnsRtAfy8KaH9s2AX5xnGC1tMryE2hrKW2bKPuZHfxU-LghrmXOvWZSoOzRatbsAAy6w_4p3XBtBj1tf10-TlKq9uDbbHHAIFEFx7xMF-d7AhjHMHZylGhaGwlmPmOhnzvpw7VRog9pXWIQPdOpq5H2dHA0ng97Ly18mZRdGDB1N0zlbdWpM89e6lcz6m2U-V4Y7BIYzhS8fo4qKCG4YdXJ5jy8apzX0Ebj_A';

export default function App() {
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

          <Pressable style={styles.primaryButton} accessibilityLabel="Request Blood">
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

        <Pressable style={styles.tabItem} accessibilityLabel="Requests">
          <MaterialCommunityIcons name="water" size={20} color="#59413e" />
          <Text style={styles.tabText}>Requests</Text>
        </Pressable>

        <Pressable style={styles.tabItem} accessibilityLabel="Profile">
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={styles.tabText}>Profile</Text>
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
});
