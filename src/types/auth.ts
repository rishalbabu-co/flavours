export interface User {
  id: string;
  username: string;
  gender: 'male' | 'female';
  bio?: string;
  photoUrl?: string;
  age?: number;
  interests?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
  gender: 'male' | 'female';
  bio?: string;
  photoUrl?: string;
  age?: number;
  interests?: string[];
}