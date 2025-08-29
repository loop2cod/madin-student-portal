'use client';

import React from 'react';
import { PaymentHistoryView } from '@/components/PaymentHistoryView';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function PaymentHistoryPage() {
  return (
    <DashboardLayout title="Payment History" breadcrumbs={[{ title: 'Transaction History' }]}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Payment History</h1>
          <p className="text-purple-100">
            View all your fee payments, receipts, and transaction history
          </p>
        </div>

        <PaymentHistoryView />
      </div>
    </DashboardLayout>
  );
}