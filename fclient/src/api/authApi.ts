import { User, UserRole } from '../types';

export const login = async (email: string, role: UserRole): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const usersStr = localStorage.getItem('eventease_users');
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  let user = users.find(u => u.email === email && u.role === role);
  
  if (!user) {
    // Auto-signup for simplicity in mock
    user = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role
    };
    users.push(user);
    localStorage.setItem('eventease_users', JSON.stringify(users));
  }
  
  localStorage.setItem('eventease_currentUser', JSON.stringify(user));
  return user;
};

export const logout = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  localStorage.removeItem('eventease_currentUser');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('eventease_currentUser');
  return userStr ? JSON.parse(userStr) : null;
};
