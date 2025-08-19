'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, File } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const documents = [
  {
    id: 1,
    name: 'Admission Letter',
    type: 'PDF',
    size: '2.1 MB',
    uploadDate: '20 Dec 2024',
    status: 'Available',
    icon: FileText,
    color: 'red'
  },
  {
    id: 2,
    name: 'Fee Structure',
    type: 'PDF',
    size: '1.5 MB',
    uploadDate: '20 Dec 2024',
    status: 'Available',
    icon: FileText,
    color: 'red'
  },
  {
    id: 3,
    name: 'Student ID Card',
    type: 'JPG',
    size: '0.8 MB',
    uploadDate: '22 Dec 2024',
    status: 'Available',
    icon: Image,
    color: 'blue'
  },
  {
    id: 4,
    name: 'Academic Calendar',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '18 Dec 2024',
    status: 'Available',
    icon: FileText,
    color: 'red'
  },
  {
    id: 5,
    name: 'Hostel Information',
    type: 'PDF',
    size: '1.9 MB',
    uploadDate: '15 Dec 2024',
    status: 'Pending',
    icon: FileText,
    color: 'red'
  }
];

export default function DocumentsPage() {
  const handleDownload = (document: any) => {
    // Handle document download
    console.log(`Downloading ${document.name}`);
  };

  return (
    <DashboardLayout 
      title="Documents"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Documents" }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Documents</h1>
              <p className="text-green-100">
                Download and manage your academic documents
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              {documents.filter(doc => doc.status === 'Available').length} Available
            </Badge>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-4">
          {documents.map((document) => {
            const IconComponent = document.icon;
            const isAvailable = document.status === 'Available';
            
            return (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-${document.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 text-${document.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{document.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{document.type}</span>
                          <span>{document.size}</span>
                          <span>Uploaded: {document.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={isAvailable ? "default" : "secondary"}
                        className={isAvailable ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {document.status}
                      </Badge>
                      
                      <Button
                        onClick={() => handleDownload(document)}
                        disabled={!isAvailable}
                        className="flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> All documents will be made available for download once they are processed by the administration. 
                  You will receive notifications when new documents are ready.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Document Types:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Admission Letters</li>
                    <li>• Fee Receipts</li>
                    <li>• ID Cards</li>
                    <li>• Academic Documents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Download Guidelines:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Documents are available 24/7</li>
                    <li>• Keep digital copies safe</li>
                    <li>• Contact support for issues</li>
                    <li>• Check regularly for updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}