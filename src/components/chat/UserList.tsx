import React from 'react';
import { Peer } from '../../types/chat';

interface UserListProps {
  peers: Peer[];
  currentUserId: string;
}

export default function UserList({ peers, currentUserId }: UserListProps) {
  return (
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
              {peer.id === currentUserId ? `${peer.username} (You)` : peer.username}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}