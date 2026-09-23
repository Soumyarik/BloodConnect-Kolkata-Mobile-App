import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  request_id: string | null;
  response_id: string | null;
  read_at: string | null;
  created_at: string;
};

const iconForType = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (type.includes('accepted') || type === 'donor_selected') return 'check-circle-outline';
  if (type.includes('declined') || type.includes('withdrawn')) return 'close-circle-outline';
  if (type === 'donor_request') return 'account-heart-outline';
  if (type.includes('workflow_')) return 'timeline-check-outline';
  return 'bell-outline';
};

const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + 'd ago';
  return date.toLocaleDateString();
};

export function NotificationsScreen({
  onBack,
  onHome,
  onRequests,
  onProfile,
  onOpenRequest,
}: {
  onBack: () => void;
  onHome: () => void;
  onRequests: () => void;
  onProfile: () => void;
  onOpenRequest: (requestId: string) => void;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = async (showLoading = false) => {
    if (!user) return;
    if (showLoading) setLoading(true);

    const result = await supabase
      .from('notifications')
      .select('id, type, title, message, request_id, response_id, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (result.error) {
      setErrorMessage(result.error.message);
      if (showLoading) setLoading(false);
      return;
    }

    setItems((result.data || []) as NotificationItem[]);
    setErrorMessage('');
    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    void loadNotifications(true);

    if (!user) return;

    const channel = supabase
      .channel('bloodconnect-notifications-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + user.id,
        },
        (payload) => {
          const row = payload.new as NotificationItem;
          setItems((current) => [row, ...current.filter((item) => item.id !== row.id)]);
        },
      )
      .subscribe();

    const interval = setInterval(() => {
      void loadNotifications(false);
    }, 8000);

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (item: NotificationItem) => {
    if (item.read_at || !user) return;

    const result = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', item.id)
      .eq('user_id', user.id);

    if (result.error) {
      Alert.alert('Unable to update notification', result.error.message);
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry,
      ),
    );
  };

  const markAllRead = async () => {
    if (!user) return;

    const unreadIds = items.filter((item) => !item.read_at).map((item) => item.id);
    if (unreadIds.length === 0) return;

    const result = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
      .eq('user_id', user.id);

    if (result.error) {
      Alert.alert('Unable to mark notifications read', result.error.message);
      return;
    }

    const readAt = new Date().toISOString();
    setItems((current) => current.map((entry) => ({ ...entry, read_at: entry.read_at || readAt })));
  };

  const unreadCount = items.filter((item) => !item.read_at).length;

  return (
    <View style={notificationStyles.screen}>
      <View style={notificationStyles.header}>
        <Pressable style={notificationStyles.iconButton} onPress={onBack} accessibilityLabel="Go back">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#191c1e" />
        </Pressable>
        <View style={notificationStyles.headerCopy}>
          <Text style={notificationStyles.title}>Notifications</Text>
          <Text style={notificationStyles.subtitle}>
            {unreadCount > 0 ? unreadCount + ' unread update' + (unreadCount === 1 ? '' : 's') : 'You are all caught up'}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable style={notificationStyles.markAllButton} onPress={() => void markAllRead()}>
            <Text style={notificationStyles.markAllText}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={notificationStyles.scroll}
        contentContainerStyle={notificationStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage ? <Text style={notificationStyles.error}>{errorMessage}</Text> : null}

        {loading ? (
          <Text style={notificationStyles.loading}>Loading notifications...</Text>
        ) : items.length > 0 ? (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={[notificationStyles.card, !item.read_at && notificationStyles.cardUnread]}
              onPress={() => {
                void markAsRead(item);
                if (item.request_id) {
                  const requesterFacing =
                    item.type === 'donor_response_accepted' ||
                    item.type === 'donor_response_declined' ||
                    item.type === 'donor_response_withdrawn' ||
                    item.type === 'workflow_coming_to_hospital' ||
                    item.type === 'workflow_arrived' ||
                    item.type === 'workflow_donating';

                  if (requesterFacing) {
                    onOpenRequest(item.request_id);
                  } else {
                    onRequests();
                  }
                }
              }}
            >
              <View style={notificationStyles.iconCircle}>
                <MaterialCommunityIcons name={iconForType(item.type)} size={21} color="#760009" />
              </View>
              <View style={notificationStyles.copy}>
                <View style={notificationStyles.titleRow}>
                  <Text style={notificationStyles.cardTitle}>{item.title}</Text>
                  {!item.read_at ? <View style={notificationStyles.unreadDot} /> : null}
                </View>
                <Text style={notificationStyles.message}>{item.message}</Text>
                <Text style={notificationStyles.time}>{formatNotificationTime(item.created_at)}</Text>
                {item.request_id ? (
                  <Text style={notificationStyles.openHint}>Tap to open the blood request</Text>
                ) : null}
              </View>
            </Pressable>
          ))
        ) : (
          <View style={notificationStyles.emptyCard}>
            <View style={notificationStyles.emptyIcon}>
              <MaterialCommunityIcons name="bell-off-outline" size={34} color="#760009" />
            </View>
            <Text style={notificationStyles.emptyTitle}>No notifications yet</Text>
            <Text style={notificationStyles.emptyText}>
              Blood-help requests, donor responses and donation progress updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={notificationStyles.bottomNav}>
        <Pressable style={notificationStyles.bottomNavItem} onPress={onHome}>
          <MaterialCommunityIcons name="home" size={20} color="#59413e" />
          <Text style={notificationStyles.bottomNavText}>Home</Text>
        </Pressable>
        <Pressable style={notificationStyles.bottomNavItem} onPress={onRequests}>
          <MaterialCommunityIcons name="water" size={20} color="#59413e" />
          <Text style={notificationStyles.bottomNavText}>Requests</Text>
        </Pressable>
        <Pressable style={notificationStyles.bottomNavItem} onPress={onProfile}>
          <MaterialCommunityIcons name="account" size={20} color="#59413e" />
          <Text style={notificationStyles.bottomNavText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const notificationStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f9fb' },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f7f9fb',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  title: { color: '#191c1e', fontSize: 21, lineHeight: 28, fontWeight: '700' },
  subtitle: { color: '#59413e', fontSize: 12, lineHeight: 17, marginTop: 2 },
  markAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffe3df',
  },
  markAllText: { color: '#760009', fontSize: 11, lineHeight: 15, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 112, gap: 10 },
  loading: { color: '#59413e', textAlign: 'center', paddingVertical: 30 },
  error: { color: '#ba1a1a', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#eef0f2',
  },
  cardUnread: { borderColor: '#f0c8c4', backgroundColor: '#fffafa' },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ffe3df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: { color: '#191c1e', fontSize: 14, lineHeight: 20, fontWeight: '700', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#760009' },
  message: { color: '#59413e', fontSize: 12, lineHeight: 18, marginTop: 3 },
  time: { color: '#8d706d', fontSize: 11, lineHeight: 15, marginTop: 7 },
  openHint: { color: '#760009', fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 4 },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#ffe3df',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { color: '#191c1e', fontSize: 17, lineHeight: 24, fontWeight: '700' },
  emptyText: { color: '#59413e', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 5 },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247,249,251,0.94)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: 'row',
  },
  bottomNavItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8 },
  bottomNavText: { color: '#59413e', fontSize: 12, lineHeight: 16, fontWeight: '500' },
});
