import { User } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

// Mock data for testing
const mockUsers: User[] = [
  {
    id: uuidv4(),
    username: 'Sarah',
    gender: 'female',
    age: 25,
    bio: 'Adventure seeker and coffee lover ☕',
    photoUrl: 'https://source.unsplash.com/400x400/?portrait,woman',
    interests: ['travel', 'photography', 'yoga']
  },
  {
    id: uuidv4(),
    username: 'Mike',
    gender: 'male',
    age: 28,
    bio: 'Music producer and fitness enthusiast 🎵',
    photoUrl: 'https://source.unsplash.com/400x400/?portrait,man',
    interests: ['music', 'fitness', 'cooking']
  },
  // Add more mock users as needed
];

class MatchService {
  private matches: Map<string, Set<string>> = new Map();
  private likes: Map<string, Set<string>> = new Map();
  private currentIndex: number = 0;

  async getNextProfile(userGender: string): Promise<User | null> {
    // Filter users of opposite gender
    const potentialMatches = mockUsers.filter(u => u.gender !== userGender);
    
    if (this.currentIndex >= potentialMatches.length) {
      this.currentIndex = 0;
      return null;
    }

    const nextProfile = potentialMatches[this.currentIndex];
    this.currentIndex++;
    return nextProfile;
  }

  async submitAction(targetUserId: string, action: 'like' | 'superlike' | 'dislike'): Promise<void> {
    if (action === 'dislike') return;

    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return;

    if (!this.likes.has(currentUserId)) {
      this.likes.set(currentUserId, new Set());
    }

    this.likes.get(currentUserId)?.add(targetUserId);
  }

  async checkMatch(targetUserId: string): Promise<boolean> {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return false;

    // Simulate mutual like with 30% probability
    const isMatch = Math.random() < 0.3;
    
    if (isMatch) {
      if (!this.matches.has(currentUserId)) {
        this.matches.set(currentUserId, new Set());
      }
      this.matches.get(currentUserId)?.add(targetUserId);
    }

    return isMatch;
  }

  async getMatches(): Promise<User[]> {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return [];

    const userMatches = this.matches.get(currentUserId);
    if (!userMatches) return [];

    return mockUsers.filter(user => userMatches.has(user.id));
  }
}

export default new MatchService();