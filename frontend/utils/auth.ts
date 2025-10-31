// Utility functions for authentication and user management

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'user';
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return null;
  }

  try {
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');

    if (!email || !name || !role) {
      return null;
    }

    return {
      email,
      name,
      role: role as 'admin' | 'librarian' | 'user'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasRole = (allowedRoles: string[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return allowedRoles.includes(user.role);
};

export const isLibrarian = (): boolean => {
  return hasRole(['librarian', 'admin']);
};

export const isAdmin = (): boolean => {
  return hasRole(['admin']);
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }
};

export const getUserDisplayName = (): string => {
  const user = getCurrentUser();
  return user ? user.name : 'Guest';
};

export const getUserRole = (): string => {
  const user = getCurrentUser();
  return user ? user.role : 'guest';
};