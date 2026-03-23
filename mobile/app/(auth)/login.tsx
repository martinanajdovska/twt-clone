import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import { API_URL } from '@/lib/constants';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors } from '@/constants/theme';

const AUTH_PRIMARY = '#1d9bf0';
const INPUT_BG_LIGHT = '#f0f2f5';


export default function LoginScreen() {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const { setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const mutedColor = isDark ? '#71767b' : '#536471';
  const textColor = isDark ? '#e7e9ea' : '#0f1419';
  const inputBg = isDark ? '#16181c' : INPUT_BG_LIGHT;

  function handleLogin() {
    if (!email.trim() || !password) {
      setFormError('Please enter email and password.');
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase is not configured.');
    }
    setIsPending(true);
    setFormError(null);

    (async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const idToken = await userCredential.user.getIdToken();
        const res = await apiFetch('/auth/session', {
          method: 'POST',
          headers: { 'x-client-type': 'native' },
          body: JSON.stringify({ idToken }),
          skipAuth: true,
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`HTTP ${res.status}: ${err || res.statusText}`);
        }
        const data = (await res.json()) as { access_token?: string };
        const accessToken = data.access_token;
        if (!accessToken) {
          throw new Error('No token returned from server');
        }
        await setToken(accessToken);
        router.replace('/(tabs)/(main)');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Sign in failed';
        const nestedMessage =
          typeof e === 'object' && e != null
            ? (e as any)?.error?.message // e.g. INVALID_LOGIN_CREDENTIALS
            : undefined;
        const combined = [message, nestedMessage].filter(Boolean).join(' ');

        const isInvalidCredentials =
          combined.includes('INVALID_LOGIN_CREDENTIALS') ||
          combined.includes('auth/invalid-credential') ||
          combined.includes('auth/wrong-password') ||
          combined.includes('auth/user-not-found') ||
          combined.includes('auth/invalid-login-credentials');

        if (isInvalidCredentials || combined.includes('Firebase') || combined.includes('auth/')) {
          setFormError('Invalid email or password.');
          return;
        }

        if (combined.includes('Network request failed')) {
          throw new Error('Cannot reach server');
        } else {
          Alert.alert('Sign in failed', combined);
        }
      } finally {
        setIsPending(false);
      }
    })();
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>
            Welcome back
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign in with your email and password</ThemedText>
          <ThemedText style={styles.apiUrl} numberOfLines={1} ellipsizeMode="middle">
            API: {API_URL}
          </ThemedText>

          <TextInput
            style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: inputBg }]}
            placeholder="Email"
            placeholderTextColor={mutedColor}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (formError) setFormError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isPending}
          />
          <TextInput
            style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: inputBg }]}
            placeholder="Password"
            placeholderTextColor={colors.icon}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (formError) setFormError(null);
            }}
            secureTextEntry
            autoComplete="password"
            editable={!isPending}
          />

          {!!formError && (
            <ThemedText style={[styles.formError, { color: '#f4212e' }]}>
              {formError}
            </ThemedText>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: AUTH_PRIMARY, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleLogin}
            disabled={isPending}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: '#fff' }]}>Sign In</Text>
            )}
          </Pressable>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push('/(auth)/register')}
            disabled={isPending}>
            <Text style={styles.linkText}>
              <Text style={{ color: colors.text, opacity: 0.9 }}>
                Don't have an account?{' '}
              </Text>
              <Text style={{ color: AUTH_PRIMARY, fontWeight: '600' }}>
                Sign up here!
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 8, opacity: 0.8 },
  apiUrl: { marginBottom: 12, fontSize: 12, opacity: 0.6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, opacity: 0.9 },
  formError: { marginTop: -4, fontSize: 13 },
});