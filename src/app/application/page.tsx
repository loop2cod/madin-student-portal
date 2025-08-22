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
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Application Details" }
        ]}
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
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Application Details" }
        ]}
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
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Application Details" }
        ]}
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
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Application Details" }
      ]}
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className={`bg-gradient-to-r ${getStatusGradient(applicationData.status)} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{getStatusTitle(applicationData.status)}</h1>
              <p className="opacity-90">
                Application ID: {applicationData.applicationId}
              </p>
              {applicationData.admissionNumber && (
                <p className="opacity-90 font-medium">
                  Admission Number: {applicationData.admissionNumber}
                </p>
              )}
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              {getStatusIcon(applicationData.status)}
              <span className="ml-2">{applicationData.status.toUpperCase()}</span>
            </Badge>
          </div>
        </div>

        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Application Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Application ID</Label>
                <p className="text-lg font-semibold">{applicationData.applicationId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Submission Date</Label>
                <p className="text-lg font-semibold">{formatDate(applicationData.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                <p className="text-lg font-semibold">{formatDate(applicationData.updatedAt)}</p>
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
                  <p className="text-lg font-semibold">{applicationData.department}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                <p className="text-lg font-semibold">{applicationData.mobile}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                <p className="text-lg font-semibold">
                  {applicationData.personalDetails.fullName || 
                   `${applicationData.personalDetails.firstName} ${applicationData.personalDetails.lastName}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                <p className="text-lg font-semibold">{formatDate(applicationData.personalDetails.dob)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Gender</Label>
                <p className="text-lg font-semibold capitalize">{applicationData.personalDetails.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Religion</Label>
                <p className="text-lg font-semibold capitalize">{applicationData.personalDetails.religion}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-lg font-semibold">{applicationData.personalDetails.email}</p>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Education Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Program Summary */}
            {((applicationData.educationDetails?.programDetails) || 
              (applicationData.programSelections?.find(p => p.selected))) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Selected Program</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Program Level</Label>
                    <p className="text-sm text-blue-900 capitalize">
                      {applicationData.educationDetails?.programDetails?.programLevel || 
                       applicationData.programSelections?.find(p => p.selected)?.programLevel}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Program Name</Label>
                    <p className="text-sm text-blue-900">
                      {applicationData.educationDetails?.programDetails?.programName || 
                       applicationData.programSelections?.find(p => p.selected)?.programName}
                    </p>
                  </div>
                  {(applicationData.educationDetails?.programDetails?.mode || 
                    applicationData.programSelections?.find(p => p.selected)?.mode) && (
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Mode</Label>
                      <p className="text-sm text-blue-900">
                        {applicationData.educationDetails?.programDetails?.mode || 
                         applicationData.programSelections?.find(p => p.selected)?.mode}
                      </p>
                    </div>
                  )}
                  {(applicationData.educationDetails?.programDetails?.specialization || 
                    applicationData.programSelections?.find(p => p.selected)?.specialization) && (
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Specialization</Label>
                      <p className="text-sm text-blue-900">
                        {applicationData.educationDetails?.programDetails?.specialization || 
                         applicationData.programSelections?.find(p => p.selected)?.specialization}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Branch Preferences */}
                {(() => {
                  const selectedProgram = applicationData.programSelections?.find(p => p.selected);
                  const educationBranches = applicationData.educationDetails?.programDetails?.branchPreferences;
                  const selectionBranches = selectedProgram?.branchPreferences;
                  
                  const hasBranches = (educationBranches && educationBranches.length > 0) || 
                                    (selectionBranches && selectionBranches.length > 0);
                  
                  if (!hasBranches) return null;
                  
                  return (
                    <div className="mt-3">
                      <Label className="text-sm font-medium text-blue-800">Branch Preferences</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(educationBranches || selectionBranches)
                          ?.sort((a, b) => a.priority - b.priority)
                          .map((branch, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              {branch.priority}. {branch.branch}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Academic Qualifications Table */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Academic Qualifications</h3>
              {applicationData.educationDetails?.educationData && 
               applicationData.educationDetails.educationData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {(() => {
                          const selectedProgram = applicationData.programSelections?.find(p => p.selected);
                          const isMBA = selectedProgram?.programName?.toLowerCase().includes('mba');
                          
                          return (
                            <>
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">Sl.</th>}
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">Passed/Failed</th>
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">
                                {isMBA ? 'Group/Subject' : 'Group/Trade'}
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">Period</th>
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">Year of Pass</th>
                              <th className="border border-gray-300 p-2 text-left text-sm font-medium">% of Marks</th>
                              {isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">Board/University</th>}
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">No. of Chances</th>}
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">English</th>}
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">Physics</th>}
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">Chemistry</th>}
                              {!isMBA && <th className="border border-gray-300 p-2 text-left text-sm font-medium">Maths</th>}
                            </>
                          );
                        })()}
                      </tr>
                    </thead>
                    <tbody>
                      {applicationData.educationDetails.educationData.map((row, index) => {
                        const selectedProgram = applicationData.programSelections?.find(p => p.selected);
                        const isMBA = selectedProgram?.programName?.toLowerCase().includes('mba');
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            {!isMBA && <td className="border border-gray-300 p-2 text-center font-medium">{index + 1}</td>}
                            <td className="border border-gray-300 p-2 text-sm">{row.examination}</td>
                            <td className="border border-gray-300 p-2 text-sm capitalize">{row.passedFailed}</td>
                            <td className="border border-gray-300 p-2 text-sm">{row.groupTrade || row.groupSubject}</td>
                            <td className="border border-gray-300 p-2 text-sm">{row.period}</td>
                            <td className="border border-gray-300 p-2 text-sm">{row.yearOfPass}</td>
                            <td className="border border-gray-300 p-2 text-sm">{row.percentageMarks}%</td>
                            {isMBA && <td className="border border-gray-300 p-2 text-sm">{row.boardUniversity}</td>}
                            {!isMBA && <td className="border border-gray-300 p-2 text-sm">{row.noOfChances}</td>}
                            {!isMBA && <td className="border border-gray-300 p-2 text-sm">{row.english}</td>}
                            {!isMBA && <td className="border border-gray-300 p-2 text-sm">{row.physics}</td>}
                            {!isMBA && <td className="border border-gray-300 p-2 text-sm">{row.chemistry}</td>}
                            {!isMBA && <td className="border border-gray-300 p-2 text-sm">{row.maths}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 text-center">
                    {applicationData.educationDetails ? 
                      'Academic qualification data is being processed or not yet available.' :
                      'Academic qualifications will be displayed once you complete your education details.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Subject-wise Scores Table */}
            {applicationData.educationDetails?.subjectScores && 
             applicationData.educationDetails.subjectScores.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Subject-wise Scores</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Physics (%)</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Chemistry (%)</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Maths (%)</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Total</th>
                        <th className="border border-gray-300 p-2 text-left text-sm font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationData.educationDetails.subjectScores.map((row, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 text-sm">{row.examination}</td>
                          <td className="border border-gray-300 p-2 text-sm">{row.physics}%</td>
                          <td className="border border-gray-300 p-2 text-sm">{row.chemistry}%</td>
                          <td className="border border-gray-300 p-2 text-sm">{row.maths}%</td>
                          <td className="border border-gray-300 p-2 text-sm">{row.total}</td>
                          <td className="border border-gray-300 p-2 text-sm">{row.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Entrance Examinations */}
            {applicationData.educationDetails?.entranceExams && (() => {
              const exams = applicationData.educationDetails.entranceExams;
              const selectedExams = Object.entries(exams).filter(([, exam]) => exam.selected);
              
              if (selectedExams.length === 0) return null;
              
              return (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Entrance Examinations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedExams.map(([examName, exam]) => (
                      <div key={examName} className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="font-medium text-sm text-blue-900">{examName.toUpperCase()}</p>
                        <p className="text-sm text-blue-700">Score: {exam.score || 'Not provided'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Additional Education Information */}
            {applicationData.educationDetails?.achievements && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Achievements/Work Experience</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-900">{applicationData.educationDetails.achievements}</p>
                </div>
              </div>
            )}

            {applicationData.educationDetails?.collegeName && (
              <div>
                <Label className="text-sm font-medium text-gray-700">College Name (UG)</Label>
                <p className="text-lg font-semibold mt-1">{applicationData.educationDetails.collegeName}</p>
              </div>
            )}

            {/* If no education details at all */}
            {!applicationData.educationDetails && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-center text-gray-600">
                  No education details available yet.
                  <br />
                  <span className="text-sm">Please complete your education details in the profile section.</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}