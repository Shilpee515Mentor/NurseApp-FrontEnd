import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {authApi} from '../services/api'; // assuming authApi is defined in this file

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
}



interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync('token'),
          SecureStore.getItemAsync('user'),
        ]);
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          setState({
            token: storedToken,
            user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response;
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      setState({ token, user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    try {
      const response = await authApi.register(data);
      if (response.token && response.user) {
        await SecureStore.setItemAsync('token', response.token);
        await SecureStore.setItemAsync('user', JSON.stringify(response.user));
        setState({ token: response.token, user: response.user, isAuthenticated: true });
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setState({ token: null, user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}