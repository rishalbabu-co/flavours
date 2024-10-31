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

interface Message {
  id: string;
  text: string;
  sender: string;
  username: string;
  timestamp: Date;
}

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

  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      setMessages(prev => [...prev, message]);
    });

    peerRef.current = peer;
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
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = (text: string) => {
    if (!peerRef.current) return;

    const message = {
      id: uuidv4(),
      text,
      sender: user.id,
      username: user.username,
      timestamp: new Date()
    };

    peerRef.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, message]);
  };

  const handleSkip = () => {
    peerRef.current?.destroy();
    setIsSearching(true);
    setPeerUsername('');
    setMessages([]);
    findPeer();
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{onlineUsers} online</span>
            </div>
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full ${
                isVideoEnabled ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={handleSkip}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </button>
          </div>
        </div>

        {isVideoEnabled && (
          <VideoChat
            localStream={streamRef.current}
            remoteStream={null}
          />
        )}

        <div className="h-[calc(100vh-20rem)] flex flex-col">
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
            />
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}