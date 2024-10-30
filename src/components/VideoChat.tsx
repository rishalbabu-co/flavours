import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { v4 as uuidv4 } from 'uuid';
import { Video, Mic, MicOff, VideoOff, MessageCircle, Phone, PhoneOff, Copy, Check } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'peer';
  timestamp: Date;
}

export default function VideoChat() {
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setPeerId(uuidv4());
    initializeMedia();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to get media devices:', err);
    }
  };

  const initiateCall = () => {
    if (!streamRef.current) return;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: streamRef.current,
    });

    peer.on('signal', data => {
      // In a real app, you would send this to a signaling server
      console.log('Generated peer ID:', JSON.stringify(data));
    });

    peer.on('stream', stream => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('connect', () => setIsConnected(true));

    peer.on('data', data => {
      const message: Message = JSON.parse(data.toString());
      setMessages(prev => [...prev, message]);
    });

    peerRef.current = peer;
  };

  const answerCall = () => {
    if (!streamRef.current) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: streamRef.current,
    });

    peer.on('signal', data => {
      // In a real app, you would send this to a signaling server
      console.log('Generated answer:', JSON.stringify(data));
    });

    peer.on('stream', stream => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('connect', () => setIsConnected(true));

    peer.on('data', data => {
      const message: Message = JSON.parse(data.toString());
      setMessages(prev => [...prev, message]);
    });

    peerRef.current = peer;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !peerRef.current) return;

    const message: Message = {
      id: uuidv4(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date(),
    };

    peerRef.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {isConnected && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute top-4 right-4 w-1/4 aspect-video rounded-lg border-2 border-white"
                />
              )}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  audioEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
                } text-white transition-colors`}
              >
                {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  videoEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
                } text-white transition-colors`}
              >
                {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </button>
              {isConnected ? (
                <button
                  onClick={() => peerRef.current?.destroy()}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <PhoneOff size={24} />
                </button>
              ) : (
                <button
                  onClick={initiateCall}
                  className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <Phone size={24} />
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={peerId}
                readOnly
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={copyPeerId}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
                placeholder="Enter peer ID to connect"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={answerCall}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 h-[calc(100vh-2rem)]">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle size={24} className="text-blue-500" />
            <h2 className="text-xl font-semibold">Chat</h2>
          </div>
          <div className="h-[calc(100%-8rem)] overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg max-w-[80%] ${
                  message.sender === 'me'
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}