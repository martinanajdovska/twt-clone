import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { API_BASE } from '@/lib/constants';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await signOut(auth);
      }
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      return response;
    },
        onSuccess: () => {
            queryClient.clear();
            router.push('/login');
            router.refresh();
        },
        onError: (error) => {
            alert(error.message || "Error while logging out");
        }
    });
}