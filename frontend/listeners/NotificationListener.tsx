'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/lib/constants';
import { IMessageResponse } from '@/DTO/IMessageResponse';

interface NewMessagePayload {
  conversationId: number;
  message: IMessageResponse;
}

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

    socket.on('new_message', (payload: NewMessagePayload) => {
      const { conversationId, message } = payload;
      const queryKey = ['messages', 'conversation', conversationId] as const;
      const existing = queryClient.getQueryData<IMessageResponse[]>(queryKey);
      if (existing) {
        queryClient.setQueryData<IMessageResponse[]>(queryKey, [...existing, message]);
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
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
