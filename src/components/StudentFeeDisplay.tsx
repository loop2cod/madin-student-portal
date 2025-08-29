import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { get } from '@/utilities/AxiosInterceptor';
import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { format } from 'date-fns';

interface FeeStructure {
  id: string;
  title: string;
  type: string;
  academicYear: string;
  description?: string;
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
  effectiveDate: string;
}

interface FeeAssignment {
  _id: string;
  student: {
    _id: string;
    name: string;
    admissionNumber: string;
    department: string;
  };
  feeStructure: {
    _id: string;
    title: string;
    type: string;
    academicYear: string;
  };
  feeStructureSnapshot: FeeStructure;
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
  assignedBy: {
    name: string;
    email: string;
  };
  assignedAt: string;
  notes?: string;
  isActive: boolean;
}

export const StudentFeeDisplay: React.FC = () => {
  const [feeAssignment, setFeeAssignment] = useState<FeeAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchFeeAssignment();
  }, []);

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

  const toggleSemesterExpansion = (semester: number) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }));
  };

  const getFeeTypeLabel = (feeType: string): string => {
    const labels: { [key: string]: string } = {
      admissionFee: 'Admission Fee',
      examPermitRegFee: 'Exam Permit/Reg Fee',
      specialFee: 'Special Fee',
      tuitionFee: 'Tuition Fee',
      others: 'Others'
    };
    return labels[feeType] || feeType;
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

  const hasCustomizations = (semester: number) => {
    return feeAssignment?.customizations?.some(c => c.semester === semester) || false;
  };

  const calculateTotalPayable = () => {
    if (!feeAssignment) return 0;
    return feeAssignment.feeStructureSnapshot.semesters.reduce((total, sem) => total + calculateEffectiveTotal(sem), 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Fee Structure
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
            Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={fetchFeeAssignment}
              className="text-blue-600 hover:underline text-sm"
            >
              Try again
            </button>
          </div>
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
            Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No fee structure has been assigned yet</p>
            <p className="text-sm mt-2">Please contact the admission office for more information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            My Fee Structure
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fee Structure Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Fee Structure Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-blue-800">Program</Label>
              <p className="text-sm text-blue-900">{feeAssignment.feeStructure.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Type</Label>
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                {feeAssignment.feeStructure.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Academic Year</Label>
              <p className="text-sm text-blue-900">{feeAssignment.feeStructure.academicYear}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Total Payable</Label>
              <p className="text-lg font-semibold text-blue-900">
                ₹{calculateTotalPayable().toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Assigned Date</Label>
              <p className="text-sm text-blue-900">
                {format(new Date(feeAssignment.assignedAt), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-800">Assigned By</Label>
              <p className="text-sm text-blue-900">{feeAssignment.assignedBy.name}</p>
            </div>
          </div>
          {feeAssignment.feeStructureSnapshot.description && (
            <div className="mt-3">
              <Label className="text-sm font-medium text-blue-800">Description</Label>
              <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded border">
                {feeAssignment.feeStructureSnapshot.description}
              </p>
            </div>
          )}
          {feeAssignment.notes && (
            <div className="mt-3">
              <Label className="text-sm font-medium text-blue-800">Notes</Label>
              <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded border">
                {feeAssignment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Semester-wise Fee Breakdown */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Semester-wise Fee Breakdown</h3>
          <div className="space-y-3">
            {feeAssignment.feeStructureSnapshot.semesters.map((semester) => (
              <Collapsible
                key={semester.semester}
                open={expandedSemesters[semester.semester]}
                onOpenChange={() => toggleSemesterExpansion(semester.semester)}
              >
                <Card className="border border-gray-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 py-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center space-x-2">
                          <span>{semester.semesterName}</span>
                          {hasCustomizations(semester.semester) && (
                            <Badge variant="secondary" className="text-xs">
                              Modified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-green-600">
                            ₹{calculateEffectiveTotal(semester).toLocaleString()}
                          </span>
                          {expandedSemesters[semester.semester] ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">Fee Type</th>
                              <th className="border border-gray-300 p-2 text-right text-sm font-medium">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(getEffectiveFees(semester)).map(([feeType, amount]:any) => {
                              const originalAmount = semester.fees[feeType as keyof typeof semester.fees];
                              const isCustomized = originalAmount !== amount;
                              
                              return (
                                <tr key={feeType} className={isCustomized ? "bg-yellow-50" : "hover:bg-gray-50"}>
                                  <td className="border border-gray-300 p-2 text-sm font-medium">
                                    <div className="flex items-center">
                                      {getFeeTypeLabel(feeType)}
                                      {isCustomized && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          Modified
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 p-2 text-right text-sm font-medium">
                                    <span className={isCustomized ? "text-orange-600" : ""}>
                                      ₹{amount.toLocaleString()}
                                    </span>
                                    {isCustomized && (
                                      <div className="text-xs text-gray-500">
                                        (Original: ₹{originalAmount.toLocaleString()})
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-gray-100 font-semibold">
                              <td className="border border-gray-300 p-2 text-sm">Total</td>
                              <td className="border border-gray-300 p-2 text-right text-sm">
                                ₹{calculateEffectiveTotal(semester).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Show customization details */}
                      {feeAssignment.customizations?.filter(c => c.semester === semester.semester).map((customization, index) => (
                        <div key={index} className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-yellow-800 flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                Fee Modification Details
                              </p>
                              <p className="text-xs text-yellow-700 flex items-center mt-1">
                                <User className="w-3 h-3 mr-1" />
                                Modified by {customization.customizedBy.name}
                              </p>
                              <p className="text-xs text-yellow-700 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(customization.customizedAt), 'dd/MM/yyyy hh:mm a')}
                              </p>
                            </div>
                          </div>
                          {customization.reason && (
                            <p className="text-sm text-yellow-800 mt-2">
                              <strong>Reason:</strong> {customization.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-900 mb-2">Fee Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-green-800">Number of Semesters</Label>
              <p className="text-lg font-semibold text-green-900">
                {feeAssignment.feeStructureSnapshot.semesters.length}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-green-800">Total Fee Amount</Label>
              <p className="text-lg font-semibold text-green-900">
                ₹{calculateTotalPayable().toLocaleString()}
              </p>
            </div>
            {feeAssignment.feeStructureSnapshot.hostelFee > 0 && (
              <div>
                <Label className="text-sm font-medium text-green-800">Hostel Fee</Label>
                <p className="text-lg font-semibold text-green-900">
                  ₹{feeAssignment.feeStructureSnapshot.hostelFee.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};