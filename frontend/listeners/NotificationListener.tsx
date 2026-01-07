'use client';

import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import {useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "@/lib/constants";

export default function NotificationListener({ token }: { token: string }) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),

            connectHeaders: {
                Cookie: `token=${token}`,
            },

            debug: (str) => console.log(str),

            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('Connected: ' + frame);

            client.subscribe('/user/queue/notifications', (message) => {
                if (message.body) {
                    toast.message("New Activity", {
                        description: message.body,
                    });

                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error', frame.headers['message']);
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [token]);

    return null;
}