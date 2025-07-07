'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { get, put } from '@/utilities/AxiosInterceptor';
import { User, UserRole, DEPARTMENTS } from '@/types/auth';
import { ArrowLeft, Edit, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface EditUserForm {
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  password?: string;
  confirmPassword?: string;
}

interface UserResponse {
  success: boolean;
  data: User;
}

export default function EditUserPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EditUserForm>({
    name: '',
    email: '',
    mobile: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await get<UserResponse>(`/api/v1/admin/users/${userId}`);
      
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile || '',
          role: userData.role,
          department: userData.department || '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch user');
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditUserForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      setError('Mobile number must be 10 digits');
      return false;
    }

    if (!formData.role) {
      setError('Role is required');
      return false;
    }

    if (formData.role === 'department_staff' && !formData.department) {
      setError('Department is required for department staff');
      return false;
    }

    if (changePassword) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const canEditRole = (): boolean => {
    if (!currentUser || !user) return false;
    
    // Super admin can edit any role
    if (currentUser.role === 'super_admin') return true;
    
    // Admission officers can only edit department staff
    if (currentUser.role === 'admission_officer' && user.role === 'department_staff') return true;
    
    return false;
  };

  const canChangePassword = (): boolean => {
    if (!currentUser || !user) return false;
    
    // Super admin can change any password
    if (currentUser.role === 'super_admin') return true;
    
    // Admission officers can change department staff passwords
    if (currentUser.role === 'admission_officer' && user.role === 'department_staff') return true;
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || undefined,
        role: formData.role as UserRole,
        department: formData.role === 'department_staff' ? formData.department : undefined
      };

      // Only include password if changing it
      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      await put(`/api/v1/admin/users/${userId}`, updateData);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      router.push('/users');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user');
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to update user',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['edit_users']}>
        <DashboardLayout title="Edit User">
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute requiredPermissions={['edit_users']}>
        <DashboardLayout title="Edit User">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
              <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
              <Link href="/users">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['edit_users']}>
      <DashboardLayout 
        title="Edit User" 
        breadcrumbs={[
          { title: 'Users', href: '/users' },
          { title: 'Edit User' }
        ]}
      >
        <div className="p-6">
          <div className="mb-6">
            <Link href="/users">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit User: {user.name}
              </CardTitle>
              <CardDescription>
                Update user information and permissions
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {user.lastLogin && (
                  <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                )}
                <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleInputChange('role', value)}
                      disabled={saving || !canEditRole()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser?.role === 'super_admin' && (
                          <>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admission_officer">Admission Officer</SelectItem>
                          </>
                        )}
                        <SelectItem value="department_staff">Department Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.role === 'department_staff' && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange('department', value)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {canChangePassword() && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="changePassword"
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="changePassword">Change Password</Label>
                    </div>

                    {changePassword && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Enter new password"
                              disabled={saving}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                              disabled={saving}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Link href="/users">
                    <Button type="button" variant="outline" disabled={saving}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
