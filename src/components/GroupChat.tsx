import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Peer from 'simple-peer';

interface Message {
  id: string;
  text: string;
  sender: string;
  username: string;
  timestamp: Date;
}

interface GroupChatProps {
  onBack: () => void;
}

export default function GroupChat({ onBack }: GroupChatProps) {
  const [userId] = useState(uuidv4());
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [peers, setPeers] = useState<{ id: string; username: string }[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());

  useEffect(() => {
    if (isJoined) {
      initializePeer();
    }
    return () => {
      peersRef.current.forEach(peer => peer.destroy());
    };
  }, [isJoined]);

  const initializePeer = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false
    });

    peer.on('signal', data => {
      // In a real app, send this signal to a signaling server
      console.log('Generated peer signal:', data);
    });

    peer.on('connect', () => {
      setPeers(prev => [...prev, { id: userId, username }]);
      broadcastMessage({
        id: uuidv4(),
        text: `${username} has joined the chat`,
        sender: 'system',
        username: 'System',
        timestamp: new Date()
      });
    });

    peer.on('data', data => {
      const message = JSON.parse(data.toString());
      setMessages(prev => [...prev, message]);
    });

    peersRef.current.set(userId, peer);
  };

  const joinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsJoined(true);
  };

  const broadcastMessage = (message: Message) => {
    peersRef.current.forEach(peer => {
      if (peer.connected) {
        peer.send(JSON.stringify(message));
      }
    });
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const message = {
      id: uuidv4(),
      text: inputMessage,
      sender: userId,
      username,
      timestamp: new Date()
    };

    broadcastMessage(message);
    setInputMessage('');
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <h2 className="text-2xl font-bold text-center mb-6">Join Group Chat</h2>
          
          <form onSubmit={joinChat} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Choose a username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">{peers.length} online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-10rem)]">
          <div className="md:col-span-3 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  {message.sender !== 'system' && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender === userId ? 'You' : message.username}
                    </p>
                  )}
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
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:block border-l p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Online Users</h3>
            <ul className="space-y-2">
              {peers.map(peer => (
                <li
                  key={peer.id}
                  className="flex items-center space-x-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    {peer.id === userId ? `${peer.username} (You)` : peer.username}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}