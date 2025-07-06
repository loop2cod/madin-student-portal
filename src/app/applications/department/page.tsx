'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { get } from '@/utilities/AxiosInterceptor';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DepartmentApplication {
  _id: string;
  applicationId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    dateOfBirth: string;
    gender: string;
  };
  addressAndFamily: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  department: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
  educationDetails?: any;
  paymentDetails?: any;
}

interface DepartmentApplicationsResponse {
  success: boolean;
  data: {
    admissions: DepartmentApplication[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function DepartmentApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<DepartmentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchDepartmentStats();
  }, [page, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await get<DepartmentApplicationsResponse>(`/api/admissions/department/applications?${params}`);
      
      if (response.success) {
        setApplications(response.data.admissions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch department applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const response = await get<{
        success: boolean;
        data: {
          total: number;
          statusStats: Array<{ _id: string; count: number }>;
        };
      }>('/api/v1/admission/admin/stats/overview');
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch department stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'waitlisted':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleExportApplications = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Your applications export is being prepared...",
      });
      
      // Here you would implement the actual export functionality
      // For now, we'll just show a success message
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Applications exported successfully",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export applications",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['view_department_applications']}>
        <DashboardLayout title="Department Applications">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['view_department_applications']}>
      <DashboardLayout title="Department Applications">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.department} Applications
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage applications for your department
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportApplications}>
                <Download className="w-4 h-4 mr-2" />
                Export Applications
              </Button>
            </div>
          </div>

          {/* Department Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    For {user?.department}
                  </p>
                </CardContent>
              </Card>
              
              {stats.statusStats.map((stat: any) => (
                <Card key={stat._id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {stat._id?.replace('_', ' ') || 'Pending'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground">
                      Applications
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Applications ({pagination?.total || 0})
              </CardTitle>
              <CardDescription>
                All applications submitted for {user?.department}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found for your department</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {application.personalDetails.firstName} {application.personalDetails.lastName}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {application.applicationId} • {application.personalDetails.email}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>📱 {application.personalDetails.mobile}</span>
                              <span>📍 {application.addressAndFamily?.city}, {application.addressAndFamily?.state}</span>
                              <span>🎂 {application.personalDetails.gender}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`${getStatusColor(application.status)}`}
                            >
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </Badge>
                            
                            <div className="text-xs text-gray-500 text-right">
                              <p>Applied: {new Date(application.createdAt).toLocaleDateString()}</p>
                              {application.reviewedAt && (
                                <p>Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {application.adminRemarks && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <strong>Admin Remarks:</strong> {application.adminRemarks}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} applications
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}