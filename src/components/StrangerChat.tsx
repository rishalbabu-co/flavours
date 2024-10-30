import React, { useState } from 'react';
import ChatRoom from './ChatRoom';
import GroupChat from './GroupChat';
import { Users, User } from 'lucide-react';

export default function StrangerChat() {
  const [mode, setMode] = useState<'one-on-one' | 'group' | null>(null);

  if (mode === 'one-on-one') {
    return <ChatRoom onBack={() => setMode(null)} />;
  }

  if (mode === 'group') {
    return <GroupChat onBack={() => setMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Choose Chat Mode
        </h1>
        
        <button
          onClick={() => setMode('one-on-one')}
          className="w-full flex items-center justify-center space-x-3 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <User className="w-6 h-6 text-purple-500" />
          <span className="text-xl font-semibold text-gray-800">One-on-One Chat</span>
        </button>

        <button
          onClick={() => setMode('group')}
          className="w-full flex items-center justify-center space-x-3 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <Users className="w-6 h-6 text-indigo-500" />
          <span className="text-xl font-semibold text-gray-800">Group Chat</span>
        </button>
      </div>
    </div>
  );
}