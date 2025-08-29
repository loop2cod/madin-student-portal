'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentFeeDisplay } from '@/components/StudentFeeDisplay';
import { StudentFeePayment } from '@/components/StudentFeePayment';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function FeePaymentPage() {
  return (
    <DashboardLayout title="Fee Payment" breadcrumbs={[{ title: 'Fee Management' }]}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Fee Management</h1>
          <p className="text-green-100">
            View your fee structure and make payments online or at the office
          </p>
        </div>

        <Tabs defaultValue="fee-structure" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fee-structure">My Fee Structure</TabsTrigger>
            <TabsTrigger value="make-payment">Make Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="fee-structure" className="space-y-6">
            <StudentFeeDisplay />
          </TabsContent>

          <TabsContent value="make-payment" className="space-y-6">
            <StudentFeePayment />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}