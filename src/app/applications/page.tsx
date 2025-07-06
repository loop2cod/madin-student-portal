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
import { get, put } from '@/utilities/AxiosInterceptor';
import { DEPARTMENTS } from '@/types/auth';
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
  Users,
  Building
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Application {
  _id: string;
  applicationId: string;
  personalDetails: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    mobile: string;
  };
  programSelections?: Array<{
    programLevel: string;
    programName: string;
    mode?: string;
    specialization?: string;
    branchPreferences?: Array<{
      branch: string;
      priority: number;
    }>;
    selected: boolean;
    priority: number;
  }>;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  department?: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

interface ApplicationsResponse {
  success: boolean;
  data: {
    admissions: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function ApplicationsPage() {
  const { user, hasPermission } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [page, searchTerm, statusFilter, departmentFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Determine the endpoint based on user role
      const endpoint = user?.role === 'department_staff' 
        ? '/api/v1/admission/department/applications' 
        : '/api/v1/admission/admin/all';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        department: departmentFilter === 'all' ? '' : departmentFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await get<ApplicationsResponse>(`${endpoint}?${params}`);
      
      if (response.success) {
        setApplications(response.data.admissions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string, remarks?: string) => {
    try {
      await put(`/api/v1/admission/admin/${applicationId}/status`, {
        status: newStatus,
        remarks: remarks
      });
      
      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus as any, adminRemarks: remarks }
          : app
      ));
      
      toast({
        title: "Success",
        description: `Application ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Failed to update application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedApplications.length === 0) {
      toast({
        title: "Error",
        description: "Please select applications to update",
        variant: "destructive",
      });
      return;
    }

    try {
      await put('/api/v1/admission/admin/bulk/status', {
        admissionIds: selectedApplications,
        status: status,
        remarks: `Bulk update to ${status}`
      });
      
      // Update local state
      setApplications(applications.map(app => 
        selectedApplications.includes(app._id)
          ? { ...app, status: status as any }
          : app
      ));
      
      setSelectedApplications([]);
      
      toast({
        title: "Success",
        description: `${selectedApplications.length} applications updated successfully`,
      });
    } catch (error) {
      console.error('Failed to bulk update applications:', error);
      toast({
        title: "Error",
        description: "Failed to update applications",
        variant: "destructive",
      });
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

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app._id));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['view_all_applications', 'view_department_applications']}>
        <DashboardLayout title="Applications">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute 
      requiredPermissions={['view_all_applications', 'view_department_applications']} 
      allowAny={true}
    >
      <DashboardLayout title="Applications">
        <div className="p-6">
          <div className="grid md:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'department_staff' ? 'Department Applications' : 'All Applications'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'department_staff' 
                  ? `Applications for ${user.department}` 
                  : 'Manage all admission applications'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {hasPermission('download_applications') && (
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              
              {hasPermission('bulk_operations') && selectedApplications.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Bulk Actions ({selectedApplications.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('under_review')}>
                      Mark as Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('approved')}>
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('rejected')}>
                      Reject Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('waitlisted')}>
                      Move to Waitlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
            
            {user?.role !== 'department_staff' && (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDepartmentFilter('all');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Applications ({pagination?.total || 0})
                </span>
              </CardTitle>
              <CardDescription>
                {user?.role === 'department_staff' 
                  ? `Applications for ${user.department}` 
                  : 'All admission applications in the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found</p>
                </div>
              ) : (
                <ScrollArea className="h-[62vh]">
                <div className="space-y-4">
                  {applications.map((application) => {
                    const selectedProgram = application.programSelections?.find(p => p.selected);
                    const createdDate = new Date(application.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                  return (
                                        <div
                                          key={application._id}
                                          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <p className="text-sm font-semibold text-gray-900">
                                                {application.personalDetails.fullName ||
                                                 `${application.personalDetails.firstName} ${application.personalDetails.lastName}`}
                                              </p>
                                              <p className="text-xs text-gray-600 font-medium">
                                                ID: {application.applicationId}
                                              </p>
                                            </div>
                                            <Badge
                                              variant="secondary"
                                              className={getStatusColor(application.status)}
                                            >
                                              {getStatusIcon(application.status)}
                                              <span className="ml-1 capitalize">{application.status}</span>
                                            </Badge>
                                          </div>
                
                                          <p className="text-xs text-gray-500 mb-3">
                                            Created: {createdDate}
                                          </p>
                
                                          {selectedProgram && (
                                            <div className="bg-gray-50 p-1 rounded-md">
                                              <p className="text-xs font-medium text-gray-700 mb-1">Program Details:</p>
                                              <p className="text-xs text-gray-900 font-medium">{selectedProgram.programName}</p>
                                              <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                  Level: {selectedProgram.programLevel.toUpperCase()}
                                                </Badge>
                                                {selectedProgram.mode && (
                                                  <Badge variant="outline" className="text-xs">
                                                    Mode: {selectedProgram.mode}
                                                  </Badge>
                                                )}
                                                {selectedProgram.specialization && (
                                                  <Badge variant="outline" className="text-xs">
                                                    Specialization: {selectedProgram.specialization}
                                                  </Badge>
                                                )}
                                              </div>
                                              {selectedProgram.branchPreferences && selectedProgram.branchPreferences.length > 0 && (
                                                <p className="text-xs text-gray-600 mt-2">
                                                  Branch: {selectedProgram.branchPreferences
                                                    .sort((a, b) => a.priority - b.priority)
                                                    .map(b => b.branch)
                                                    .join(', ')}
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                  })}
                </div>
                </ScrollArea>
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