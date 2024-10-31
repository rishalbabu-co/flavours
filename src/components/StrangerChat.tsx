import React, { useState } from 'react';
import ChatRoom from './ChatRoom';
import { User } from '../types/auth';

interface StrangerChatProps {
  user: User;
  onBack: () => void;
}

export default function StrangerChat({ user, onBack }: StrangerChatProps) {
  return <ChatRoom user={user} onBack={onBack} />;
}