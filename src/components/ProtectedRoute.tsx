'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  allowAny?: boolean; // If true, allows access if user has ANY of the permissions/roles instead of ALL
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
  allowAny = false
}) => {
  const { user, loading, isLoggedIn, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [loading, isLoggedIn, router]);

  // Show loading state
  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return null;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const permissionCheck = allowAny 
      ? requiredPermissions.some(permission => hasPermission(permission))
      : requiredPermissions.every(permission => hasPermission(permission));
    
    if (!permissionCheck) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const roleCheck = allowAny 
      ? requiredRoles.some(role => hasRole(role))
      : hasRole(requiredRoles);
    
    if (!roleCheck) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have the required role to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// Higher-order component for page protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredPermissions?: Permission[];
    requiredRoles?: UserRole[];
    fallback?: React.ReactNode;
  } = {}
) => {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};