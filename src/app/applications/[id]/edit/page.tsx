'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { get, put } from '@/utilities/AxiosInterceptor';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  FileText,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

// Import the original form components from the main website
import EditPersonalDetailsForm from '@/components/EditForms/EditPersonalDetailsForm';
import EditAddressAndFamilyForm from '@/components/EditForms/EditAddressAndFamilyForm';
import EditProgramSelectionForm from '@/components/EditForms/EditProgramSelectionForm';
import EditEducationDetailsForm from '@/components/EditForms/EditEducationDetailsForm';
import EditDeclarationForm from '@/components/EditForms/EditDeclarationForm';

interface ApplicationData {
  _id: string;
  applicationId: string;
  mobile: string;
  personalDetails: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    dob: string;
    gender: string;
    religion: string;
    email: string;
    mobile: string;
  };
  addressFamilyDetails: {
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
  };
  programSelections: Array<{
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
  }>;
  educationDetails: any;
  declaration?: {
    agreed: boolean;
    digitalSignature?: string;
    agreedAt?: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  currentStage: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { hasPermission } = useAuth();
  
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [unsavedChanges, setUnsavedChanges] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!applicationId) return;

      setIsLoading(true);
      try {
        const response = await get(`/api/v1/admission/admin/${applicationId}`);
        
        if (response.success) {
          setApplicationData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch application data');
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId, toast]);

  const handleSaveSection = async (section: string, data: any) => {
    if (!applicationData) return;

    setSaving(true);
    try {
      const response = await put(`/api/v1/admission/admin/${applicationData._id}/edit/${section}`, data);

      if (response.success) {
        // Update the application data
        setApplicationData(response.data);
        
        // Clear unsaved changes for this section
        setUnsavedChanges(prev => ({
          ...prev,
          [section]: false
        }));
        
        toast({
          title: 'Success',
          description: `${section.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} updated successfully`,
        });
      } else {
        throw new Error(response.message || 'Failed to update');
      }
    } catch (error) {
      console.error(`Failed to update ${section}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update ${section.replace(/[-_]/g, ' ')}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDataChange = (section: string) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [section]: true
    }));
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

  const getCurrentStageDisplay = (stage: string) => {
    const stageMap: Record<string, string> = {
      'mobile_verification': 'Mobile Verification',
      'personal_details': 'Personal Details',
      'address_family_details': 'Address & Family Details',
      'application_fee_payment': 'Application Fee Payment',
      'program_selection': 'Program Selection',
      'education_details': 'Education Details',
      'declaration': 'Declaration',
      'submitted': 'Application Submitted'
    };
    return stageMap[stage] || stage;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredPermissions={['edit_applications']}>
        <DashboardLayout title="Edit Application">
             <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!applicationData) {
    return (
      <ProtectedRoute requiredPermissions={['edit_applications']}>
        <DashboardLayout title="Edit Application">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Application Not Found</h2>
              <p className="text-gray-600 mt-2">The requested application could not be found.</p>
            </div>
            <Button onClick={() => router.push('/applications')} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back to Applications
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['edit_applications']}>
      <DashboardLayout title="Edit Application">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button onClick={() => router.push(`/applications/${applicationData.applicationId}`)} size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Application Details
                </Button>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Application</h1>
              <p className="text-gray-600 text-sm">Application ID: {applicationData.applicationId}</p>
            </div>
            <div className="flex items-start space-x-2">
              <Badge className={getStatusColor(applicationData.status)}>
                <span className="ml-1">{applicationData.status.toUpperCase()}</span>
              </Badge>
              <Badge variant="outline">
                {getCurrentStageDisplay(applicationData.currentStage)}
              </Badge>
            </div>
          </div>

          {/* Tabs for different sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal
                    {unsavedChanges.personal && <AlertCircle className="w-3 h-3 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                    {unsavedChanges.address && <AlertCircle className="w-3 h-3 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="program" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Program
                    {unsavedChanges.program && <AlertCircle className="w-3 h-3 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                    {unsavedChanges.education && <AlertCircle className="w-3 h-3 text-orange-500" />}
                  </TabsTrigger>
                  <TabsTrigger value="declaration" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Declaration
                    {unsavedChanges.declaration && <AlertCircle className="w-3 h-3 text-orange-500" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <EditPersonalDetailsForm
                    applicationData={applicationData}
                    onSave={(data) => handleSaveSection('personal-details', { personalDetails: data })}
                    onChange={() => handleDataChange('personal')}
                    saving={saving}
                  />
                </TabsContent>

                <TabsContent value="address" className="mt-6">
                  <EditAddressAndFamilyForm
                    applicationData={applicationData}
                    onSave={(data) => handleSaveSection('address-family-details', { addressFamilyDetails: data })}
                    onChange={() => handleDataChange('address')}
                    saving={saving}
                  />
                </TabsContent>

                <TabsContent value="program" className="mt-6">
                  <EditProgramSelectionForm
                    applicationData={applicationData}
                    onSave={(data) => handleSaveSection('program-selection', { programSelections: data })}
                    onChange={() => handleDataChange('program')}
                    saving={saving}
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-6">
                  <EditEducationDetailsForm
                    applicationData={applicationData}
                    onSave={(data) => handleSaveSection('education-details', { educationDetails: data })}
                    onChange={() => handleDataChange('education')}
                    saving={saving}
                  />
                </TabsContent>

                <TabsContent value="declaration" className="mt-6">
                  <EditDeclarationForm
                    applicationData={applicationData}
                    onSave={(data) => handleSaveSection('declaration', { declaration: data })}
                    onChange={() => handleDataChange('declaration')}
                    saving={saving}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}