import Peer from 'simple-peer';
import { v4 as uuidv4 } from 'uuid';

interface PeerConnection {
  id: string;
  username?: string;
  peer: Peer.Instance;
}

class PeerService {
  private static instance: PeerService;
  private peers: Map<string, PeerConnection> = new Map();
  private waitingPeers: string[] = [];
  private stream: MediaStream | null = null;

  private constructor() {
    // Simulate a simple signaling server
    setInterval(() => this.matchPeers(), 2000);
  }

  static getInstance(): PeerService {
    if (!this.instance) {
      this.instance = new PeerService();
    }
    return this.instance;
  }

  async initializeMedia(video: boolean = false): Promise<MediaStream | null> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true
      });
      return this.stream;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      return null;
    }
  }

  createPeer(initiator: boolean = false): string {
    const peerId = uuidv4();
    
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: this.stream
    });

    this.peers.set(peerId, { id: peerId, peer });
    this.waitingPeers.push(peerId);

    return peerId;
  }

  private matchPeers() {
    while (this.waitingPeers.length >= 2) {
      const peer1Id = this.waitingPeers.shift()!;
      const peer2Id = this.waitingPeers.shift()!;

      const peer1 = this.peers.get(peer1Id);
      const peer2 = this.peers.get(peer2Id);

      if (peer1 && peer2) {
        this.connectPeers(peer1, peer2);
      }
    }
  }

  private connectPeers(peer1: PeerConnection, peer2: PeerConnection) {
    peer1.peer.on('signal', data => {
      peer2.peer.signal(data);
    });

    peer2.peer.on('signal', data => {
      peer1.peer.signal(data);
    });
  }

  onPeerConnect(peerId: string, callback: () => void) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.peer.on('connect', callback);
    }
  }

  onPeerData(peerId: string, callback: (data: any) => void) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.peer.on('data', callback);
    }
  }

  onPeerStream(peerId: string, callback: (stream: MediaStream) => void) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.peer.on('stream', callback);
    }
  }

  sendData(peerId: string, data: any) {
    const peer = this.peers.get(peerId);
    if (peer && peer.peer.connected) {
      peer.peer.send(JSON.stringify(data));
    }
  }

  destroyPeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.peer.destroy();
      this.peers.delete(peerId);
      this.waitingPeers = this.waitingPeers.filter(id => id !== peerId);
    }
  }

  destroyAllPeers() {
    this.peers.forEach(peer => peer.peer.destroy());
    this.peers.clear();
    this.waitingPeers = [];
  }
}

export default PeerService;