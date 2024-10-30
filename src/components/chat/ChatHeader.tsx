import React from 'react';
import { ArrowLeft, Video, SkipForward, Users } from 'lucide-react';

interface ChatHeaderProps {
  onBack: () => void;
  onSkip?: () => void;
  onToggleVideo?: () => void;
  isVideoEnabled?: boolean;
  showVideoToggle?: boolean;
  onlineCount?: number;
}

export default function ChatHeader({
  onBack,
  onSkip,
  onToggleVideo,
  isVideoEnabled,
  showVideoToggle,
  onlineCount
}: ChatHeaderProps) {
  return (
    <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="flex items-center space-x-4">
        {showVideoToggle && onToggleVideo && (
          <button
            onClick={onToggleVideo}
            className={`p-2 rounded-full ${
              isVideoEnabled ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <Video className="w-5 h-5" />
          </button>
        )}
        {onlineCount !== undefined && (
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">{onlineCount} online</span>
          </div>
        )}
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </button>
        )}
      </div>
    </div>
  );
}