import React, { useRef, useEffect } from 'react';

interface VideoChatProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export default function VideoChat({ localStream, remoteStream }: VideoChatProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
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
  );
}