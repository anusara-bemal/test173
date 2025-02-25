import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type AdminSocketEvent = {
  type: string;
  data: any;
};

type UseAdminSocketOptions = {
  onUserVerified?: (data: { userId: number; verified: boolean; timestamp: string }) => void;
  onStatsUpdate?: (data: any) => void;
};

export function useAdminSocket(options: UseAdminSocketOptions = {}) {
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user?.isAdmin) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Admin WebSocket connected');
    };

    socketRef.current.onclose = (event) => {
      if (event.code === 1008) {
        toast({
          title: 'WebSocket Error',
          description: 'Unauthorized connection attempt',
          variant: 'destructive',
        });
      }
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const { type, data }: AdminSocketEvent = JSON.parse(event.data);

        switch (type) {
          case 'user_verified':
            options.onUserVerified?.(data);
            break;
          case 'stats_update':
            options.onStatsUpdate?.(data);
            break;
          case 'connection_established':
            console.log('Admin socket connection established');
            break;
          default:
            console.log('Unknown event type:', type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }, [user?.isAdmin, toast, options]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  return { sendMessage };
}
