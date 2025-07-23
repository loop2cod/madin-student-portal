'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { get } from '@/utilities/AxiosInterceptor';
import { useDebounce } from '@/hooks/useDebounce';
import { useApplicationFilters } from '@/hooks/useApplicationFilters';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  SortAsc,
  SortDesc,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { AdvancedFilters } from '@/components/AdvancedFilters';

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
  educationDetailsExists?: boolean;
  selectedProgramSummary?: {
    programLevel: string;
    programName: string;
    mode?: string;
    specialization?: string;
  } | null;
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
    filters: {
      availableStatuses: string[];
      availableDepartments: string[];
      availableStages: string[];
    };
  };
}

interface FilterStats {
  statusStats: Array<{ _id: string; count: number }>;
  departmentStats: Array<{ _id: string; count: number }>;
  stageStats: Array<{ _id: string; count: number }>;
  dateStats: Array<{ _id: { year: number; month: number }; count: number }>;
  totalApplications: number;
}

export default function ApplicationsPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State management
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);
  const [availableFilters, setAvailableFilters] = useState<{
    availableStatuses: string[];
    availableDepartments: string[];
    availableStages: string[];
  } | null>(null);

  // Filter management
  const { 
    filters, 
    updateFilter, 
    updateMultipleFilters, 
    resetFilters, 
    clearSearchAndFilters, 
    queryParams, 
    hasActiveFilters 
  } = useApplicationFilters();

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 1000);

  // Fetch applications when filters change
  useEffect(() => {
    fetchApplications();
  }, [page, debouncedSearch, filters.status, filters.statuses, filters.department, 
      filters.departments, filters.dateFrom, filters.dateTo, filters.currentStage, 
      filters.hasEducationDetails, filters.programLevel, filters.reviewedBy, 
      filters.sortBy, filters.sortOrder]);

  // Fetch filter stats on component mount
  useEffect(() => {
    fetchFilterStats();
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      // Determine the endpoint based on user role
      const endpoint = user?.role === 'department_staff'
        ? '/api/v1/admission/department/applications'
        : '/api/v1/admission/admin/all';

      // Build query parameters
      const params = new URLSearchParams(queryParams);
      params.set('page', page.toString());
      params.set('limit', '10');

      const response = await get<ApplicationsResponse>(`${endpoint}?${params}`);

      if (response.success) {
        setApplications(response.data.admissions);
        setPagination(response.data.pagination);
        setAvailableFilters(response.data.filters);
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
      setRefreshing(false);
    }
  }, [user?.role, queryParams, page, refreshing, toast]);

  const fetchFilterStats = useCallback(async () => {
    try {
      const endpoint = user?.role === 'department_staff'
        ? '/api/v1/admission/department/stats/filters'
        : '/api/v1/admission/admin/stats/filters';

      const response = await get<{ success: boolean; data: FilterStats }>(`${endpoint}`);

      if (response.success) {
        setFilterStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch filter stats:', error);
    }
  }, [user?.role]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchApplications(), fetchFilterStats()]);
  }, [fetchApplications, fetchFilterStats]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSort = useCallback((sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    updateMultipleFilters({ sortBy, sortOrder: newSortOrder });
    setPage(1);
  }, [filters.sortBy, filters.sortOrder, updateMultipleFilters]);

  const handleMultiSelectChange = useCallback((
    filterKey: 'statuses' | 'departments',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterKey] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    updateFilter(filterKey, newValues);
    setPage(1);
  }, [filters, updateFilter]);



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



  const handleViewApplication = useCallback((applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  }, [router]);

  // Memoized computed values
  const sortedApplications = useMemo(() => {
    return [...applications]; // Already sorted by backend
  }, [applications]);

  const statusCounts = useMemo(() => {
    if (!filterStats) return {};
    return filterStats.statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }, [filterStats]);

  const departmentCounts = useMemo(() => {
    if (!filterStats) return {};
    return filterStats.departmentStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
  }, [filterStats]);

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={['view_all_applications', 'view_department_applications']}>
        <DashboardLayout title="Applications">
            <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'department_staff' ? 'Department Applications' : 'All Applications'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'department_staff'
                  ? `Applications for ${user.department}`
                  : 'Manage all admission applications'}
              </p>
              {filterStats && (
                <p className="text-sm text-gray-500 mt-1">
                  Total: {filterStats.totalApplications} applications
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {hasPermission('download_applications') && (
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6">
            <AdvancedFilters
              filters={filters}
              updateFilter={updateFilter}
              updateMultipleFilters={updateMultipleFilters}
              clearSearchAndFilters={clearSearchAndFilters}
              hasActiveFilters={hasActiveFilters}
              availableFilters={availableFilters}
              statusCounts={statusCounts}
              departmentCounts={departmentCounts}
              userRole={user?.role}
              userDepartment={user?.department}
              onMultiSelectChange={handleMultiSelectChange}
            />
          </div>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Applications ({pagination?.total || 0})
                </span>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-normal">Sort by:</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleSort(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="personalDetails.fullName">Name</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(filters.sortBy)}
                    className="px-2"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {user?.role === 'department_staff'
                  ? `Applications for ${user.department}`
                  : 'All admission applications in the system'}
                {pagination && (
                  <span className="ml-2">
                    • Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found</p>
                </div>
              ) : (
                <ScrollArea className="h-[51vh]">
                  <div className="space-y-4">
                    {sortedApplications.map((application) => {
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
                            <div className="flex items-start space-x-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {application?.personalDetails?.fullName ||
                                    `${application?.personalDetails?.firstName} ${application?.personalDetails?.lastName}`}
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                  ID: {application?.applicationId}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={getStatusColor(application.status)}
                            >
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </Badge>
                          </div>

                          <div className='flex justify-between w-full items-center'>
                            <p className="text-xs text-gray-500">
                              Created: {createdDate}
                            </p>
                            <Button
                              size="sm"
                              className='mb-2 text-xs cursor-pointer'
                              variant="outline"
                              onClick={() => handleViewApplication(application?.applicationId)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                          {/* Education Details Summary */}
                          {application.selectedProgramSummary && (
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-blue-800">Education Details:</p>
                              </div>
                              <p className="text-xs text-blue-900 font-medium mb-2">{application.selectedProgramSummary.programName}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                  Level: {application.selectedProgramSummary.programLevel.toUpperCase()}
                                </Badge>
                                {application.selectedProgramSummary.mode && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                    Mode: {application.selectedProgramSummary.mode}
                                  </Badge>
                                )}
                                {application.selectedProgramSummary.specialization && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                    Specialization: {application.selectedProgramSummary.specialization}
                                  </Badge>
                                )}
                              </div>
                                {selectedProgram && selectedProgram.branchPreferences && selectedProgram.branchPreferences.length > 0 && (
                                <p className="text-xs text-gray-600 mt-2">
                                  Branch: {selectedProgram.branchPreferences
                                    .sort((a, b) => a.priority - b.priority)
                                    .map(b => b.branch)
                                    .join(', ')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Department Assignment Display */}
                          {application.department && (
                            <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-3 h-3 text-green-600" />
                                  <span className="text-xs font-medium text-green-800">Department:</span>
                                  <span className="text-xs text-green-900 font-semibold">{application.department}</span>
                                </div>
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                  Assigned
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Program Selection Fallback */}
                          {!application.selectedProgramSummary && selectedProgram && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-xs font-medium text-gray-700 mb-1">Program Selection:</p>
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

              {/* Enhanced Pagination */}
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
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= pagination.pages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={page === pagination.pages}
                    >
                      Last
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