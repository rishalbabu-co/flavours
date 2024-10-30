export interface Message {
  id: string;
  text: string;
  sender: string;
  username?: string;
  timestamp: Date;
}

export interface Peer {
  id: string;
  username: string;
}