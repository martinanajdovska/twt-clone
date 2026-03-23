import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors } from '@/constants/theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AUTH_PRIMARY = '#1d9bf0';
const INPUT_BG_LIGHT = '#f0f2f5';

export default function RegisterScreen() {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const { setToken } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const textColor = isDark ? '#e7e9ea' : '#0f1419';
  const inputBg = isDark ? '#16181c' : INPUT_BG_LIGHT;

  async function handleRegister() {
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCredential.user.getIdToken();
      const res = await apiFetch('/auth/session', {
        method: 'POST',
        headers: { 'x-client-type': 'native' },
        body: JSON.stringify({ idToken, username: username.trim() || undefined }),
        skipAuth: true,
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Session failed');
      }
      const data = (await res.json()) as { access_token?: string };
      const accessToken = data.access_token;
      if (!accessToken) {
        throw new Error('No token returned from server');
      }
      await setToken(accessToken);
      router.replace('/(tabs)/(main)');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Registration failed';
      if (message.includes('email-already-in-use')) {
        Alert.alert('Registration failed', 'This email is already registered.');
      } else if (message.includes('weak-password')) {
        Alert.alert('Registration failed', 'Password should be at least 6 characters.');
      } else if (message.includes('invalid-email')) {
        Alert.alert('Registration failed', 'Invalid email address.');
      } else {
        Alert.alert('Registration failed', message);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={50}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          Create an account
        </ThemedText>
        <ThemedText style={styles.subtitle}>Enter your details below to sign up</ThemedText>

        <TextInput
          style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: inputBg }]}
          placeholder="Username"
          placeholderTextColor={colors.icon}
          value={username}
          onChangeText={(v) => {
            setUsername(v);
            if (formError) setFormError(null);
          }}
          autoCapitalize="none"
          autoComplete="username"
          editable={!isPending}
        />
        <TextInput
          style={[styles.input, { borderColor: borderColor, color: textColor, backgroundColor: inputBg }]}
          placeholder="Email"
          placeholderTextColor={colors.icon}
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
          placeholder="Password (min 6 characters)"
          placeholderTextColor={colors.icon}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (formError) setFormError(null);
          }}
          secureTextEntry
          autoComplete="password-new"
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
          onPress={handleRegister}
          disabled={isPending}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: '#fff' }]}>Sign Up</Text>
          )}
        </Pressable>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.back()}
          disabled={isPending}>
          <Text style={styles.linkText}>
            <Text style={{ color: colors.text, opacity: 0.9 }}>
              Already have an account?{' '}
            </Text>
            <Text style={{ color: AUTH_PRIMARY, fontWeight: '600' }}>
              Sign in here!
            </Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 24, opacity: 0.8 },
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
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontSize: 14, opacity: 0.9 },
  formError: { marginTop: -4, fontSize: 13 },
});