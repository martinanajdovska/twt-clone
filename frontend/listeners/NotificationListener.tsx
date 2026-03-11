'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE, BASE_URL } from '@/lib/constants';
import { IMessageResponse } from '@/DTO/IMessageResponse';

interface NewMessagePayload {
  conversationId: number;
  message: IMessageResponse;
}

export default function NotificationListener() {
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!BASE_URL) return;

    let cancelled = false;
    const t = setTimeout(() => {
      fetch(`${API_BASE}/api/auth/socket-token`, { credentials: 'include' })
        .then((r) => r.json())
        .then((body: { token: string | null }) => {
          if (cancelled) return;
          const token = body?.token ?? null;
          if (!token) return;

          socketRef.current = io(BASE_URL, {
            path: '/ws',
            withCredentials: true,
            autoConnect: true,
            transports: ['polling'],
            upgrade: false,
            auth: { token },
          });

          socketRef.current.on('connect', () => {
            console.log('Socket connected');
          });

          socketRef.current.on('notification', (notification: { message?: string; actor?: string }) => {
            const description = notification?.message ?? `${notification?.actor ?? 'Someone'} did something`;
            toast.message('New Activity', { description });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          });

          socketRef.current.on('new_message', (payload: NewMessagePayload) => {
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

          socketRef.current.on('connect_error', (err: Error) => {
            console.error('Socket connection error', err.message);
          });
        })
        .catch((err) => {
          console.error('Failed to get socket token', err);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  return null;
}
