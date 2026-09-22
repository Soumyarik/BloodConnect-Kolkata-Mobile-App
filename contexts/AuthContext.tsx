import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { supabase } from '../utils/supabase';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  bloodGroup: string;
};

type ProfileBootstrap = {
  fullName: string;
  bloodGroup: string;
};

type AuthResult = {
  error: Error | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  createProfile: (input: ProfileBootstrap) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const pendingProfileKey = '@bloodconnect/pending-profile';

async function ensureProfile(userId: string, profile: ProfileBootstrap) {
  const { data: existingProfile, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (lookupError) return lookupError;
  if (existingProfile) return null;

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    full_name: profile.fullName.trim(),
    blood_group: profile.bloodGroup,
  });

  if (error?.code === '23505') return null;
  return error;
}

async function initializeAuthenticatedProfile(): Promise<Error | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return userError || new Error('Your authenticated user could not be found.');
  }

  const user = userData.user;
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'BloodConnect User';
  const bloodGroup = user.user_metadata?.blood_group || 'O+';
  const profileError = await ensureProfile(user.id, { fullName, bloodGroup });

  if (profileError) return profileError;

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) return fetchError;
  if (!profile) return new Error('The authenticated profile could not be loaded after creation.');
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionSyncRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncSession = (nextSession: Session | null) => {
      if (!nextSession) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      if (sessionSyncRef.current) return;

      const syncPromise = (async () => {
        await initializeAuthenticatedProfile();
        if (!mounted) return;
        setSession(nextSession);
        setUser(nextSession.user);
        setLoading(false);
      })();

      sessionSyncRef.current = syncPromise;
      void syncPromise.finally(() => {
        if (sessionSyncRef.current === syncPromise) sessionSyncRef.current = null;
      });
    };

    supabase.auth.getSession().then(({ data }) => syncSession(data.session));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      syncSession(nextSession);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ fullName, email, password, bloodGroup }: SignUpInput): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          blood_group: bloodGroup,
        },
      },
    });

    if (error) return { error };
    if (!data.user) return { error: new Error('Unable to create the account.') };

    const profileInput = { fullName, bloodGroup };

    if (!data.session) {
      await AsyncStorage.setItem(
        pendingProfileKey,
        JSON.stringify({ fullName, email, password: '', bloodGroup }),
      );
      return {
        error: new Error('Account created. Please verify your email, then sign in to finish setup.'),
      };
    }

    const profileError = await ensureProfile(data.user.id, profileInput);

    if (profileError) {
      await supabase.auth.signOut();
      return { error: profileError };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { error };

    const pendingProfile = await AsyncStorage.getItem(pendingProfileKey);
    if (pendingProfile && data.user) {
      const profile = JSON.parse(pendingProfile) as ProfileBootstrap;
      const profileError = await ensureProfile(data.user.id, profile);
      if (profileError) return { error: profileError };
      await AsyncStorage.removeItem(pendingProfileKey);
    }

    return { error: null };
  };

  const createProfile = async ({ fullName, bloodGroup }: ProfileBootstrap): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { error: error || new Error('Your authenticated user could not be found.') };
    }

    const profileError = await ensureProfile(data.user.id, { fullName, bloodGroup });
    return { error: profileError };
  };

  const signOut = async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, createProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return context;
}
