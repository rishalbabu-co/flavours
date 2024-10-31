import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Video, SkipForward, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Peer from 'simple-peer';
import { User } from '../types/auth';
import socket from '../services/socket';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatHeader from './chat/ChatHeader';
import VideoChat from './chat/VideoChat';
import SearchMessages from './chat/SearchMessages';
import { Message } from '../types/chat';

interface ChatRoomProps {
  user: User;
  onBack: () => void;
}

export default function ChatRoom({ user, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [peerUsername, setPeerUsername] = useState<string>('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.initializeConnection(user.id, user.username);
    setOnlineUsers(socket.getUserCount());
    findPeer();

    socket.onUserCountUpdate((count) => {
      setOnlineUsers(count);
    });

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
      socket.disconnect();
    };
  }, [user.id, user.username]);

  useEffect(() => {
    socket.onPeerFound((peerId, username) => {
      setPeerUsername(username);
      initializePeerConnection(peerId, true);
    });

    socket.onSignal((signal, from) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
      } else {
        initializePeerConnection(from, false);
        peerRef.current?.signal(signal);
      }
    });

    socket.onPeerDisconnected(() => handlePeerDisconnect());
  }, []);

  const findPeer = () => {
    setIsSearching(true);
    addSystemMessage("Looking for someone to chat with...");
    socket.findPeer('one-on-one');
  };

  const initializePeerConnection = async (peerId: string, initiator: boolean) => {
    if (isVideoEnabled && !streamRef.current) {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
      } catch (err) {
        console.error('Failed to get media devices:', err);
        setIsVideoEnabled(false);
      }
    }

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: streamRef.current || undefined,
    });

    peer.on('signal', data => {
      socket.sendSignal(data, peerId);
    });

    peer.on('connect', () => {
      setIsConnected(true);
      setIsSearching(false);
      addSystemMessage(`Connected with ${peerUsername}! Say hi! 👋`);
    });

    peer.on('stream', stream => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo && isVideoEnabled) {
        remoteVideo.srcObject = stream;
      }
    });

    peer.on('data', data => {
      const message = JSON.parse(data.toString());
      if (message.type === 'typing') {
        handlePeerTyping(message.username, message.isTyping);
      } else {
        setMessages(prev => [...prev, message]);
      }
    });

    peerRef.current = peer;
  };

  const handlePeerTyping = (username: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      if (isTyping && !prev.includes(username)) {
        return [...prev, username];
      }
      if (!isTyping) {
        return prev.filter(u => u !== username);
      }
      return prev;
    });
  };

  const handlePeerDisconnect = () => {
    setIsConnected(false);
    setPeerUsername('');
    addSystemMessage("Stranger has disconnected.");
    findPeer();
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text,
      sender: 'system',
      username: 'System',
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  const handleSendMessage = (text: string) => {
    if (!peerRef.current) return;

    const message: Message = {
      id: uuidv4(),
      text,
      sender: user.id,
      username: user.username,
      timestamp: new Date(),
      type: 'text',
      readBy: []
    };

    peerRef.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, message]);
  };

  const handleSendFile = async (file: File) => {
    if (!peerRef.current) return;

    const isImage = file.type.startsWith('image/');
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const message: Message = {
        id: uuidv4(),
        text: `Sent ${isImage ? 'an image' : 'a file'}: ${file.name}`,
        sender: user.id,
        username: user.username,
        timestamp: new Date(),
        type: isImage ? 'image' : 'file',
        fileUrl: fileReader.result as string,
        fileName: file.name,
        fileSize: file.size,
        readBy: []
      };

      peerRef.current?.send(JSON.stringify(message));
      setMessages(prev => [...prev, message]);
    };

    fileReader.readAsDataURL(file);
  };

  const handleSendVoice = async (blob: Blob) => {
    if (!peerRef.current) return;

    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const message: Message = {
        id: uuidv4(),
        text: 'Sent a voice message',
        sender: user.id,
        username: user.username,
        timestamp: new Date(),
        type: 'voice',
        fileUrl: fileReader.result as string,
        fileDuration: 0, // You can calculate this if needed
        readBy: []
      };

      peerRef.current?.send(JSON.stringify(message));
      setMessages(prev => [...prev, message]);
    };

    fileReader.readAsDataURL(blob);
  };

  const handleTypingStart = () => {
    if (!peerRef.current) return;
    peerRef.current.send(JSON.stringify({
      type: 'typing',
      username: user.username,
      isTyping: true
    }));
  };

  const handleTypingStop = () => {
    if (!peerRef.current) return;
    peerRef.current.send(JSON.stringify({
      type: 'typing',
      username: user.username,
      isTyping: false
    }));
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!peerRef.current) return;

    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const reactions = message.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
          if (!existingReaction.users.includes(user.id)) {
            existingReaction.users.push(user.id);
          }
          return { ...message, reactions };
        }

        return {
          ...message,
          reactions: [...reactions, { emoji, users: [user.id] }]
        };
      }
      return message;
    }));

    peerRef.current.send(JSON.stringify({
      type: 'reaction',
      messageId,
      emoji,
      userId: user.id
    }));
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight');
      setTimeout(() => messageElement.classList.remove('highlight'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <ChatHeader
          onBack={onBack}
          onSkip={handlePeerDisconnect}
          onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
          isVideoEnabled={isVideoEnabled}
          showVideoToggle={true}
          onlineCount={onlineUsers}
        />

        {isVideoEnabled && (
          <VideoChat
            localStream={streamRef.current}
            remoteStream={null}
          />
        )}

        <div className="h-[calc(100vh-20rem)] flex flex-col relative">
          <SearchMessages
            messages={messages}
            onResultClick={scrollToMessage}
          />

          {isSearching ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Looking for someone to chat with...</p>
                <p className="text-sm text-gray-500 mt-2">{onlineUsers - 1} potential matches</p>
              </div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={user.id}
              typingUsers={typingUsers}
              onReaction={handleReaction}
            />
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onSendVoice={handleSendVoice}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}