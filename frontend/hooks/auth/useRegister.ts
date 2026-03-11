'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { API_BASE } from '@/lib/constants';

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase is not configured');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch(`${API_BASE}/api/auth/session`, {
        method: 'POST',
        body: JSON.stringify({ idToken, username: username.trim() || undefined }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Session failed');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
    onError: (err: Error) => {
      const message = err.message || 'Registration failed';
      if (err.message?.includes('auth/')) {
        if (err.message.includes('email-already-in-use')) {
          alert('This email is already registered.');
          return;
        }
        if (err.message.includes('weak-password')) {
          alert('Password should be at least 6 characters.');
          return;
        }
        if (err.message.includes('invalid-email')) {
          alert('Invalid email address.');
          return;
        }
      }
      alert(message);
    },
  });
};
