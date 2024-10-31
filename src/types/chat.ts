export interface Message {
  id: string;
  text: string;
  sender: string;
  username?: string;
  timestamp: Date;
  reactions?: MessageReaction[];
  readBy?: string[];
  type?: 'text' | 'emoji' | 'system' | 'file' | 'image' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileDuration?: number;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface Peer {
  id: string;
  username: string;
  avatar?: string;
  isTyping?: boolean;
  lastSeen?: Date;
  status?: 'online' | 'offline' | 'away';
  profile?: UserProfile;
}

export interface UserProfile {
  displayName: string;
  bio?: string;
  avatar?: string;
  status?: string;
  joinDate: Date;
  timezone?: string;
  language?: string;
  interests?: string[];
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface ChatState {
  messages: Message[];
  peers: Peer[];
  typingUsers: Set<string>;
  unreadCount: number;
}