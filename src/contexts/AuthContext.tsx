'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, Permission, UserRole } from '@/types/auth';
import { post, get } from '@/utilities/AxiosInterceptor';
import Cookies from 'js-cookie';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const response = await get<{ success: boolean; data: User }>('/api/v1/auth/profile');
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear token if auth check fails
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await post<{
        success: boolean;
        message: string;
        data: {
          token: string;
          user: User;
        };
      }>('/api/v1/auth/login', credentials);

      if (response.success) {
        // Store token in cookie
        Cookies.set('token', response.data.token, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === 'super_admin';
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const canAccessDepartment = (department: string): boolean => {
    if (!user) return false;
    
    // Super admin and admission officer can access all departments
    if (user.role === 'super_admin' || user.role === 'admission_officer') {
      return true;
    }
    
    // Department staff can only access their assigned department
    if (user.role === 'department_staff') {
      return user.department === department;
    }
    
    return false;
  };

  const isLoggedIn = !!user;

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccessDepartment,
    isLoggedIn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};