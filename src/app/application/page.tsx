'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function ApplicationStatusPage() {
  return (
    <DashboardLayout 
      title="Application Status"
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Application Status" }
      ]}
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Application Status</h1>
              <p className="text-green-100">
                Track your admission application progress
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </Badge>
          </div>
        </div>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Application Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Application ID</label>
                <p className="text-lg font-semibold">MAD/2024-25/APP/001</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Submission Date</label>
                <p className="text-lg font-semibold">15 Dec 2024</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Program Applied</label>
                <p className="text-lg font-semibold">Diploma in Computer Science</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Approved
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Approved</p>
                  <p className="text-sm text-gray-500">20 Dec 2024 - Your application has been approved</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Under Review</p>
                  <p className="text-sm text-gray-500">16 Dec 2024 - Application is being reviewed by admissions committee</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-gray-500">15 Dec 2024 - Application submitted successfully</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}