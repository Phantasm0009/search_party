import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

/**
 * Custom hook for managing WebSocket connection and real-time features
 */
export const useSocket = (serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000') => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let newSocket = null;

    const connect = () => {
      try {
        newSocket = io(serverUrl, {
          timeout: 10000,
          forceNew: true,
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('Connected to server');
          setConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        });

        newSocket.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason);
          setConnected(false);
          
          // Attempt to reconnect if not a manual disconnect
          if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
            setTimeout(() => {
              reconnectAttempts.current++;
              console.log(`Reconnection attempt ${reconnectAttempts.current}`);
              connect();
            }, 1000 * reconnectAttempts.current);
          }
        });

        newSocket.on('connect_error', (err) => {
          console.error('Connection error:', err);
          setError('Failed to connect to server');
          setConnected(false);
        });

        newSocket.on('error', (err) => {
          console.error('Socket error:', err);
          setError(err.message || 'Socket error occurred');
        });

        setSocket(newSocket);
      } catch (err) {
        console.error('Failed to initialize socket:', err);
        setError('Failed to initialize connection');
      }
    };

    connect();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [serverUrl]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    socket,
    connected,
    error,
    emit,
    on,
    off
  };
};
