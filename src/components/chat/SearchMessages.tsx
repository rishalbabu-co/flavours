import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Message } from '../../types/chat';

interface SearchMessagesProps {
  messages: Message[];
  onResultClick: (messageId: string) => void;
}

export default function SearchMessages({ messages, onResultClick }: SearchMessagesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Message[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const searchResults = messages.filter(message => 
      message.text.toLowerCase().includes(term.toLowerCase()) ||
      message.username?.toLowerCase().includes(term.toLowerCase())
    );
    setResults(searchResults);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bg-white shadow-lg p-4 z-10">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
            setResults([]);
          }}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto divide-y">
          {results.map(message => (
            <button
              key={message.id}
              onClick={() => {
                onResultClick(message.id);
                setIsOpen(false);
                setSearchTerm('');
                setResults([]);
              }}
              className="w-full p-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {message.username || 'System'}
                </p>
                <p className="text-sm text-gray-500 truncate">{message.text}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}