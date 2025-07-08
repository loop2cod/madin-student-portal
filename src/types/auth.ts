// Authentication types and interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'super_admin' | 'admission_officer' | 'department_staff';

export type Permission = 
  // Application management
  | 'view_all_applications'
  | 'view_department_applications'
  | 'edit_applications'
  | 'update_application_status'
  | 'verify_applications'
  | 'download_applications'
  | 'bulk_export_applications'
  
  // User management
  | 'create_super_admin'
  | 'create_admission_officer'
  | 'create_department_staff'
  | 'view_all_users'
  | 'edit_users'
  | 'delete_users'
  | 'activate_deactivate_users'
  
  // System management
  | 'manage_departments'
  | 'manage_settings'
  | 'view_system_logs'
  | 'generate_reports'
  | 'bulk_operations'
  
  // Dashboard access
  | 'view_admin_dashboard'
  | 'view_analytics';

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccessDepartment: (department: string) => boolean;
  isLoggedIn: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export const DEPARTMENTS: Department[] = [
  { id: 'civil', name: 'Civil Engineering', code: 'CE' },
  { id: 'mechanical', name: 'Mechanical Engineering', code: 'ME' },
  { id: 'electrical', name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { id: 'computer', name: 'Computer Engineering', code: 'CE' },
  { id: 'automobile', name: 'Automobile Engineering', code: 'AE' },
  { id: 'architecture', name: 'Architecture', code: 'AR' },
  { id: 'mba', name: 'MBA', code: 'MBA' }
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_all_applications',
    'edit_applications',
    'update_application_status',
    'verify_applications',
    'download_applications',
    'bulk_export_applications',
    'create_super_admin',
    'create_admission_officer',
    'create_department_staff',
    'view_all_users',
    'edit_users',
    'delete_users',
    'activate_deactivate_users',
    'manage_departments',
    'manage_settings',
    'view_system_logs',
    'generate_reports',
    'bulk_operations',
    'view_admin_dashboard',
    'view_analytics'
  ],
  admission_officer: [
    'view_all_applications',
    'edit_applications',
    'update_application_status',
    'verify_applications',
    'download_applications',
    'bulk_export_applications',
    'create_department_staff',
    'view_all_users',
    'edit_users',
    'activate_deactivate_users',
    'generate_reports',
    'bulk_operations',
    'view_admin_dashboard',
    'view_analytics'
  ],
  department_staff: [
    'view_department_applications',
    'download_applications'
  ]
};