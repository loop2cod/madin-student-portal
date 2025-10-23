'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CertificateRequestForm } from '@/components/certificates/CertificateRequestForm';
import { CertificateRequestView } from '@/components/certificates/CertificateRequestView';
import { get, downloadFile } from '@/utilities/AxiosInterceptor';
import { toast } from '@/components/ui/use-toast';

interface CertificateRequest {
  id: string;
  certificateType: string;
  purpose: string;
  status: string;
  requestDate: string;
  processedDate?: string;
  serialNumber?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  generatedCertificatePath?: string;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  generated: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
  delivered: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Delivered' }
};

const certificateTypeLabels = {
  bonafide: 'Bonafide Certificate',
  fee_certificate: 'Fee Certificate',
  medium_of_instruction: 'Medium of Instruction Certificate',
  letter_of_recommendation: 'Letter of Recommendation',
  course_conduct_certificate: 'Course and Conduct Certificate',
  conduct_certificate: 'Conduct Certificate',
  transfer_certificate: 'Transfer Certificate'
};

export default function CertificatesPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRequestView, setShowRequestView] = useState(false);

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      const response = await get<{ success: boolean; data: CertificateRequest[] }>('/api/v1/certificates/my-requests');
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmitted = () => {
    setShowRequestForm(false);
    fetchCertificateRequests();
    toast({
      title: "Success",
      description: "Certificate request submitted successfully",
    });
  };

  const handleDownload = async (request: CertificateRequest) => {
    try {
      const certificateTypes = {
        bonafide: 'Bonafide_Certificate',
        fee_certificate: 'Fee_Certificate',
        medium_of_instruction: 'Medium_of_Instruction_Certificate',
        letter_of_recommendation: 'Letter_of_Recommendation',
        course_conduct_certificate: 'Course_and_Conduct_Certificate',
        conduct_certificate: 'Conduct_Certificate',
        transfer_certificate: 'Transfer_Certificate'
      };
      
      const filename = `${certificateTypes[request.certificateType as keyof typeof certificateTypes] || request.certificateType}_${Date.now()}.pdf`;
      
      await downloadFile(`/api/v1/certificates/download/${request.id}`, filename);
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewRequest = (request: CertificateRequest) => {
    setSelectedRequest(request);
    setShowRequestView(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="Certificates">
        <div className="flex items-center justify-center min-h-48">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="My Requests"
    >
      <div className="space-y-4 p-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Requests</h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Request and download your academic requests
              </p>
            </div>
            <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 h-8 px-3">
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="text-sm">New Request</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Request Certificate</DialogTitle>
                </DialogHeader>
                <CertificateRequestForm onRequestSubmitted={handleRequestSubmitted} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total</p>
                  <p className="text-lg font-bold">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Pending</p>
                  <p className="text-lg font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Ready</p>
                  <p className="text-lg font-bold">{requests.filter(r => r.status === 'generated').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <Download className="w-6 h-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Delivered</p>
                  <p className="text-lg font-bold">{requests.filter(r => r.status === 'delivered').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No requests</h3>
                <p className="text-gray-500 mb-4 text-sm">You haven&apos;t requested any certificates yet.</p>
                <Button onClick={() => setShowRequestForm(true)} size="sm">
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="text-sm">Request Certificate</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => {
              const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base truncate">
                            {certificateTypeLabels[request.certificateType as keyof typeof certificateTypeLabels]}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1 truncate">Purpose: {request.purpose}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span>Requested: {new Date(request.requestDate).toLocaleDateString('en-IN')}</span>
                            {request.processedDate && (
                              <span>Processed: {new Date(request.processedDate).toLocaleDateString('en-IN')}</span>
                            )}
                            {request.serialNumber && (
                              <span>Serial: {request.serialNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <Badge className={`${statusInfo.color} text-xs`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequest(request)}
                          className="h-8 px-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span className="text-xs">View</span>
                        </Button>

                        {request.status === 'generated' && (
                          <Button
                            onClick={() => handleDownload(request)}
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            <span className="text-xs">Download</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* View Request Dialog */}
        <Dialog open={showRequestView} onOpenChange={setShowRequestView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Certificate Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <CertificateRequestView 
                request={selectedRequest} 
                onDownload={() => handleDownload(selectedRequest)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}