'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, File } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

const documents = [
  {
    id: 3,
    name: 'Student ID Card',
    type: 'JPG',
    size: '0.8 MB',
    uploadDate: '22 Dec 2024',
    status: 'Available',
    icon: Image,
    color: 'blue'
  }
];

export default function DocumentsPage() {
  const handleDownload = (document: any) => {
    // Handle document download
    // TODO: Implement document download functionality
  };

  return (
    <DashboardLayout 
      title="Documents"
    >
      <div className="space-y-4 p-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">My Documents</h1>
              <p className="text-green-100 text-sm sm:text-base">
                Download your Student ID Card
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white self-start sm:self-auto">
              {documents.filter(doc => doc.status === 'Available').length} Available
            </Badge>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-3">
          {documents.map((document) => {
            const IconComponent = document.icon;
            const isAvailable = document.status === 'Available';

            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${document.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 text-${document.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{document.name}</h3>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{document.uploadDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleDownload(document)}
                        disabled={!isAvailable}
                        size="sm"
                        className="h-8 px-3"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span className="text-xs">Download</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}