import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface GenericChangeEvent {
  operationType: string;
  documentKey: { _id: string };
  fullDocument?: any;
  updateDescription?: {
    updatedFields: Record<string, any>;
    removedFields: string[];
  };
}

export interface NotificationItem {
  id: string; // synthetic id for rendering
  source: 'appointment' | 'unavailability' | 'lineItem';
  change: GenericChangeEvent;
  createdAt: number;
  summary: string;
}

const MAX_NOTIFICATIONS = 100;

function summarize(source: NotificationItem['source'], change: GenericChangeEvent): string {
  try {
    const op = change.operationType;
    if (source === 'lineItem') {
      const status = change.updateDescription?.updatedFields?.current_status || change.fullDocument?.current_status;
      if (status) return `Line item status → ${status}`;
      return `Line item ${op}`;
    }
    if (source === 'appointment') {
      const updated = change.updateDescription?.updatedFields || {};
      if (updated.start_time || updated.end_time) return 'Appointment time changed';
      return `Appointment ${op}`;
    }
    if (source === 'unavailability') {
      return `Unavailability ${op}`;
    }
  } catch {
    /* ignore */
  }
  return `${source} updated`;
}

export function useNotificationUpdates() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const add = useCallback((source: NotificationItem['source'], change: GenericChangeEvent) => {
    setNotifications(prev => {
      const next: NotificationItem[] = [
        {
          id: `${source}-${change.documentKey?._id}-${Date.now()}`,
            source,
            change,
            createdAt: Date.now(),
            summary: summarize(source, change)
        },
        ...prev
      ].slice(0, MAX_NOTIFICATIONS);
      return next;
    });
  }, []);

  useEffect(() => {
    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    const handlers: Array<[string, (c: GenericChangeEvent) => void]> = [
      ['appointmentUpdated', (c) => { add('appointment', c); setLastUpdate(new Date()); }],
      ['unavailabilityUpdated', (c) => { add('unavailability', c); setLastUpdate(new Date()); }],
      ['lineItemUpdated', (c) => { add('lineItem', c); setLastUpdate(new Date()); }],
    ];
    handlers.forEach(([evt, fn]) => socket.on(evt, fn));

    return () => {
      handlers.forEach(([evt, fn]) => socket.off(evt, fn));
      socket.disconnect();
    };
  }, [add]);

  return { notifications, isConnected, lastUpdate };
}
