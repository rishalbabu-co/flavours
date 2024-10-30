import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Video, SkipForward } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Peer from 'simple-peer';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

interface ChatRoomProps {
  onBack: () => void;
}

export default function ChatRoom({ onBack }: ChatRoomProps) {
  const [userId] = useState(uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoEnabled) {
      initializeMedia();
    }
    findStranger();
    
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
    };
  }, [isVideoEnabled]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setIsVideoEnabled(false);
    }
  };

  const findStranger = () => {
    setIsSearching(true);
    setMessages([]);
    
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: streamRef.current,
    });

    peer.on('signal', data => {
      // In a real app, send this signal to a signaling server
      console.log('Generated peer signal:', data);
    });

    peer.on('connect', () => {
      setIsConnected(true);
      setIsSearching(false);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: "Connected with a stranger! Say hi! 👋",
        sender: 'system',
        timestamp: new Date()
      }]);
    });

    peer.on('stream', stream => {
      if (remoteVideoRef.current && isVideoEnabled) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('data', data => {
      const message = JSON.parse(data.toString());
      setMessages(prev => [...prev, message]);
    });

    peer.on('close', () => {
      setIsConnected(false);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: "Stranger has disconnected.",
        sender: 'system',
        timestamp: new Date()
      }]);
    });

    peerRef.current = peer;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !peerRef.current) return;

    const message = {
      id: uuidv4(),
      text: inputMessage,
      sender: userId,
      timestamp: new Date()
    };

    peerRef.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, message]);
    setInputMessage('');
  };

  const skipStranger = () => {
    findStranger();
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
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full ${
                isVideoEnabled ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={skipStranger}
              className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </button>
          </div>
        </div>

        {isVideoEnabled && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="h-[calc(100vh-20rem)] overflow-y-auto p-4 space-y-4">
          {isSearching && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Looking for a stranger...</p>
              </div>
            </div>
          )}
          
          {messages.map(message => (
            <div
              key={message.id}
              className={`max-w-[80%] ${
                message.sender === userId
                  ? 'ml-auto bg-purple-500 text-white rounded-l-lg rounded-tr-lg'
                  : message.sender === 'system'
                  ? 'mx-auto bg-gray-200 text-gray-800 rounded-lg'
                  : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'
              } p-3`}
            >
              <p>{message.text}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}