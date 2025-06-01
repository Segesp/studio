'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, WebSocketState } from '@/hooks/use-websocket';
import { useSession } from 'next-auth/react';

interface WebSocketContextType extends WebSocketState {
  initializeConnection: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [shouldConnect, setShouldConnect] = useState(false);
  const webSocketState = useWebSocket({ 
    autoConnect: shouldConnect && status === 'authenticated' 
  });

  useEffect(() => {
    // Initialize WebSocket connection when user is authenticated
    if (status === 'authenticated' && session?.user) {
      setShouldConnect(true);
    } else {
      setShouldConnect(false);
    }
  }, [status, session]);

  const initializeConnection = () => {
    if (status === 'authenticated') {
      setShouldConnect(true);
    }
  };

  const disconnect = () => {
    setShouldConnect(false);
    if (webSocketState.socket) {
      webSocketState.socket.disconnect();
    }
  };

  const contextValue: WebSocketContextType = {
    ...webSocketState,
    initializeConnection,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}
