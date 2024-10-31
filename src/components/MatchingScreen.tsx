import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { Heart, X, Flame, ArrowLeft } from 'lucide-react';
import matchService from '../services/matchService';

interface MatchingScreenProps {
  user: User;
  onBack: () => void;
}

export default function MatchingScreen({ user, onBack }: MatchingScreenProps) {
  const [currentProfile, setCurrentProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<User[]>([]);

  useEffect(() => {
    loadNextProfile();
  }, []);

  const loadNextProfile = async () => {
    setLoading(true);
    const nextProfile = await matchService.getNextProfile(user.gender);
    setCurrentProfile(nextProfile);
    setLoading(false);
  };

  const handleAction = async (action: 'like' | 'superlike' | 'dislike') => {
    if (!currentProfile) return;

    await matchService.submitAction(currentProfile.id, action);
    
    if (action !== 'dislike') {
      const isMatch = await matchService.checkMatch(currentProfile.id);
      if (isMatch) {
        setMatches(prev => [...prev, currentProfile]);
        // Show match notification
        alert(`It's a match with ${currentProfile.username}! 🎉`);
      }
    }
    
    loadNextProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No more profiles</h2>
          <p className="text-gray-600">Check back later for more matches!</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <img
              src={currentProfile.photoUrl}
              alt={currentProfile.username}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h2 className="text-2xl font-bold text-white">
                {currentProfile.username}, {currentProfile.age}
              </h2>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-700 mb-4">{currentProfile.bio}</p>
            {currentProfile.interests && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleAction('dislike')}
                className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-8 h-8 text-gray-600" />
              </button>
              <button
                onClick={() => handleAction('superlike')}
                className="p-4 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <Flame className="w-8 h-8 text-blue-600" />
              </button>
              <button
                onClick={() => handleAction('like')}
                className="p-4 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
              >
                <Heart className="w-8 h-8 text-pink-600" />
              </button>
            </div>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Recent Matches</h3>
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {matches.map(match => (
                <div key={match.id} className="flex-shrink-0">
                  <img
                    src={match.photoUrl}
                    alt={match.username}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <p className="text-center text-sm mt-1">{match.username}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}