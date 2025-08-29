'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';


interface CertificateRequestViewProps {
  request: any;
  onDownload: () => void;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
  approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  generated: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready for Download' },
  delivered: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Delivered' }
};

const certificateTypeLabels = {
  bonafide: 'Bonafide Certificate',
  fee_certificate: 'Fee Certificate',
  conduct_certificate: 'Conduct Certificate',
  transfer_certificate: 'Transfer Certificate'
};

export function CertificateRequestView({ request, onDownload }: CertificateRequestViewProps) {
  const statusInfo = statusConfig[request.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {certificateTypeLabels[request.certificateType as keyof typeof certificateTypeLabels]}
            </h2>
            <p className="text-sm text-gray-600">Request ID: {request.id}</p>
          </div>
        </div>
        
        <Badge className={statusInfo.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Purpose</label>
              <p className="font-semibold">{request.purpose}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Priority Level</label>
              <p className="font-semibold capitalize">{request.priorityLevel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Delivery Method</label>
              <p className="font-semibold capitalize">{request.deliveryMethod.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Request Date</label>
              <p className="font-semibold">{new Date(request.requestDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Academic Year</label>
              <p className="font-semibold">{request.academicYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Year</label>
              <p className="font-semibold">{request.currentYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Semester</label>
              <p className="font-semibold">{request.currentSemester}</p>
            </div>
          </div>

          {request.remarks && (
            <div>
              <label className="text-sm font-medium text-gray-500">Additional Remarks</label>
              <p className="font-semibold">{request.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Details (if applicable) */}
      {request.addressedTo && (
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Student Name</label>
                <p className="font-semibold">{request.addressedTo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relationship</label>
                <p className="font-semibold">{request.addressedTo.relationship}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Father&apos;s Name</label>
                <p className="font-semibold">{request.addressedTo.fatherName}</p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <div className="mt-2 text-sm">
                <p>{request.addressedTo.address.line1}</p>
                {request.addressedTo.address.line2 && <p>{request.addressedTo.address.line2}</p>}
                <p>{request.addressedTo.address.city}, {request.addressedTo.address.district}</p>
                <p>{request.addressedTo.address.state} - {request.addressedTo.address.pincode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Request Submitted</p>
                <p className="text-sm text-gray-500">{new Date(request.requestDate).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {request.processedDate && (
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  request.status === 'rejected' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {request.status === 'rejected' ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {request.status === 'rejected' ? 'Request Rejected' : 'Request Processed'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.processedDate).toLocaleString('en-IN')}
                    {request.processedBy && ` by ${request.processedBy.name}`}
                  </p>
                </div>
              </div>
            )}

            {request.status === 'generated' && (
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Download className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Certificate Generated</p>
                  <p className="text-sm text-gray-500">Ready for download</p>
                  {request.serialNumber && (
                    <p className="text-sm text-gray-500">Serial Number: {request.serialNumber}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Reason (if rejected) */}
      {request.status === 'rejected' && request.rejectionReason && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{request.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Download Button */}
      {request.status === 'generated' && (
        <div className="flex justify-end">
          <Button onClick={onDownload} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </Button>
        </div>
      )}
    </div>
  );
}