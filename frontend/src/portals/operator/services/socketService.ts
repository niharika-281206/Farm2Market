import { io, Socket } from 'socket.io-client';
import { QueueItem, QueueStatus, NotificationItem } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

type EventListener = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private localListeners: Map<string, Set<EventListener>> = new Map();

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    try {
      this.socket = io(WS_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ [Socket.IO] Connected to WebSocket Server:', WS_URL);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('🔌 [Socket.IO] Disconnected from WebSocket Server (Using Local Simulator)');
      });

      this.socket.on('connect_error', () => {
        this.isConnected = false;
        // Fallback silently to local pub-sub event mode
      });
    } catch {
      this.isConnected = false;
    }
  }

  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Subscribe to real-time events
  on(event: string, callback: EventListener) {
    if (!this.localListeners.has(event)) {
      this.localListeners.set(event, new Set());
    }
    this.localListeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  off(event: string, callback: EventListener) {
    const set = this.localListeners.get(event);
    if (set) {
      set.delete(callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event (broadcasts to real Socket.IO backend AND triggers local listeners for instant UI updates)
  emit(event: string, payload: unknown) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, payload);
    }

    // Always notify local listeners to guarantee 0-latency UI updates
    const set = this.localListeners.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in local socket listener for '${event}':`, e);
        }
      });
    }
  }

  // Helper trigger methods for operator actions
  emitQueueUpdate(queue: QueueItem[]) {
    this.emit('queue:update', queue);
  }

  emitCallNext(nextItem: QueueItem) {
    this.emit('queue:call_next', nextItem);
    this.emit('notification:new', {
      id: `notif-${Date.now()}`,
      type: 'FARMER_TURN',
      title: 'Farmer Turn Called',
      message: `Token ${nextItem.token} (${nextItem.farmerName}) called to Processing Bay.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      priority: 'HIGH',
    } as NotificationItem);
  }

  emitStatusChange(token: string, status: QueueStatus) {
    this.emit('status:change', { token, status });
  }

  emitProcurementCompleted(item: QueueItem) {
    this.emit('procurement:completed', item);
  }
}

export const socketService = new SocketService();
