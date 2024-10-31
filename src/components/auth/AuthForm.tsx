import React, { useState } from 'react';
import { User } from '../../types/auth';
import authService from '../../services/authService';
import { Camera } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = isLogin
        ? await authService.login({ username, password })
        : await authService.signup({
            username,
            password,
            confirmPassword,
            gender,
            bio,
            photoUrl: photoUrl || `https://source.unsplash.com/400x400/?portrait,${gender}`,
            age: parseInt(age),
            interests: interests.split(',').map(i => i.trim()),
          });
      onAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to Find Matches' : 'Create Your Profile'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <div className="mt-1 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={gender === 'male'}
                      onChange={(e) => setGender(e.target.value as 'male')}
                      className="text-pink-500 focus:ring-pink-500"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={gender === 'female'}
                      onChange={(e) => setGender(e.target.value as 'female')}
                      className="text-pink-500 focus:ring-pink-500"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  placeholder="e.g., music, travel, food"
                />
              </div>

              <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">
                  Profile Photo URL (optional)
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    id="photoUrl"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    placeholder="Enter image URL or leave blank for random photo"
                  />
                  <Camera className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            {isLogin ? 'Login' : 'Create Profile'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-pink-600 hover:text-pink-500"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}