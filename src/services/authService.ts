import { User, LoginCredentials, SignupCredentials } from '../types/auth';

class AuthService {
  private static readonly USERS_KEY = 'chat_users';
  private static readonly CURRENT_USER_KEY = 'current_user';

  private getUsers(): Record<string, { username: string; password: string }> {
    const users = localStorage.getItem(AuthService.USERS_KEY);
    return users ? JSON.parse(users) : {};
  }

  private saveUsers(users: Record<string, { username: string; password: string }>) {
    localStorage.setItem(AuthService.USERS_KEY, JSON.stringify(users));
  }

  async signup({ username, password, confirmPassword }: SignupCredentials): Promise<User> {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const users = this.getUsers();
    
    if (Object.values(users).some(user => user.username === username)) {
      throw new Error('Username already exists');
    }

    const userId = crypto.randomUUID();
    users[userId] = { username, password };
    this.saveUsers(users);

    const user = { id: userId, username };
    localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify(user));
    
    return user;
  }

  async login({ username, password }: LoginCredentials): Promise<User> {
    const users = this.getUsers();
    const userEntry = Object.entries(users).find(([_, user]) => user.username === username);

    if (!userEntry || userEntry[1].password !== password) {
      throw new Error('Invalid username or password');
    }

    const user = { id: userEntry[0], username };
    localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify(user));
    
    return user;
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(AuthService.CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  logout(): void {
    localStorage.removeItem(AuthService.CURRENT_USER_KEY);
  }
}

export default new AuthService();