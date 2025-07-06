'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { get } from '@/utilities/AxiosInterceptor';
import { 
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Building,
  Calendar,
  Target,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalApplications: number;
  totalUsers: number;
  statusStats: Array<{ _id: string; count: number }>;
  departmentStats: Array<{ _id: string; count: number }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
  userStats: Array<{ _id: string; count: number }>;
  recentTrends: {
    applicationsThisMonth: number;
    applicationsLastMonth: number;
    usersThisMonth: number;
    usersLastMonth: number;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [admissionStats, dashboardStats] = await Promise.all([
        get<{
          success: boolean;
          data: {
            total: number;
            statusStats: Array<{ _id: string; count: number }>;
            departmentStats: Array<{ _id: string; count: number }>;
            monthlyStats: Array<{ _id: { year: number; month: number }; count: number }>;
          };
        }>('/api/v1/admission/admin/stats/overview'),
        
        get<{
          success: boolean;
          data: {
            userStats: Array<{ _id: string; count: number }>;
            totalUsers: number;
            totalApplications: number;
          };
        }>('/api/v1/admin/dashboard/stats')
      ]);

      if (admissionStats.success && dashboardStats.success) {
        setAnalytics({
          totalApplications: admissionStats.data.total,
          totalUsers: dashboardStats.data.totalUsers || 0,
          statusStats: admissionStats.data.statusStats,
          departmentStats: admissionStats.data.departmentStats,
          monthlyStats: admissionStats.data.monthlyStats,
          userStats: dashboardStats.data.userStats,
          recentTrends: {
            applicationsThisMonth: 0,
            applicationsLastMonth: 0,
            usersThisMonth: 0,
            usersLastMonth: 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'under_review':
        return 'bg-yellow-500';
      case 'waitlisted':
        return 'bg-teal-700';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admission_officer':
        return 'Admission Officer';
      case 'department_staff':
        return 'Department Staff';
      default:
        return role;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['view_analytics']}>
        <DashboardLayout title="Analytics">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['view_analytics']}>
      <DashboardLayout title="Analytics">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analytics and insights for {user?.role === 'department_staff' ? user.department : 'the entire system'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalApplications || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All-time applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active system users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.departmentStats.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active departments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.statusStats.length > 0 ? (
                    Math.round(
                      ((analytics.statusStats.find(s => s._id === 'approved')?.count || 0) / 
                       analytics.totalApplications) * 100
                    )
                  ) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Applications approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Application Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Application Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.statusStats.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(stat._id)}`} />
                        <span className="text-sm capitalize">{stat._id?.replace('_', ' ') || 'Pending'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stat.count}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round((stat.count / (analytics?.totalApplications || 1)) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Role Distribution
                </CardTitle>
                <CardDescription>
                  System users by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.userStats.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-700" />
                        <span className="text-sm">{getRoleDisplayName(stat._id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stat.count}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round((stat.count / (analytics?.totalUsers || 1)) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department-wise Applications */}
          {analytics?.departmentStats.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Department-wise Applications
                </CardTitle>
                <CardDescription>
                  Application distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.departmentStats.map((dept) => (
                    <div key={dept._id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">{dept._id}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-900">{dept.count}</span>
                        <span className="text-sm text-gray-500">
                          {Math.round((dept.count / (analytics?.totalApplications || 1)) * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Applications</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Trends */}
          {analytics?.monthlyStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly Application Trends
                </CardTitle>
                <CardDescription>
                  Applications received over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.monthlyStats.slice(-12).map((stat) => (
                    <div key={`${stat._id.year}-${stat._id.month}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {getMonthName(stat._id.month)} {stat._id.year}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stat.count}</span>
                        <span className="text-xs text-gray-500">applications</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}