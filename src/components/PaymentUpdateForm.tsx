'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { put } from '@/utilities/AxiosInterceptor';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Edit3, Save, X, Check } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentDetails {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  receipt: string;
  updatedAt?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface PaymentUpdateFormProps {
  applicationId: string;
  paymentDetails: PaymentDetails | null;
  onPaymentUpdate: (updatedPayment: PaymentDetails) => void;
  canEdit: boolean;
}

export const PaymentUpdateForm: React.FC<PaymentUpdateFormProps> = ({
  applicationId,
  paymentDetails,
  onPaymentUpdate,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentStatus: paymentDetails?.status || 'pending',
    paymentMethod: paymentDetails?.paymentMethod || 'cash',
    amount: paymentDetails?.amount?.toString() || '500',
    receipt: paymentDetails?.receipt || ''
  });
  const { toast } = useToast();

  // Determine if payment is completed
  const isPaymentCompleted = paymentDetails?.status === 'completed';
  
  // Show form by default if payment is not completed, unless user is actively viewing details
  const shouldShowForm = !isPaymentCompleted && !isEditing;
  
  // Check if this is creating a new payment record
  const isCreatingNewPayment = !paymentDetails;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await put<any>(`/api/v1/admission/admin/${applicationId}/payment`, {
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        amount: parseFloat(formData.amount),
        receipt: formData.receipt
      });

      if (response.success) {
        onPaymentUpdate(response.data);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Payment details updated successfully',
        });
      } else {
        throw new Error(response.message || 'Failed to update payment details');
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      paymentStatus: paymentDetails?.status || 'pending',
      paymentMethod: paymentDetails?.paymentMethod || 'cash',
      amount: paymentDetails?.amount?.toString() || '500',
      receipt: paymentDetails?.receipt || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy hh:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3" />;
      case 'pending':
        return <CreditCard className="w-3 h-3" />;
      case 'failed':
        return <X className="w-3 h-3" />;
      default:
        return <CreditCard className="w-3 h-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            {isCreatingNewPayment ? 'Create Payment Details' : 
             isPaymentCompleted ? 'Payment Details' : 'Update Payment Details'}
          </div>
          {canEdit && isPaymentCompleted && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(isEditing || (shouldShowForm && canEdit) || (isCreatingNewPayment && canEdit)) ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isCreatingNewPayment && !isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>No payment record found.</strong> Please create payment details below.
                </p>
              </div>
            )}
            {shouldShowForm && !isEditing && !isCreatingNewPayment && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Payment Status:</strong> {paymentDetails?.status || 'Pending'} - Please update the payment details below.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="receipt">Receipt Number</Label>
                <Input
                  id="receipt"
                  value={formData.receipt}
                  onChange={(e) => setFormData(prev => ({ ...prev, receipt: e.target.value }))}
                  placeholder="Enter receipt number"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isCreatingNewPayment ? 'Creating...' : isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isCreatingNewPayment ? 'Create Payment' : isEditing ? 'Update Payment' : 'Save Payment Details'}
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (shouldShowForm && !canEdit) || (isCreatingNewPayment && !canEdit) ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Payment Status:</strong> {paymentDetails?.status || 'No payment record'}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              {isCreatingNewPayment ? 
                'Payment details need to be created. Please contact an administrator.' :
                'Payment details need to be updated. Please contact an administrator.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Amount</Label>
              <p className="text-sm text-gray-900">
                {paymentDetails?.currency} {paymentDetails?.amount}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(paymentDetails?.status || 'pending')} flex items-center gap-1 w-fit`}
              >
                {getStatusIcon(paymentDetails?.status || 'pending')}
                {paymentDetails?.status}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
              <p className="text-sm text-gray-900 capitalize">
                {paymentDetails?.paymentMethod?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Date</Label>
              <p className="text-sm text-gray-900">
                {paymentDetails?.updatedAt ? formatDate(paymentDetails.updatedAt) : paymentDetails?.createdAt ? formatDate(paymentDetails.createdAt) : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Receipt</Label>
              <p className="text-sm text-gray-900">
                {paymentDetails?.receipt || 'N/A'}
              </p>
            </div>
            {paymentDetails?.verifiedAt && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Verified At</Label>
                <p className="text-sm text-gray-900">
                  {formatDate(paymentDetails.verifiedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};