import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const MOCK_USERNAMES = [
  'Alice', 'Bob', 'Charlie', 'David', 'Emma',
  'Frank', 'Grace', 'Henry', 'Isabel', 'Jack'
];

class SocketService {
  private socket: Socket | null = null;
  private mockMode: boolean = false;
  private callbacks: Map<string, Function[]> = new Map();
  private mockPeers: Map<string, string> = new Map(); // userId -> username
  private initialized: boolean = false;
  private currentUserId: string | null = null;

  constructor() {
    this.mockMode = true;
    // Simulate other users joining/leaving
    setInterval(() => this.simulateUserActivity(), 5000);
  }

  private simulateUserActivity() {
    if (!this.mockMode || !this.currentUserId) return;

    const randomAction = Math.random();
    if (randomAction < 0.3 && this.mockPeers.size < 10) {
      // Add new user
      const newUserId = uuidv4();
      const username = MOCK_USERNAMES[this.mockPeers.size];
      this.mockPeers.set(newUserId, username);
      this.triggerCallbacks('user_count_update', this.mockPeers.size);
    } else if (randomAction < 0.5 && this.mockPeers.size > 1) {
      // Remove random user
      const users = Array.from(this.mockPeers.keys());
      const userToRemove = users.find(id => id !== this.currentUserId);
      if (userToRemove) {
        this.mockPeers.delete(userToRemove);
        this.triggerCallbacks('user_count_update', this.mockPeers.size);
      }
    }
  }

  private initializeSocket() {
    if (this.initialized) return;
    
    try {
      this.socket = io('wss://chat-signaling.stackblitz.io', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      this.socket.on('connect_error', () => {
        console.log('Using mock mode for testing');
        this.enableMockMode();
      });

      this.initialized = true;
    } catch (error) {
      this.enableMockMode();
    }
  }

  private enableMockMode() {
    this.mockMode = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private emit(event: string, data: any) {
    if (this.mockMode) {
      this.handleMockEmit(event, data);
    } else if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  private handleMockEmit(event: string, data: any) {
    switch (event) {
      case 'register':
        setTimeout(() => {
          this.currentUserId = data.userId;
          this.mockPeers.set(data.userId, data.username);
          this.triggerCallbacks('connect', null);
          this.triggerCallbacks('user_count_update', this.mockPeers.size);
        }, 500);
        break;

      case 'find_peer':
        setTimeout(() => {
          const availablePeers = Array.from(this.mockPeers.entries())
            .filter(([id]) => id !== this.currentUserId);

          if (availablePeers.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePeers.length);
            const [peerId, username] = availablePeers[randomIndex];
            this.triggerCallbacks('peer_found', { peerId, username });
          } else {
            // Simulate a new user joining and immediately connecting
            const newPeerId = uuidv4();
            const newUsername = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
            this.mockPeers.set(newPeerId, newUsername);
            this.triggerCallbacks('user_count_update', this.mockPeers.size);
            setTimeout(() => {
              this.triggerCallbacks('peer_found', { peerId: newPeerId, username: newUsername });
            }, 1000);
          }
        }, 1500);
        break;

      case 'signal':
        setTimeout(() => {
          this.triggerCallbacks('signal', {
            signal: data.signal,
            from: data.to
          });
        }, 100);
        break;
    }
  }

  private triggerCallbacks(event: string, data: any) {
    const eventCallbacks = this.callbacks.get(event) || [];
    eventCallbacks.forEach(callback => callback(data));
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);

    if (!this.mockMode && this.socket) {
      this.socket.on(event, callback);
    }
  }

  public initializeConnection(userId: string, username: string) {
    if (!this.initialized) {
      this.initializeSocket();
    }
    this.emit('register', { userId, username });
  }

  public findPeer(mode: 'one-on-one' | 'group') {
    this.emit('find_peer', { mode });
  }

  public sendSignal(signal: any, to: string) {
    this.emit('signal', { signal, to });
  }

  public getUserCount(): number {
    return this.mockPeers.size;
  }

  public onPeerFound(callback: (peerId: string, username: string) => void) {
    this.on('peer_found', ({ peerId, username }) => callback(peerId, username));
  }

  public onSignal(callback: (signal: any, from: string) => void) {
    this.on('signal', ({ signal, from }) => callback(signal, from));
  }

  public onPeerDisconnected(callback: (peerId: string) => void) {
    this.on('peer_disconnected', ({ peerId }) => callback(peerId));
  }

  public onUserCountUpdate(callback: (count: number) => void) {
    this.on('user_count_update', callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.mockPeers.clear();
    this.callbacks.clear();
    this.initialized = false;
    this.currentUserId = null;
  }
}

export default new SocketService();