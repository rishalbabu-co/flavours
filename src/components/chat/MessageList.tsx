import React from 'react';
import { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`max-w-[80%] ${
            message.sender === currentUserId
              ? 'ml-auto bg-purple-500 text-white rounded-l-lg rounded-tr-lg'
              : message.sender === 'system'
              ? 'mx-auto bg-gray-200 text-gray-800 rounded-lg'
              : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'
          } p-3`}
        >
          {message.username && message.sender !== 'system' && (
            <p className="text-xs font-semibold mb-1">
              {message.sender === currentUserId ? 'You' : message.username}
            </p>
          )}
          <p>{message.text}</p>
          <span className="text-xs opacity-75">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}