'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { get } from '@/utilities/AxiosInterceptor';
import { 
  History, 
  User, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AuditLog {
  _id: string;
  applicationId: string;
  section: string;
  action: string;
  changes: any;
  previousValues?: any;
  newValues?: any;
  editedBy: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  description: string;
  timestamp: string;
  formattedTimestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditTrailProps {
  applicationId: string;
  className?: string;
  refreshKey?: number;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ 
  applicationId, 
  className = "",
  refreshKey = 0
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const logsPerPage = 10;

  const fetchAuditLogs = async (page: number = 1) => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await get<any>(`/api/v1/admission/admin/${applicationId}/audit-logs?page=${page}&limit=${logsPerPage}`);
      
      if (response.success) {
        setAuditLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch audit logs');
      }
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      setError(error.message || 'Failed to load audit logs');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [applicationId, refreshKey]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchAuditLogs(newPage);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'status_changed':
        return 'bg-yellow-100 text-yellow-800';
      case 'department_assigned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSectionDisplayName = (section: string) => {
    const sectionMap: Record<string, string> = {
      'personal_details': 'Personal Details',
      'address_family_details': 'Address & Family Details',
      'program_selection': 'Program Selection',
      'education_details': 'Education Details',
      'declaration': 'Declaration',
      'payment_details': 'Payment Details',
      'application_status': 'Application Status'
    };
    return sectionMap[section] || section.replace('_', ' ');
  };


  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalCount)} of {totalCount} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-5 h-5 mr-2" />
          Audit Trail
          {totalCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalCount} entries
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && auditLogs.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            <span className="text-gray-600">Loading audit logs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No audit logs found</p>
            <p className="text-sm">Changes to this application will appear here</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {getSectionDisplayName(log.section)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {log.description}
                        </p>
                        
                        {/* Show additional details for status changes */}
                        {log.action === 'status_changed' && log.changes && (
                          <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {log.changes.status && (
                                <div>
                                  <span className="font-medium text-gray-700">Status:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-red-100 text-red-800 text-xs">
                                      {log.changes.status.from}
                                    </Badge>
                                    <span className="text-gray-400">→</span>
                                    <Badge className={`text-xs ${
                                      log.changes.status.to === 'approved' ? 'bg-green-100 text-green-800' :
                                      log.changes.status.to === 'rejected' ? 'bg-red-100 text-red-800' :
                                      log.changes.status.to === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                      log.changes.status.to === 'waitlisted' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {log.changes.status.to}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                              
                              {log.changes.adminRemarks && log.changes.adminRemarks.to && (
                                <div>
                                  <span className="font-medium text-gray-700">Admin Remarks:</span>
                                  <p className="text-gray-600 mt-1 text-xs bg-gray-50 p-2 rounded">
                                    {log.changes.adminRemarks.to}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Show approval details if status changed to approved */}
                            {log.changes.status?.to === 'approved' && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-green-700">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-xs font-medium">Application Approved</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                  <div className="flex items-center gap-4">
                                    <span><strong>Approved by:</strong> {log.editedBy.name} ({log.editedBy.role})</span>
                                    <span><strong>Email:</strong> {log.editedBy.email}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>{log.editedBy.name} ({log.editedBy.role})</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{log.formattedTimestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {renderPagination()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;