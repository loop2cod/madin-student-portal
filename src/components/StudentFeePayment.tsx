import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { get, post } from '@/utilities/AxiosInterceptor';
import { useToast } from '@/components/ui/use-toast';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Banknote,
  Globe,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FeeStructure {
  id: string;
  title: string;
  type: string;
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
}

interface FeeAssignment {
  _id: string;
  feeStructureSnapshot: FeeStructure;
  customizations: any[];
}

interface PaymentSummary {
  totalAmountDue: number;
  totalAmountPaid: number;
  totalOutstanding: number;
  completedPayments: number;
  pendingPayments: number;
}

interface FeePaymentStatus {
  feeAssignment: {
    _id: string;
    academicYear: string;
  };
  semesterPaymentStatus: Array<{
    semester: number;
    semesterName: string;
    fees: {
      admissionFee: number;
      examPermitRegFee: number;
      specialFee: number;
      tuitionFee: number;
      others: number;
    };
    feeTypePaid: {
      [feeType: string]: number;
    };
    feeTypeStatus: {
      [feeType: string]: 'unpaid' | 'partially_paid' | 'fully_paid';
    };
    remainingBalance: {
      [feeType: string]: number;
    };
    totalDue: number;
    totalPaid: number;
    outstanding: number;
    semesterStatus: 'unpaid' | 'partially_paid' | 'fully_paid';
    payments: Array<{
      _id: string;
      amountPaid: number;
      paymentDate: string;
      paymentMethod: string;
      feeBreakdown: Array<{
        feeType: string;
        amount: number;
      }>;
    }>;
  }>;
}

interface FeeBreakdown {
  feeType: string;
  amount: number;
}

export const StudentFeePayment: React.FC = () => {
  const [feeAssignment, setFeeAssignment] = useState<FeeAssignment | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [feePaymentStatus, setFeePaymentStatus] = useState<FeePaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Payment form state
  const [paymentType, setPaymentType] = useState<string>('semester_payment');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedFees, setSelectedFees] = useState<{ [key: string]: boolean }>({});
  const [customFeeBreakdown, setCustomFeeBreakdown] = useState<FeeBreakdown[]>([]);
  
  // Payment calculation state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [convenienceFee, setConvenienceFee] = useState<number>(0);
  const [totalAmountToPay, setTotalAmountToPay] = useState<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    fetchFeeAssignment();
    fetchPaymentSummary();
    fetchFeePaymentStatus();
  }, []);

  useEffect(() => {
    calculatePaymentAmount();
  }, [paymentType, selectedSemester, selectedFees, feeAssignment, feePaymentStatus]);

  const fetchFeeAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get<any>('/api/v1/auth/students/my-fee-structure');
      
      if (response.success) {
        setFeeAssignment(response.data);
      } else {
        setError(response.message || 'Failed to fetch fee structure');
      }
    } catch (error: any) {
      console.error('Error fetching fee structure:', error);
      setError(error.response?.data?.message || 'Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async () => {
    try {
      const response = await get<any>('/api/v1/student-payments/my-summary');
      if (response.success) {
        setPaymentSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
  };

  const fetchFeePaymentStatus = async () => {
    try {
      console.log('Fetching fee payment status...');
      const response = await get<any>('/api/v1/student-payments/my-fee-payment-status');
      if (response.success) {
        console.log('Fee payment status loaded:', response.data);
        setFeePaymentStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching fee payment status:', error);
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

  const calculateTotalPayable = () => {
    if (!feeAssignment) return 0;
    return feeAssignment.feeStructureSnapshot.semesters.reduce((total, sem) => total + calculateEffectiveTotal(sem), 0);
  };

  const getPaymentStatusForSemester = (semester: number) => {
    if (!feePaymentStatus) return null;
    return feePaymentStatus.semesterPaymentStatus.find(s => s.semester === semester);
  };

  const validatePartialPayment = () => {
    if (paymentType !== 'partial_payment' || !feePaymentStatus) return { isValid: true, message: '' };
    
    const semesterStatus = getPaymentStatusForSemester(selectedSemester);
    if (!semesterStatus) return { isValid: true, message: '' };

    const invalidSelections: string[] = [];
    Object.entries(selectedFees).forEach(([feeType, isSelected]) => {
      if (isSelected) {
        const feeStatus = semesterStatus.feeTypeStatus[feeType];
        const remainingBalance = semesterStatus.remainingBalance[feeType];
        
        if (feeStatus === 'fully_paid') {
          invalidSelections.push(getFeeTypeLabel(feeType) + ' (Already Paid)');
        } else if (remainingBalance <= 0) {
          invalidSelections.push(getFeeTypeLabel(feeType) + ' (No Balance Due)');
        }
      }
    });

    if (invalidSelections.length > 0) {
      return {
        isValid: false,
        message: `The following fees cannot be paid: ${invalidSelections.join(', ')}`
      };
    }

    return { isValid: true, message: '' };
  };

  const calculatePaymentAmount = () => {
    console.log('calculatePaymentAmount called:', {
      paymentType,
      selectedSemester,
      selectedFees,
      feeAssignmentExists: !!feeAssignment,
      feePaymentStatusExists: !!feePaymentStatus
    });
    
    if (!feeAssignment) return;

    let amount = 0;
    let breakdown: FeeBreakdown[] = [];
    const semesterStatus = getPaymentStatusForSemester(selectedSemester);
    
    console.log('semesterStatus for calculation:', semesterStatus);

    if (paymentType === 'full_payment') {
      // Calculate only unpaid portion for full payment
      if (feePaymentStatus) {
        feePaymentStatus.semesterPaymentStatus.forEach(semester => {
          amount += semester.outstanding;
          // Add breakdown for unpaid fees only
          const effectiveFees = getEffectiveFees(feeAssignment.feeStructureSnapshot.semesters.find(s => s.semester === semester.semester));
          Object.entries(effectiveFees).forEach(([feeType, feeAmount]) => {
            const remainingBalance = semester.remainingBalance[feeType] || 0;
            if (remainingBalance > 0) {
              const existingBreakdown:any = breakdown.find(b => b.feeType === feeType);
              if (existingBreakdown) {
                existingBreakdown.amount += remainingBalance;
              } else {
                breakdown.push({ feeType, amount: remainingBalance });
              }
            }
          });
        });
      } else {
        // Fallback to original calculation
        amount = calculateTotalPayable();
        feeAssignment.feeStructureSnapshot.semesters.forEach(semester => {
          const effectiveFees = getEffectiveFees(semester);
          Object.entries(effectiveFees).forEach(([feeType, feeAmount]:any) => {
            const existingBreakdown:any = breakdown.find(b => b.feeType === feeType);
            if (existingBreakdown) {
              existingBreakdown.amount += feeAmount;
            } else {
              breakdown.push({ feeType, amount: feeAmount });
            }
          });
        });
      }
    } else if (paymentType === 'semester_payment') {
      if (semesterStatus) {
        amount = semesterStatus.outstanding;
        // Add breakdown for unpaid fees only
        Object.entries(semesterStatus.remainingBalance).forEach(([feeType, remainingBalance]:any) => {
          if (remainingBalance > 0) {
            breakdown.push({ feeType, amount: remainingBalance });
          }
        });
      } else {
        // Fallback to original calculation
        const semester = feeAssignment.feeStructureSnapshot.semesters.find(s => s.semester === selectedSemester);
        if (semester) {
          amount = calculateEffectiveTotal(semester);
          const effectiveFees = getEffectiveFees(semester);
          Object.entries(effectiveFees).forEach(([feeType, feeAmount]:any) => {
            breakdown.push({ feeType, amount: feeAmount });
          });
        }
      }
    } else if (paymentType === 'partial_payment') {
      console.log('Partial payment calculation:', {
        semesterStatus,
        selectedFees,
        selectedSemester
      });
      
      if (semesterStatus) {
        console.log('Using semesterStatus for calculation');
        Object.entries(selectedFees).forEach(([feeType, isSelected]) => {
          if (isSelected) {
            const remainingBalance = semesterStatus.remainingBalance[feeType] || 0;
            console.log(`${feeType}: selected=${isSelected}, remainingBalance=${remainingBalance}`);
            if (remainingBalance > 0) {
              amount += remainingBalance;
              breakdown.push({ feeType, amount: remainingBalance });
            }
          }
        });
      } else {
        console.log('Using fallback calculation - semesterStatus not available');
        // Fallback to original calculation
        const semester = feeAssignment.feeStructureSnapshot.semesters.find(s => s.semester === selectedSemester);
        if (semester) {
          const effectiveFees = getEffectiveFees(semester);
          Object.entries(selectedFees).forEach(([feeType, isSelected]) => {
            if (isSelected && effectiveFees[feeType as keyof typeof effectiveFees]) {
              const feeAmount = effectiveFees[feeType as keyof typeof effectiveFees];
              console.log(`${feeType}: selected=${isSelected}, fullAmount=${feeAmount}`);
              amount += feeAmount;
              breakdown.push({ feeType, amount: feeAmount });
            }
          });
        }
      }
    } else if (paymentType === 'hostel_fee') {
      amount = feeAssignment.feeStructureSnapshot.hostelFee;
      breakdown = [{ feeType: 'hostelFee', amount }];
    }

    const convFee = Math.round(amount * 0.03); // 3% convenience fee
    const total = amount + convFee;

    console.log('Final calculation result:', {
      paymentType,
      baseAmount: amount,
      convenienceFee: convFee,
      totalAmount: total,
      breakdown
    });

    setPaymentAmount(amount);
    setConvenienceFee(convFee);
    setTotalAmountToPay(total);
    setCustomFeeBreakdown(breakdown);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    if (paymentAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please select fees to pay',
        variant: 'destructive',
      });
      return;
    }

    // Validate partial payments
    const validation = validatePartialPayment();
    if (!validation.isValid) {
      toast({
        title: 'Invalid Payment Selection',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }

    setPaymentLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create payment order
      const orderResponse = await post<any>('/api/v1/student-payments/online-payment/create-order', {
        paymentType,
        semester: paymentType === 'semester_payment' || paymentType === 'partial_payment' ? selectedSemester : undefined,
        feeBreakdown: customFeeBreakdown
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const { 
        paymentId, 
        razorpayOrderId, 
        amount,
        convenienceFee: convFee,
        totalAmount, 
        currency, 
        key_id, 
        student 
      } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: key_id,
        amount: totalAmount * 100, // Convert to paise
        currency: currency,
        name: 'Madin College',
        description: `Fee Payment - ${paymentType.replace('_', ' ').toUpperCase()}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await post<any>('/api/v1/student-payments/online-payment/verify', {
              paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              toast({
                title: 'Payment Successful',
                description: 'Your fee payment has been processed successfully',
              });
              
              // Refresh data
              fetchFeeAssignment();
              fetchPaymentSummary();
              fetchFeePaymentStatus();
              setShowPaymentDialog(false);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: error.message || 'Please contact support',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: student.name,
          email: student.email,
          contact: student.contact
        },
        notes: {
          paymentType,
          semester: selectedSemester?.toString() || 'N/A',
          originalAmount: amount.toString(),
          convenienceFee: convFee.toString()
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled by user',
              variant: 'destructive',
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fee Payment
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
            <CreditCard className="w-5 h-5 mr-2" />
            Fee Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!feeAssignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fee Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No fee structure has been assigned yet</p>
            <p className="text-sm mt-2">Please contact the admission office</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      {paymentSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(paymentSummary.totalAmountDue)}
                </p>
                <p className="text-sm text-gray-600">Total Due</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(paymentSummary.totalAmountPaid)}
                </p>
                <p className="text-sm text-gray-600">Total Paid</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(paymentSummary.totalOutstanding)}
                </p>
                <p className="text-sm text-gray-600">Outstanding</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">
                  {paymentSummary.pendingPayments}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Online Payment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Online Fee Payment
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              3% Convenience Fee Applied
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> A convenience fee of 3% will be added to online payments. 
              For zero convenience fee, you can pay at the college office.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label>Payment Type</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const totalOutstanding = feePaymentStatus?.semesterPaymentStatus.reduce((sum, sem) => sum + sem.outstanding, 0) || 0;
                    return (
                      <SelectItem value="full_payment">
                        Full Payment (All Semesters) 
                        {totalOutstanding === 0 && ' - Fully Paid'}
                        {totalOutstanding > 0 && ` - ${formatCurrency(totalOutstanding)} Due`}
                      </SelectItem>
                    );
                  })()}
                  <SelectItem value="semester_payment">Semester Payment</SelectItem>
                  <SelectItem value="partial_payment">Partial Payment</SelectItem>
                  {feeAssignment.feeStructureSnapshot.hostelFee > 0 && (
                    <SelectItem value="hostel_fee">Hostel Fee</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {(paymentType === 'semester_payment' || paymentType === 'partial_payment') && (
              <div>
                <Label>Select Semester</Label>
                <Select 
                  value={selectedSemester.toString()} 
                  onValueChange={(value) => setSelectedSemester(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeAssignment.feeStructureSnapshot.semesters.map(semester => {
                      const semesterStatus = getPaymentStatusForSemester(semester.semester);
                      return (
                        <SelectItem key={semester.semester} value={semester.semester.toString()}>
                          {semester.semesterName}
                          {semesterStatus && (
                            <>
                              {semesterStatus.semesterStatus === 'fully_paid' && ' - Fully Paid'}
                              {semesterStatus.semesterStatus === 'partially_paid' && ` - ${formatCurrency(semesterStatus.outstanding)} Due`}
                              {semesterStatus.semesterStatus === 'unpaid' && ` - ${formatCurrency(semesterStatus.totalDue)} Due`}
                            </>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentType === 'partial_payment' && (
              <div>
                <Label className="mb-3 block">Select Fees to Pay</Label>
                <div className="space-y-2">
                  {(() => {
                    const semester = feeAssignment.feeStructureSnapshot.semesters.find(s => s.semester === selectedSemester);
                    if (!semester) return null;

                    const effectiveFees = getEffectiveFees(semester);
                    const semesterStatus = getPaymentStatusForSemester(selectedSemester);
                    
                    return Object.entries(effectiveFees).map(([feeType, amount]:any) => {
                      const originalAmount = semester.fees[feeType as keyof typeof semester.fees];
                      const isCustomized = originalAmount !== amount;
                      
                      // Get payment status for this fee type
                      const feeStatus = semesterStatus?.feeTypeStatus[feeType] || 'unpaid';
                      const paidAmount = semesterStatus?.feeTypePaid[feeType] || 0;
                      const remainingBalance = semesterStatus?.remainingBalance[feeType] || amount;
                      const isFullyPaid = feeStatus === 'fully_paid';
                      const isPartiallyPaid = feeStatus === 'partially_paid';
                      
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'fully_paid': return 'bg-green-100 text-green-800';
                          case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
                          case 'unpaid': return 'bg-red-100 text-red-800';
                          default: return 'bg-gray-100 text-gray-800';
                        }
                      };
                      
                      return (
                        <div key={feeType} className={`border rounded-lg p-3 ${isFullyPaid ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={feeType}
                              checked={selectedFees[feeType] || false}
                              disabled={isFullyPaid}
                              onCheckedChange={(checked) => 
                                setSelectedFees(prev => ({ ...prev, [feeType]: !!checked }))
                              }
                            />
                            <Label htmlFor={feeType} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {getFeeTypeLabel(feeType)}
                                  {isCustomized && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Modified
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant="secondary" 
                                    className={`ml-2 text-xs ${getStatusColor(feeStatus)}`}
                                  >
                                    {feeStatus === 'fully_paid' && 'Paid'}
                                    {feeStatus === 'partially_paid' && 'Partial'}
                                    {feeStatus === 'unpaid' && 'Unpaid'}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <span className={`font-medium ${isCustomized ? 'text-orange-600' : ''}`}>
                                    {isFullyPaid 
                                      ? formatCurrency(amount) + ' (Paid)'
                                      : formatCurrency(Number(remainingBalance)) + ' Due'
                                    }
                                  </span>
                                  {isPartiallyPaid && (
                                    <div className="text-xs text-gray-500">
                                      Paid: {formatCurrency(Number(paidAmount))} / {formatCurrency(Number(amount))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isCustomized && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Original: {formatCurrency(originalAmount)}
                                </div>
                              )}
                              {isFullyPaid && (
                                <div className="text-xs text-green-600 mt-1">
                                  ✓ This fee has been fully paid
                                </div>
                              )}
                            </Label>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* Payment Status Summary for Partial Payment */}
                {(() => {
                  const semesterStatus = getPaymentStatusForSemester(selectedSemester);
                  if (!semesterStatus) return null;
                  
                  const hasAnyPayments = semesterStatus.totalPaid > 0;
                  if (!hasAnyPayments) return null;
                  
                  return (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Semester {selectedSemester} Payment Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Total Due:</span>
                          <span className="font-medium ml-2">{formatCurrency(semesterStatus.totalDue)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Total Paid:</span>
                          <span className="font-medium ml-2">{formatCurrency(semesterStatus.totalPaid)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Outstanding:</span>
                          <span className="font-medium ml-2">{formatCurrency(semesterStatus.outstanding)}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Status:</span>
                          <Badge 
                            variant="secondary" 
                            className={`ml-2 text-xs ${
                              semesterStatus.semesterStatus === 'fully_paid' 
                                ? 'bg-green-100 text-green-800'
                                : semesterStatus.semesterStatus === 'partially_paid'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {semesterStatus.semesterStatus === 'fully_paid' && 'Fully Paid'}
                            {semesterStatus.semesterStatus === 'partially_paid' && 'Partially Paid'}
                            {semesterStatus.semesterStatus === 'unpaid' && 'Unpaid'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <Separator />

            {/* Payment Calculation */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">Payment Calculation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span className="font-medium">{formatCurrency(paymentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee (3%):</span>
                  <span className="font-medium">{formatCurrency(convenienceFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount to Pay:</span>
                  <span className="text-blue-600">{formatCurrency(totalAmountToPay)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={paymentAmount <= 0 || paymentLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {paymentAmount <= 0 ? 'No Amount Due' : `Pay Online - ${formatCurrency(totalAmountToPay)}`}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Online Payment</DialogTitle>
                    <DialogDescription>
                      Please review your payment details before proceeding
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Secure Payment Gateway
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Your payment is processed through Razorpay&apos;s secure payment gateway. 
                            Your card details are never stored on our servers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Payment Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Payment Type:</span>
                          <Badge variant="outline">
                            {paymentType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {(paymentType === 'semester_payment' || paymentType === 'partial_payment') && (
                          <div className="flex justify-between">
                            <span>Semester:</span>
                            <span>{selectedSemester}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span>{formatCurrency(paymentAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Convenience Fee:</span>
                          <span>{formatCurrency(convenienceFee)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Amount:</span>
                          <span className="text-blue-600">{formatCurrency(totalAmountToPay)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={initiatePayment}
                        disabled={paymentLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Banknote className="w-4 h-4 mr-2" />
                            Proceed to Pay
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="flex-1">
                <Calculator className="w-4 h-4 mr-2" />
                Pay at Office (No Fee)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Banknote className="w-5 h-5 mr-2" />
            Office Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No Convenience Fee:</strong> You can pay your fees directly at the college office 
              during working hours (9:00 AM - 5:00 PM) without any additional charges. 
              Accepted payment methods include cash, DD, and cheque.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};