import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  full_name: string;
  is_verified: boolean;
  kyc_level: string;
  referral_code: string;
}

interface Wallet {
  id: number;
  currency: string;
  balance: number;
  wallet_type: string;
}

interface AuthContextType {
  user: User | null;
  wallets: Wallet[];
  login: (userData: User, sessionToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  sessionToken: string | null;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const savedToken = localStorage.getItem('tesapay_session_token');
    if (savedToken) {
      try {
        const isValid = await checkSession(savedToken);
        if (!isValid) {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setIsLoading(false);
  };

  const checkSession = async (token?: string): Promise<boolean> => {
    const tokenToCheck = token || sessionToken;
    if (!tokenToCheck) return false;

    try {
      const response = await fetch('/backend/auth/session_check.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: tokenToCheck
        }),
      });

      const data = await response.json();

      if (data.success && data.session_valid) {
        setUser(data.user);
        setWallets(data.wallets || []);
        setSessionToken(tokenToCheck);
        localStorage.setItem('tesapay_session_token', tokenToCheck);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const login = async (userData: User, token: string) => {
    setUser(userData);
    setSessionToken(token);
    localStorage.setItem('tesapay_session_token', token);
    
    // Get updated user data including wallets
    await checkSession(token);
  };

  const logout = () => {
    setUser(null);
    setWallets([]);
    setSessionToken(null);
    localStorage.removeItem('tesapay_session_token');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      wallets,
      login,
      logout,
      isAuthenticated: !!user && !!sessionToken,
      sessionToken,
      checkSession: () => checkSession()
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