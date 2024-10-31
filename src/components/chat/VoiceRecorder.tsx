import React, { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, X } from 'lucide-react';

interface VoiceRecorderProps {
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let stream: MediaStream;

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          onComplete(blob);
          chunksRef.current = [];
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();

        timerRef.current = setInterval(() => {
          setDuration(d => d + 1);
        }, 1000);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
            {isRecording && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-gray-700">{formatDuration(duration)}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStop}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <StopCircle className="w-6 h-6" />
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}