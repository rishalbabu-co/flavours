import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  onReaction: (messageId: string, emoji: string) => void;
}

export default function MessageList({ 
  messages, 
  currentUserId, 
  typingUsers,
  onReaction 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getReadStatus = (message: Message) => {
    if (!message.readBy) return <Clock className="w-4 h-4 text-gray-400" />;
    if (message.readBy.length === 0) return <Check className="w-4 h-4 text-gray-400" />;
    return <CheckCheck className="w-4 h-4 text-blue-500" />;
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

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
          } p-3 relative group`}
        >
          {message.username && message.sender !== 'system' && (
            <p className="text-xs font-semibold mb-1">
              {message.sender === currentUserId ? 'You' : message.username}
            </p>
          )}
          
          <p>{message.text}</p>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-75">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {message.sender === currentUserId && (
              <div className="ml-2">{getReadStatus(message)}</div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.users.length}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Reactions */}
          <div className="absolute -top-8 left-0 bg-white rounded-full shadow-lg px-2 py-1 hidden group-hover:flex space-x-1">
            {commonReactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => onReaction(message.id, emoji)}
                className="hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="text-sm text-gray-500 italic">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          <div className="inline-flex ml-2">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}