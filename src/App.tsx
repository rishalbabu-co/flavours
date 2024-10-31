import React, { useEffect, useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import StrangerChat from './components/StrangerChat';
import GroupChat from './components/GroupChat';
import MatchingScreen from './components/MatchingScreen';
import { User } from './types/auth';
import authService from './services/authService';
import { MessageSquare, Users, Heart } from 'lucide-react';
import AdUnit from './components/ads/AdUnit';

type Feature = 'one-on-one' | 'group' | 'matching' | null;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSelectedFeature(null);
  };

  const handleBack = () => {
    setSelectedFeature(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
        <div className="max-w-md mx-auto mt-8">
          <AdUnit 
            adKey="auth-page-ad"
            slot="1234567890"
            layout="in-article"
          />
        </div>
      </div>
    );
  }

  if (selectedFeature === 'one-on-one') {
    return <StrangerChat user={user} onBack={handleBack} />;
  }

  if (selectedFeature === 'group') {
    return <GroupChat onBack={handleBack} />;
  }

  if (selectedFeature === 'matching') {
    return <MatchingScreen user={user} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-4 mb-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Welcome, {user.username}!
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <AdUnit 
          adKey="home-top-ad"
          slot="2345678901"
          format="rectangle"
          className="mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedFeature('one-on-one')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <MessageSquare className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center text-gray-800">One-on-One Chat</h2>
            <p className="mt-2 text-gray-600 text-center">
              Chat with random strangers one-on-one
            </p>
          </button>

          <button
            onClick={() => setSelectedFeature('group')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Users className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center text-gray-800">Group Chat</h2>
            <p className="mt-2 text-gray-600 text-center">
              Join group conversations with multiple users
            </p>
          </button>

          <button
            onClick={() => setSelectedFeature('matching')}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center text-gray-800">Find Matches</h2>
            <p className="mt-2 text-gray-600 text-center">
              Discover and match with potential partners
            </p>
          </button>
        </div>

        <AdUnit 
          adKey="home-bottom-ad"
          slot="3456789012"
          layout="in-article"
          className="mt-8"
        />
      </div>
    </div>
  );
}

export default App;