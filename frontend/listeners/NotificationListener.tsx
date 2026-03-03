'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/constants';

export default function NotificationListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(BASE_URL, {
      path: '/ws',
      withCredentials: true,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('notification', (notification: { message?: string; actor?: string }) => {
      const description = notification?.message ?? `${notification?.actor ?? 'Someone'} did something`;
      toast.message('New Activity', { description });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket connection error', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}
