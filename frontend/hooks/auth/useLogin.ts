'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { API_BASE } from '@/lib/constants';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase is not configured');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch(`${API_BASE}/api/auth/session`, {
        method: 'POST',
        body: JSON.stringify({ idToken }),
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
      if (err.message?.includes('auth/too-many-requests')) {
        alert('Too many attempts. Please try again later.');
        return;
      }
      if (err.message?.includes('auth/') || err.message?.includes('Firebase')) {
        alert('Invalid email or password.');
        return;
      }
      alert(err.message || 'Sign in failed');
    },
  });
};
