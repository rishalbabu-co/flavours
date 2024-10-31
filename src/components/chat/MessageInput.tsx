import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Mic, StopCircle, Image } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: File) => void;
  onSendVoice: (blob: Blob) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export default function MessageInput({ 
  onSendMessage, 
  onSendFile,
  onSendVoice,
  onTypingStart, 
  onTypingStop, 
  disabled 
}: MessageInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    onTypingStart();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage('');
    onTypingStop();
  };

  const handleEmojiSelect = (emoji: any) => {
    setInputMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVoiceRecordingComplete = (blob: Blob) => {
    setIsRecording(false);
    onSendVoice(blob);
  };

  return (
    <div className="border-t">
      {showFileUploader && (
        <FileUploader 
          onFileSelect={onSendFile}
          onClose={() => setShowFileUploader(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="p-4 relative">
        <div className="flex space-x-4">
          <button
            type="button"
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Smile className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => setShowFileUploader(true)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 focus:outline-none ${
              isRecording ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={disabled || isRecording}
          />
          
          <button
            type="submit"
            disabled={disabled || !inputMessage.trim() || isRecording}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2">
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
            />
          </div>
        )}

        {isRecording && (
          <VoiceRecorder
            onComplete={handleVoiceRecordingComplete}
            onCancel={() => setIsRecording(false)}
          />
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
      </form>
    </div>
  );
}