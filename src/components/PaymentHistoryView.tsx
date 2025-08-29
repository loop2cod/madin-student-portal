import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { get } from '@/utilities/AxiosInterceptor';
import {
  History,
  Download,
  Search,
  RefreshCw,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Banknote,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Payment {
  _id: string;
  paymentType: string;
  semester: number;
  totalAmountDue: number;
  amountPaid: number;
  convenienceFee: number;
  totalAmountCharged: number;
  remainingBalance: number;
  paymentMethod: string;
  paymentSource: string;
  paymentStatus: string;
  paymentDate: string;
  academicYear: string;
  notes?: string;
  razorpayDetails?: {
    orderId?: string;
    paymentId?: string;
    receipt?: string;
  };
  manualPaymentDetails?: {
    receiptNumber?: string;
    transactionId?: string;
    ddNumber?: string;
    chequeNumber?: string;
    bankName?: string;
    branchName?: string;
    depositDate?: string;
  };
  feeBreakdown: Array<{
    feeType: string;
    amount: number;
  }>;
  processedBy?: {
    name: string;
    email: string;
  };
  verifiedBy?: {
    name: string;
    email: string;
  };
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy?: {
      name: string;
    };
    reason?: string;
    notes?: string;
  }>;
}

interface PaymentSummary {
  totalAmountDue: number;
  totalAmountPaid: number;
  totalConvenienceFee: number;
  totalOutstanding: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface SemesterDue {
  semester: number;
  semesterName: string;
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  paymentStatus: 'fully_paid' | 'partially_paid' | 'unpaid';
  feeBreakdown: {
    admissionFee: number;
    examPermitRegFee: number;
    specialFee: number;
    tuitionFee: number;
    others: number;
  };
}

interface FeeAssignment {
  _id: string;
  feeStructureSnapshot: {
    academicYear: string;
    semesters: Array<{
      semester: number;
      semesterName: string;
      fees: {
        admissionFee: number;
        examPermitRegFee: number;
        specialFee: number;
        tuitionFee: number;
        others: number;
      };
      total: number;
    }>;
    grandTotal: number;
    hostelFee: number;
  };
  customizations: Array<{
    semester: number;
    fees: {
      admissionFee?: number;
      examPermitRegFee?: number;
      specialFee?: number;
      tuitionFee?: number;
      others?: number;
    };
    reason?: string;
    customizedBy: {
      name: string;
      email: string;
    };
    customizedAt: string;
  }>;
}

interface PaymentHistoryData {
  payments: Payment[];
  summary: PaymentSummary;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const PaymentHistoryView: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentHistoryData | null>(null);
  const [feeAssignment, setFeeAssignment] = useState<FeeAssignment | null>(null);
  const [semesterDues, setSemesterDues] = useState<SemesterDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPendingDues, setShowPendingDues] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [filters, setFilters] = useState({
    academicYear: '',
    paymentStatus: '',
    semester: '',
    paymentMethod: '',
    search: ''
  });

  useEffect(() => {
    fetchPaymentHistory();
    fetchFeeAssignment();
  }, [currentPage, filters]);

  useEffect(() => {
    if (feeAssignment && paymentData) {
      calculateSemesterDues();
    }
  }, [feeAssignment, paymentData]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await get<any>(
        `/api/v1/student-payments/my-history?${queryParams}`
      );

      if (response.success) {
        console.log('Payment history API response:', response.data);
        if (response.data.payments && response.data.payments.length > 0) {
          console.log('First payment object:', response.data.payments[0]);
          console.log('First payment keys:', Object.keys(response.data.payments[0]));
        }
        setPaymentData(response.data);
      } else {
        setError(response.message || 'Failed to fetch payment history');
      }
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      setError(error.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeAssignment = async () => {
    try {
      const response = await get<any>('/api/v1/auth/students/my-fee-structure');
      if (response.success) {
        setFeeAssignment(response.data);
      }
    } catch (error) {
      console.error('Error fetching fee assignment:', error);
    }
  };

  const getEffectiveFees = (semester: any) => {
    if (!feeAssignment) return semester.fees;
    
    const customization = feeAssignment.customizations?.find(c => c.semester === semester.semester);
    if (!customization) return semester.fees;

    const effectiveFees = { ...semester.fees };
    Object.keys(customization.fees).forEach(feeType => {
      if (customization.fees[feeType as keyof typeof customization.fees] !== undefined) {
        effectiveFees[feeType as keyof typeof effectiveFees] = customization.fees[feeType as keyof typeof customization.fees]!;
      }
    });

    return effectiveFees;
  };

  const calculateEffectiveTotal = (semester: any) => {
    const effectiveFees = getEffectiveFees(semester);
    return effectiveFees.admissionFee + 
           effectiveFees.examPermitRegFee + 
           effectiveFees.specialFee + 
           effectiveFees.tuitionFee + 
           effectiveFees.others;
  };

  const calculateSemesterDues = () => {
    if (!feeAssignment || !paymentData) return;

    const dues = feeAssignment.feeStructureSnapshot.semesters.map(semester => {
      const semesterPayments = paymentData.payments.filter(
        payment => payment.semester === semester.semester && payment.paymentStatus === 'completed'
      );
      
      const totalPaid = semesterPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
      const effectiveTotal = calculateEffectiveTotal(semester);
      const outstanding = Math.max(0, effectiveTotal - totalPaid);
      
      let paymentStatus: 'fully_paid' | 'partially_paid' | 'unpaid';
      if (totalPaid >= effectiveTotal) {
        paymentStatus = 'fully_paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      } else {
        paymentStatus = 'unpaid';
      }

      return {
        semester: semester.semester,
        semesterName: semester.semesterName,
        totalDue: effectiveTotal,
        totalPaid,
        outstanding,
        paymentStatus,
        feeBreakdown: getEffectiveFees(semester)
      };
    });

    setSemesterDues(dues);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      academicYear: '',
      paymentStatus: '',
      semester: '',
      paymentMethod: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'partial_refund':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'processing':
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <CreditCard className="w-3 h-3" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'razorpay_online':
        return <CreditCard className="w-4 h-4" />;
      case 'cash_office':
        return <Banknote className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFeeTypeLabel = (feeType: string): string => {
    const labels: { [key: string]: string } = {
      admissionFee: 'Admission Fee',
      examPermitRegFee: 'Exam Permit/Reg Fee',
      specialFee: 'Special Fee',
      tuitionFee: 'Tuition Fee',
      others: 'Others',
      hostelFee: 'Hostel Fee'
    };
    return labels[feeType] || feeType;
  };

  const getPaymentId = (payment: any): string | null => {
    // Try different possible field names for payment ID
    return payment?._id || payment?.id || payment?.paymentId || null;
  };

  const downloadReceipt = async (paymentId: string) => {
    if (!paymentId || paymentId === 'undefined' || paymentId === 'null') {
      console.error('Invalid payment ID for receipt download:', paymentId);
      return;
    }
    
    try {
      const response = await get<Blob>(
        `/api/v1/student-payments/${paymentId}/receipt`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(response as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };


  const getUnpaidSemesters = () => {
    return semesterDues.filter(due => due.outstanding > 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-300" />
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={fetchPaymentHistory} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Status Section */}
      {semesterDues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Fee Status by Semester
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPendingDues(!showPendingDues)}
              >
                {showPendingDues ? 'Hide' : 'Show'} Details
              </Button>
            </CardTitle>
          </CardHeader>
          {showPendingDues && (
            <CardContent>
              <div className="space-y-4">
                {semesterDues.map(due => (
                  <div key={due.semester} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{due.semesterName}</h3>
                        <p className="text-sm text-gray-600">
                          Outstanding: {formatCurrency(due.outstanding)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={
                            due.paymentStatus === 'unpaid' 
                              ? 'bg-red-100 text-red-800'
                              : due.paymentStatus === 'partially_paid'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }
                        >
                          {due.paymentStatus === 'unpaid' && 'Unpaid'}
                          {due.paymentStatus === 'partially_paid' && 'Partially Paid'}
                          {due.paymentStatus === 'fully_paid' && 'Fully Paid'}
                        </Badge>
                        {due.outstanding > 0 && (
                          <span className="text-sm text-gray-600">
                            {formatCurrency(due.outstanding)} remaining
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Fee Breakdown */}
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fee Breakdown:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(due.feeBreakdown).map(([feeType, amount]) => {
                          if (amount === 0) return null;
                          return (
                            <div key={feeType} className="flex justify-between p-2 bg-gray-50 rounded">
                              <span>{getFeeTypeLabel(feeType)}:</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Total Due:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(due.totalDue)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Total Paid:</span>
                          <span>{formatCurrency(due.totalPaid)}</span>
                        </div>
                        {due.outstanding > 0 && (
                          <div className="flex justify-between text-orange-600 font-medium">
                            <span>Outstanding:</span>
                            <span>{formatCurrency(due.outstanding)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
      {/* Payment Summary */}
      {paymentData?.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(paymentData.summary.totalAmountPaid)}
                </p>
                <p className="text-sm text-gray-600">Total Paid</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(paymentData.summary.totalOutstanding)}
                </p>
                <p className="text-sm text-gray-600">Outstanding</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {paymentData.summary.completedPayments}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(paymentData.summary.totalConvenienceFee)}
                </p>
                <p className="text-sm text-gray-600">Convenience Fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment History</span>
            <Button onClick={fetchPaymentHistory} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Receipt, Transaction ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select
                value={filters.academicYear}
                onValueChange={(value) => handleFilterChange('academicYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2022-23">2022-23</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentStatus">Status</Label>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) => handleFilterChange('paymentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={filters.semester}
                onValueChange={(value) => handleFilterChange('semester', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesterDues.length > 0 ? (
                    semesterDues.map(due => (
                      <SelectItem key={due.semester} value={due.semester.toString()}>
                        {due.semesterName} 
                        {due.paymentStatus !== 'fully_paid' && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {due.paymentStatus === 'unpaid' ? 'Unpaid' : 'Partial'}
                          </Badge>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Method</Label>
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => handleFilterChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="razorpay_online">Online</SelectItem>
                  <SelectItem value="cash_office">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="dd">Demand Draft</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      <Card>
        <CardContent className="p-0">
          {paymentData?.payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No payment records found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {paymentData?.payments.map((payment) => (
                <div key={payment._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">
                            {payment.paymentType.replace('_', ' ').toUpperCase()}
                          </h3>
                          {payment.semester && (
                            <Badge variant="outline" className="text-xs">
                              Semester {payment.semester}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                          </span>
                          
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(payment.paymentStatus)} flex items-center gap-1 text-xs`}
                          >
                            {getStatusIcon(payment.paymentStatus)}
                            {payment.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(payment.totalAmountCharged)}
                      </div>
                      {payment.convenienceFee > 0 && (
                        <div className="text-xs text-gray-500">
                          (Base: {formatCurrency(payment.amountPaid)} + Fee: {formatCurrency(payment.convenienceFee)})
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-2">
                        <Dialog 
                          open={showDetailsDialog && selectedPayment?._id === payment._id} 
                          onOpenChange={(open) => {
                            setShowDetailsDialog(open);
                            if (!open) setSelectedPayment(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            
                            {selectedPayment && (
                              <div className="space-y-6">
                                {/* Payment Overview */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Payment ID</Label>
                                    <p className="font-mono text-sm">{selectedPayment._id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                                    <p>{format(new Date(selectedPayment.paymentDate), 'dd MMMM yyyy, hh:mm a')}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                                    <p>{selectedPayment.academicYear}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                                    <Badge 
                                      variant="secondary" 
                                      className={`${getStatusColor(selectedPayment.paymentStatus)} flex items-center gap-1 w-fit`}
                                    >
                                      {getStatusIcon(selectedPayment.paymentStatus)}
                                      {selectedPayment.paymentStatus.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Amount Details */}
                                <div>
                                  <h3 className="font-medium mb-3">Amount Details</h3>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Base Amount:</span>
                                        <span className="font-medium">{formatCurrency(selectedPayment.amountPaid)}</span>
                                      </div>
                                      {selectedPayment.convenienceFee > 0 && (
                                        <div className="flex justify-between">
                                          <span>Convenience Fee:</span>
                                          <span className="font-medium">{formatCurrency(selectedPayment.convenienceFee)}</span>
                                        </div>
                                      )}
                                      <div className="border-t pt-2 flex justify-between font-bold">
                                        <span>Total Charged:</span>
                                        <span>{formatCurrency(selectedPayment.totalAmountCharged)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Fee Breakdown */}
                                {selectedPayment.feeBreakdown.length > 0 && (
                                  <div>
                                    <h3 className="font-medium mb-3">Fee Breakdown</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="text-left p-3 text-sm font-medium">Fee Type</th>
                                            <th className="text-right p-3 text-sm font-medium">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {selectedPayment.feeBreakdown.map((fee, index) => (
                                            <tr key={index} className="border-t">
                                              <td className="p-3">{getFeeTypeLabel(fee.feeType)}</td>
                                              <td className="p-3 text-right font-medium">{formatCurrency(fee.amount)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Payment Method Details */}
                                <div>
                                  <h3 className="font-medium mb-3">Payment Method Details</h3>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Method</Label>
                                      <p className="capitalize">{selectedPayment.paymentMethod.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Source</Label>
                                      <p className="capitalize">{selectedPayment.paymentSource.replace('_', ' ')}</p>
                                    </div>
                                    
                                    {selectedPayment.razorpayDetails && (
                                      <>
                                        {selectedPayment.razorpayDetails.paymentId && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Razorpay Payment ID</Label>
                                            <p className="font-mono text-sm">{selectedPayment.razorpayDetails.paymentId}</p>
                                          </div>
                                        )}
                                        {selectedPayment.razorpayDetails.orderId && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Order ID</Label>
                                            <p className="font-mono text-sm">{selectedPayment.razorpayDetails.orderId}</p>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {selectedPayment.manualPaymentDetails && (
                                      <>
                                        {selectedPayment.manualPaymentDetails.receiptNumber && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Receipt Number</Label>
                                            <p>{selectedPayment.manualPaymentDetails.receiptNumber}</p>
                                          </div>
                                        )}
                                        {selectedPayment.manualPaymentDetails.transactionId && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Transaction ID</Label>
                                            <p className="font-mono text-sm">{selectedPayment.manualPaymentDetails.transactionId}</p>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                {selectedPayment.notes && (
                                  <div>
                                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                    <p className="mt-1 p-3 bg-gray-50 rounded">{selectedPayment.notes}</p>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      console.log('Selected payment object:', selectedPayment);
                                      console.log('Available keys:', selectedPayment ? Object.keys(selectedPayment) : 'none');
                                      
                                      const paymentId = getPaymentId(selectedPayment);
                                      
                                      if (paymentId) {
                                        downloadReceipt(paymentId);
                                      } else {
                                        console.error('No payment ID available for receipt download', selectedPayment);
                                      }
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Receipt
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {payment.paymentStatus === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              console.log('Payment object:', payment);
                              console.log('Available keys:', Object.keys(payment));
                              
                              const paymentId = getPaymentId(payment);
                              console.log('Extracted payment ID:', paymentId);
                              
                              if (paymentId) {
                                downloadReceipt(paymentId);
                              } else {
                                console.error('No payment ID available for receipt download', payment);
                              }
                            }}
                            disabled={!getPaymentId(payment)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                        
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {paymentData?.pagination && paymentData.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((paymentData.pagination.currentPage - 1) * 10) + 1} to {Math.min(paymentData.pagination.currentPage * 10, paymentData.pagination.totalRecords)} of {paymentData.pagination.totalRecords} payments
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paymentData.pagination.hasPrev}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, paymentData.pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(paymentData.pagination.currentPage - 2 + i, paymentData.pagination.totalPages - 4 + i));
                    return (
                      <Button
                        key={pageNum}
                        variant={paymentData.pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paymentData.pagination.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};