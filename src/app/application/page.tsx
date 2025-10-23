'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { get } from '@/utilities/AxiosInterceptor';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  GraduationCap,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Home,
  Users,
  BookOpen
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { format } from 'date-fns';

interface PersonalDetails {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dob: string;
  gender: string;
  religion: string;
  email: string;
}

interface AddressFamilyDetails {
  address: {
    houseNumber: string;
    street: string;
    postOffice: string;
    pinCode: string;
    district: string;
    state: string;
    country: string;
  };
  parents: {
    fatherName: string;
    fatherMobile: string;
    motherName: string;
    motherMobile: string;
  };
  guardian: {
    guardianName: string;
    guardianPlace: string;
    guardianContact: string;
  };
}

interface ProgramSelection {
  programLevel: string;
  programName: string;
  mode: string;
  specialization?: string;
  branchPreferences: Array<{
    branch: string;
    priority: number;
    _id: string;
  }>;
  selected: boolean;
  priority: number;
  _id: string;
}

interface PaymentDetails {
  application_fee: {
    _id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    receipt: string;
    verifiedAt?: string;
    createdAt: string;
  };
}

interface ApplicationData {
  _id: string;
  applicationId: string;
  mobile: string;
  personalDetails: PersonalDetails;
  addressFamilyDetails: AddressFamilyDetails;
  programSelections: ProgramSelection[];
  paymentDetails?: PaymentDetails;
  declaration?: {
    agreed: boolean;
    digitalSignature?: string;
    agreedAt?: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  adminRemarks?: string;
  admissionNumber?: string;
  department?: string;
  educationDetails?: any;
}

export default function ApplicationPage() {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get<any>('/api/v1/auth/student/profile');
      
      if (response.success) {
        setApplicationData(response.data);
      } else {
        setError(response.message || 'Failed to fetch application data');
      }
    } catch (error: any) {
      console.error('Error fetching application data:', error);
      setError(error.response?.data?.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy hh:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'waitlisted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'waitlisted':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Application Approved';
      case 'rejected':
        return 'Application Rejected';
      case 'under_review':
        return 'Under Review';
      case 'waitlisted':
        return 'Waitlisted';
      case 'pending':
        return 'Application Submitted';
      default:
        return 'Application Status';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'approved':
        return 'from-green-600 to-emerald-600';
      case 'rejected':
        return 'from-red-600 to-pink-600';
      case 'under_review':
        return 'from-yellow-600 to-orange-600';
      case 'waitlisted':
        return 'from-blue-600 to-indigo-600';
      case 'pending':
        return 'from-gray-600 to-slate-600';
      default:
        return 'from-gray-600 to-slate-600';
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Application Details"
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title="Application Details"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Application</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchApplicationData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!applicationData) {
    return (
      <DashboardLayout 
        title="Application Details"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Found</h3>
            <p className="text-gray-600">No application data is available for your account.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Application Details"
    >
      <div className="space-y-6 p-2">
        {/* Status Overview */}
        <div className={`bg-gradient-to-r ${getStatusGradient(applicationData.status)} rounded-lg p-4 sm:p-6 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{getStatusTitle(applicationData.status)}</h1>
              <p className="opacity-90 text-sm sm:text-base">
                Application ID: {applicationData.applicationId}
              </p>
              {applicationData.admissionNumber && (
                <p className="opacity-90 font-medium text-sm sm:text-base">
                  Admission Number: {applicationData.admissionNumber}
                </p>
              )}
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white self-start sm:self-auto">
              {getStatusIcon(applicationData.status)}
              <span className="ml-2">{applicationData.status.toUpperCase()}</span>
            </Badge>
          </div>
        </div>

        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Application Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Application ID</Label>
                <p className="text-base font-semibold">{applicationData.applicationId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Submission Date</Label>
                <p className="text-base font-semibold">{formatDate(applicationData.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                <p className="text-base font-semibold">{formatDate(applicationData.updatedAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                <Badge className={getStatusColor(applicationData.status)}>
                  {getStatusIcon(applicationData.status)}
                  <span className="ml-1">{applicationData.status.toUpperCase()}</span>
                </Badge>
              </div>
              {applicationData.department && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <p className="text-base font-semibold">{applicationData.department}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                <p className="text-base font-semibold">{applicationData.mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <p className="text-base font-semibold">
                  {applicationData.personalDetails.fullName ||
                   `${applicationData.personalDetails.firstName} ${applicationData.personalDetails.lastName}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <p className="text-base font-semibold">{formatDate(applicationData.personalDetails.dob)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Gender</Label>
                <p className="text-base font-semibold capitalize">{applicationData.personalDetails.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Religion</Label>
                <p className="text-base font-semibold capitalize">{applicationData.personalDetails.religion}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-base font-semibold">{applicationData.personalDetails.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Family Details */}
        {applicationData.addressFamilyDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Address & Family Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address */}
              <div className="p-4 rounded-lg border bg-gray-50">
                <h3 className="font-medium mb-3 flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Residential Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">House Number</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.houseNumber || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Street</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.street || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Post Office</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.postOffice || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pin Code</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.pinCode || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">District</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.district || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State</Label>
                    <p className="text-sm">{applicationData.addressFamilyDetails.address?.state || '-'}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border">
                  <Label className="text-sm font-medium">Complete Address</Label>
                  <p className="text-sm mt-1">
                    {[
                      applicationData.addressFamilyDetails.address?.houseNumber,
                      applicationData.addressFamilyDetails.address?.street,
                      applicationData.addressFamilyDetails.address?.postOffice,
                      applicationData.addressFamilyDetails.address?.district,
                      applicationData.addressFamilyDetails.address?.state,
                      applicationData.addressFamilyDetails.address?.pinCode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Parents Details */}
              <div className="p-4 rounded-lg border bg-gray-50">
                <h3 className="font-medium mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Parents Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-3 bg-white rounded border">
                    <h4 className="font-medium mb-2">Father&apos;s Information</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{applicationData.addressFamilyDetails.parents?.fatherName || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Mobile</Label>
                        <p className="text-sm flex items-center">
                          {applicationData.addressFamilyDetails.parents?.fatherMobile && (
                            <Phone className="w-3 h-3 mr-1" />
                          )}
                          {applicationData.addressFamilyDetails.parents?.fatherMobile || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded border">
                    <h4 className="font-medium mb-2">Mother&apos;s Information</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{applicationData.addressFamilyDetails.parents?.motherName || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Mobile</Label>
                        <p className="text-sm flex items-center">
                          {applicationData.addressFamilyDetails.parents?.motherMobile && (
                            <Phone className="w-3 h-3 mr-1" />
                          )}
                          {applicationData.addressFamilyDetails.parents?.motherMobile || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Details */}
              {(applicationData.addressFamilyDetails.guardian?.guardianName || 
                applicationData.addressFamilyDetails.guardian?.guardianPlace || 
                applicationData.addressFamilyDetails.guardian?.guardianContact) && (
                <div className="p-4 rounded-lg border bg-gray-50">
                  <h3 className="font-medium mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Guardian Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm">{applicationData.addressFamilyDetails.guardian?.guardianName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Place</Label>
                      <p className="text-sm">{applicationData.addressFamilyDetails.guardian?.guardianPlace || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Contact</Label>
                      <p className="text-sm flex items-center">
                        {applicationData.addressFamilyDetails.guardian?.guardianContact && (
                          <Phone className="w-3 h-3 mr-1" />
                        )}
                        {applicationData.addressFamilyDetails.guardian?.guardianContact || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Program Selection */}
        {applicationData.programSelections && applicationData.programSelections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Program Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicationData.programSelections.map((program, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      program.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{program.programName}</p>
                        <p className="text-sm text-gray-600">Level: {program.programLevel}</p>
                      </div>
                      {program.selected && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Selected
                        </Badge>
                      )}
                    </div>
                    {program.mode && (
                      <p className="text-sm text-gray-600 mb-2">Mode: {program.mode}</p>
                    )}
                    {program.specialization && (
                      <p className="text-sm text-gray-600 mb-2">Specialization: {program.specialization}</p>
                    )}
                    {program.branchPreferences && program.branchPreferences.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Branch Preferences:</p>
                        <div className="flex flex-wrap gap-2">
                          {program.branchPreferences
                            .sort((a, b) => a.priority - b.priority)
                            .map((branch) => (
                              <Badge key={branch._id} variant="outline" className="text-xs">
                                {branch.priority}. {branch.branch}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Details */}
        {applicationData.paymentDetails?.application_fee && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-green-800">Amount</Label>
                    <p className="text-lg font-semibold text-green-900">
                      ₹{applicationData.paymentDetails.application_fee.amount} {applicationData.paymentDetails.application_fee.currency}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-green-800">Status</Label>
                    <Badge variant={applicationData.paymentDetails.application_fee.status === 'verified' ? 'default' : 'secondary'}>
                      {applicationData.paymentDetails.application_fee.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-green-800">Payment Method</Label>
                    <p className="text-sm text-green-900">{applicationData.paymentDetails.application_fee.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-green-800">Receipt</Label>
                    <p className="text-sm text-green-900">{applicationData.paymentDetails.application_fee.receipt}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-green-800">Payment Date</Label>
                    <p className="text-sm text-green-900">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {formatDate(applicationData.paymentDetails.application_fee.createdAt)}
                    </p>
                  </div>
                  {applicationData.paymentDetails.application_fee.verifiedAt && (
                    <div>
                      <Label className="text-sm font-medium text-green-800">Verified Date</Label>
                      <p className="text-sm text-green-900">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        {formatDate(applicationData.paymentDetails.application_fee.verifiedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Declaration */}
        {applicationData.declaration?.agreed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Declaration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-blue-900">Declaration Accepted</span>
                </div>
                {applicationData.declaration.agreedAt && (
                  <p className="text-sm text-blue-800 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Agreed on: {formatDateTime(applicationData.declaration.agreedAt)}
                  </p>
                )}
                {applicationData.declaration.digitalSignature && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium text-blue-800">Digital Signature</Label>
                    <p className="text-sm text-blue-900 bg-blue-100 p-2 rounded border mt-1">
                      {applicationData.declaration.digitalSignature}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Details */}
        <Card className="rounded-none border-secondary/20">
          <CardHeader className="px-3 sm:px-4 py-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Education Details ({applicationData.educationDetails?.programDetails?.programLevel?.toUpperCase() || 'N/A'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 pb-4">
            {applicationData.educationDetails ? (
              <>
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-3 border rounded-lg">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 uppercase tracking-wide">Education Qualifications</h3>
                  <p className="text-xs text-gray-600">
                    Academic qualifications for {applicationData.educationDetails?.programDetails?.programName || 'this program'} admission.
                  </p>
                </div>

                {/* Education Cards */}
                <div className="space-y-3">
                  {applicationData.educationDetails?.educationData?.map((education:any, index:number) => (
                    <Card key={education._id || index} className={`transition-all duration-200 ${
                      education.examination === 'SSLC/THSLC/CBSE' || education.examination === '+2/VHSE' || education.examination === 'Degree'
                        ? 'ring-2 ring-red-100 border-red-200 bg-red-50/30'
                        : 'border-gray-200'
                    }`}>
                      <CardHeader className="pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-2">
                          <CardTitle className="text-xs sm:text-sm font-semibold flex flex-wrap items-center gap-2">
                            <span className="bg-blue-100 text-blue-900 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="break-words text-xs sm:text-sm">{education.examination}</span>
                            {(education.examination === 'SSLC/THSLC/CBSE' || education.examination === '+2/VHSE' || education.examination === 'Degree') && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0 px-1.5 py-0.5">
                                Required
                              </Badge>
                            )}
                          </CardTitle>

                          {/* Status Badge */}
                          <div className="flex justify-start sm:justify-end">
                            <Badge variant="default" className={`text-xs px-2 py-1 ${
                              education.passedFailed === 'Passed'
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }`}>
                              {education.passedFailed === 'Passed' ? '✓' : '✗'} {education.passedFailed}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4">
                        {/* Form Grid - Responsive */}
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">

                          {/* Group/Subject - Not for SSLC */}
                          {education.examination !== "SSLC/THSLC/CBSE" && (education.groupTrade || education.groupSubject) && (
                            <div className="bg-gray-50 p-2 rounded">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {education.examination === "Degree" ? "Subject" : "Group"}
                              </Label>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">{education.groupTrade || education.groupSubject}</p>
                            </div>
                          )}

                          {/* Year of Pass */}
                          {education.yearOfPass && (
                            <div className="bg-gray-50 p-2 rounded">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Year</Label>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">{education.yearOfPass}</p>
                            </div>
                          )}

                          {/* Percentage */}
                          {education.percentageMarks && (
                            <div className="bg-gray-50 p-2 rounded">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Percentage</Label>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">{education.percentageMarks}%</p>
                            </div>
                          )}

                          {/* Registration Number for all programs */}
                          <div className="bg-gray-50 p-2 rounded">
                            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reg. No.</Label>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1 break-all">{education.registrationNumber || 'N/A'}</p>
                          </div>

                          {/* Board/University for MBA programs */}
                          {education.boardUniversity && (
                            <div className="bg-gray-50 p-2 rounded">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Board/University</Label>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1 break-all">{education.boardUniversity}</p>
                            </div>
                          )}

                          {/* Subject Marks for specific examinations */}
                          {(education.english || education.physics || education.chemistry || education.maths) && (
                            <div className="col-span-full">
                              <Label className="text-xs font-medium text-gray-700">Subject Marks</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {education.english && (
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <Label className="text-xs text-gray-600">English</Label>
                                    <p className="text-sm font-medium">{education.english}</p>
                                  </div>
                                )}
                                {education.physics && (
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <Label className="text-xs text-gray-600">Physics</Label>
                                    <p className="text-sm font-medium">{education.physics}</p>
                                  </div>
                                )}
                                {education.chemistry && (
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <Label className="text-xs text-gray-600">Chemistry</Label>
                                    <p className="text-sm font-medium">{education.chemistry}</p>
                                  </div>
                                )}
                                {education.maths && (
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <Label className="text-xs text-gray-600">Maths</Label>
                                    <p className="text-sm font-medium">{education.maths}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Completion Status Indicator */}
                        <div className="pt-2">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-xs text-gray-500">
                            <span className="font-medium">Completion Status:</span>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-2">
                              {[
                                { field: 'yearOfPass', label: 'Year', value: education.yearOfPass },
                                { field: 'percentageMarks', label: '%', value: education.percentageMarks },
                                { field: 'registrationNumber', label: 'Reg', value: education.registrationNumber }
                              ].map(({ field, label, value }) => (
                                <div key={field} className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    value && value !== 'N/A' ? 'bg-green-500' : 'bg-gray-300'
                                  }`} />
                                  <span className={`text-xs ${value && value !== 'N/A' ? 'text-green-600' : 'text-gray-400'}`}>
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <p>No education details available</p>
                    </div>
                  )}
                </div>

                {/* Entrance Exams Section - Only for MBA programs */}
                {applicationData.educationDetails?.entranceExams &&
                 applicationData.educationDetails?.programDetails?.programLevel?.toLowerCase() === 'mba' && (
                  <Card className="border-purple-200 bg-purple-50/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-purple-800">
                        Entrance Examination Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* KMAT */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              applicationData.educationDetails.entranceExams.kmat?.selected ? 'bg-purple-600' : 'bg-gray-300'
                            }`} />
                            <Label className="text-sm font-medium text-purple-800">KMAT</Label>
                          </div>
                          {applicationData.educationDetails.entranceExams.kmat?.selected && applicationData.educationDetails.entranceExams.kmat?.score && (
                            <div className="ml-5">
                              <Label className="text-xs text-gray-600">Score</Label>
                              <p className="text-sm font-medium">{applicationData.educationDetails.entranceExams.kmat.score}</p>
                            </div>
                          )}
                          {!applicationData.educationDetails.entranceExams.kmat?.selected && (
                            <p className="text-xs text-gray-500 ml-5">Not attempted</p>
                          )}
                        </div>

                        {/* CMAT */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              applicationData.educationDetails.entranceExams.cmat?.selected ? 'bg-purple-600' : 'bg-gray-300'
                            }`} />
                            <Label className="text-sm font-medium text-purple-800">CMAT</Label>
                          </div>
                          {applicationData.educationDetails.entranceExams.cmat?.selected && applicationData.educationDetails.entranceExams.cmat?.score && (
                            <div className="ml-5">
                              <Label className="text-xs text-gray-600">Score</Label>
                              <p className="text-sm font-medium">{applicationData.educationDetails.entranceExams.cmat.score}</p>
                            </div>
                          )}
                          {!applicationData.educationDetails.entranceExams.cmat?.selected && (
                            <p className="text-xs text-gray-500 ml-5">Not attempted</p>
                          )}
                        </div>

                        {/* CAT */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              applicationData.educationDetails.entranceExams.cat?.selected ? 'bg-purple-600' : 'bg-gray-300'
                            }`} />
                            <Label className="text-sm font-medium text-purple-800">CAT</Label>
                          </div>
                          {applicationData.educationDetails.entranceExams.cat?.selected && applicationData.educationDetails.entranceExams.cat?.score && (
                            <div className="ml-5">
                              <Label className="text-xs text-gray-600">Score</Label>
                              <p className="text-sm font-medium">{applicationData.educationDetails.entranceExams.cat.score}</p>
                            </div>
                          )}
                          {!applicationData.educationDetails.entranceExams.cat?.selected && (
                            <p className="text-xs text-gray-500 ml-5">Not attempted</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Education Information */}
                {applicationData.educationDetails?.achievements && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Achievements/Work Experience</Label>
                    <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{applicationData.educationDetails.achievements}</p>
                  </div>
                )}

                {applicationData.educationDetails?.collegeName && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">College Name (UG)</Label>
                    <p className="text-sm text-gray-900 mt-1">{applicationData.educationDetails.collegeName}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No education details available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}