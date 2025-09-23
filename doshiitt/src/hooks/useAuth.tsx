import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development
const MOCK_USER: User = {
  id: 1,
  email: 'john.doe@tesapay.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+2348123456789',
  full_name: 'John Doe'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Auto-login with mock user for development
    const savedUser = localStorage.getItem('tesapay_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-login with mock user
      setUser(MOCK_USER);
      localStorage.setItem('tesapay_user', JSON.stringify(MOCK_USER));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call your auth API
    if (email && password) {
      setUser(MOCK_USER);
      localStorage.setItem('tesapay_user', JSON.stringify(MOCK_USER));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tesapay_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};