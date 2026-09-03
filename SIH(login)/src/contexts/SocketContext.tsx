import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // In a real scenario, this connects to the backend
    // Since this is mock phase, we might not have a real WS server running yet
    // Using a fake URL or not connecting if env var is missing
    const API_URL = '/';
    
    // We try to connect. It might fail if backend is down, but that's expected in mock phase.
    const newSocket = io(API_URL, {
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Global listener for mock updates
    newSocket.on('notification:new', (data) => {
      toast(data.message, { icon: '🔔' });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
