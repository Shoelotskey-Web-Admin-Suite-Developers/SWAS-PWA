import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Basic singleton socket (can be enhanced later if auth tokens needed)
let socketInstance: Socket | null = null;
function getSocket(): Socket {
  if (!socketInstance) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin.replace(/\/$/, '');
    socketInstance = io(url, { transports: ['websocket'], autoConnect: true });
  }
  return socketInstance;
}

export interface LineItemRowUpdatePayload {
  type: 'lineItemRowUpdate';
  lineItem: any;
  transaction_id: string;
  remaining_balance: number;
  storage_fee: number;
  isPickedUp: boolean;
}

export function useLineItemSocket(onLineItemUpdate: (payload: LineItemRowUpdatePayload) => void) {
  const handlerRef = useRef(onLineItemUpdate);
  handlerRef.current = onLineItemUpdate;

  useEffect(() => {
    const socket = getSocket();
    const listener = (payload: LineItemRowUpdatePayload) => {
      if (payload && payload.type === 'lineItemRowUpdate') {
        handlerRef.current(payload);
      }
    };
    socket.on('lineItemRowUpdate', listener);
    return () => {
      socket.off('lineItemRowUpdate', listener);
    };
  }, []);
}
