import { User, UserRole, Permission } from '@/types/auth';

export const canAccessDashboard = (user: User | null): boolean => {
  if (!user) return false;
  
  // All authenticated users can access some form of dashboard
  return true;
};

export const canAccessAdminDashboard = (user: User | null): boolean => {
  if (!user) return false;
  
  // Only Super Admin and Admission Officer can access admin dashboard
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canViewAllApplications = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can view all applications
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canViewDepartmentApplications = (user: User | null): boolean => {
  if (!user) return false;
  
  // Department staff can only view their department's applications
  return user.role === 'department_staff';
};

export const canManageUsers = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can manage users
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canCreateSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  
  // Only Super Admin can create other Super Admins
  return user.role === 'super_admin';
};

export const canCreateAdmissionOfficer = (user: User | null): boolean => {
  if (!user) return false;
  
  // Only Super Admin can create Admission Officers
  return user.role === 'super_admin';
};

export const canCreateDepartmentStaff = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can create Department Staff
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canViewSystemAnalytics = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can view system analytics
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canManageSystemSettings = (user: User | null): boolean => {
  if (!user) return false;
  
  // Only Super Admin can manage system settings
  return user.role === 'super_admin';
};

export const canPerformBulkOperations = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can perform bulk operations
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canEditApplications = (user: User | null): boolean => {
  if (!user) return false;
  
  // Super Admin and Admission Officer can edit applications
  return user.role === 'super_admin' || user.role === 'admission_officer';
};

export const canDownloadApplications = (user: User | null): boolean => {
  if (!user) return false;
  
  // All roles can download applications (with different scopes)
  return true;
};

export const getDashboardTitle = (user: User | null): string => {
  if (!user) return 'Dashboard';
  
  switch (user.role) {
    case 'super_admin':
      return 'Super Admin Dashboard';
    case 'admission_officer':
      return 'Admission Officer Dashboard';
    case 'department_staff':
      return `${user.department} Department Dashboard`;
    default:
      return 'Dashboard';
  }
};

export const getApplicationsTitle = (user: User | null): string => {
  if (!user) return 'Applications';
  
  switch (user.role) {
    case 'super_admin':
    case 'admission_officer':
      return 'All Applications';
    case 'department_staff':
      return `${user.department} Applications`;
    default:
      return 'Applications';
  }
};

export const getApplicationsDescription = (user: User | null): string => {
  if (!user) return 'Manage applications';
  
  switch (user.role) {
    case 'super_admin':
    case 'admission_officer':
      return 'Manage all admission applications';
    case 'department_staff':
      return `Applications for ${user.department}`;
    default:
      return 'Manage applications';
  }
};