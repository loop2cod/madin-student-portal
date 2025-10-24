'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Edit, 
  Save, 
  ArrowLeft, 
  MapPin, 
  Users, 
  GraduationCap,
  FileText,
  Phone,
  Mail,
  Calendar,
  Building,
  BookOpen
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { get, patch } from '@/utilities/AxiosInterceptor';
import { useToast } from '@/components/ui/use-toast';
import { lazy, Suspense } from 'react';
import { PersonalDetailsForm } from '@/components/profile/PersonalDetailsForm';

// Lazy load the other form components for better performance
const AddressAndFamilyForm = lazy(() => import('@/components/profile/AddressAndFamilyForm').then(module => ({ default: module.AddressAndFamilyForm })));
const ProgramSelectionForm = lazy(() => import('@/components/profile/ProgramSelectionForm').then(module => ({ default: module.ProgramSelectionForm })));
const EducationDetailsForm = lazy(() => import('@/components/profile/EducationDetailsForm'));
import { DashboardLayout } from '@/components/DashboardLayout';

interface StudentApplication {
  _id: string;
  applicationId: string;
  mobile: string;
  personalDetails: {
    fullName: string;
    dob: string;
    gender: string;
    religion: string;
    email: string;
    profilePicture?: string;
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
    mode?: string;
    branchPreferences?: Array<{
      branch: string;
      priority: number;
    }>;
    specialization?: string;
    selected: boolean;
    priority: number;
  }>;
  department: string;
  admissionNumber: string;
  status: string;
  currentStage: string;
  sectionStatus?: {
    personalDetails?: {
      isCompleted: boolean;
      isLocked: boolean;
    };
    addressFamilyDetails?: {
      isCompleted: boolean;
      isLocked: boolean;
    };
    educationDetails?: {
      isCompleted: boolean;
      isLocked: boolean;
    };
    programSelection?: {
      isCompleted: boolean;
      isLocked: boolean;
    };
  };
}

export default function ProfilePage() {
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicationData();
  }, []);

  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'address', 'education', 'program'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const response = await get<{ success: boolean; data: StudentApplication }>('/api/v1/auth/student/profile');

      if (response.success) {
        setApplication(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch application data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalDetails = async (personalDetails: any) => {
    try {
      setSaving(true);
      const response = await patch<any>('/api/v1/auth/student/profile/personal-details', {
        personalDetails
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Personal details updated successfully",
        });
        fetchApplicationData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Failed to save personal details:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update personal details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddressAndFamily = async (addressFamilyDetails: any) => {
    try {
      setSaving(true);
      const response = await patch<any>('/api/v1/auth/student/profile/address-family', {
        addressFamilyDetails
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Address and family details updated successfully",
        });
        fetchApplicationData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Failed to save address and family details:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update address and family details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProgramSelection = async (programSelections: any) => {
    try {
      setSaving(true);
      const response = await patch<any>('/api/v1/auth/student/profile/program-selection', {
        programSelections
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Program selection updated successfully",
        });
        fetchApplicationData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Failed to save program selection:', error);
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to update program selection",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEducationDetails = async (educationDetails: any) => {
    try {
      setSaving(true);
      const response = await patch<any>('/api/v1/auth/student/profile/education-details', {
        educationDetails
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Education details updated successfully",
        });
        fetchApplicationData(); // Refresh data
      }
    } catch (error: any) {
      console.error('Failed to save education details:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update education details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Application Found</h2>
              <p className="text-gray-600 mb-4">
                We couldn&apos;t find your application data. This might be a temporary issue.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="My Profile"
    >
      <div className="space-y-4 p-2">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20">
                <AvatarImage src={application.personalDetails?.profilePicture} alt="Profile Picture" />
                <AvatarFallback className="text-white bg-white/20 text-lg sm:text-xl">
                  {application.personalDetails?.fullName ? application.personalDetails.fullName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{application.personalDetails.fullName}</h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  {application.admissionNumber} | {application.department} | {application.applicationId}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white self-start sm:self-auto">
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Profile Editing Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Mobile Vertical Tabs */}
              <div className="sm:hidden space-y-2 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      activeTab === 'personal'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Personal Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      activeTab === 'address'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Address & Family</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('education')}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      activeTab === 'education'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Education Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('program')}
                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                      activeTab === 'program'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm font-medium">Program Selection</span>
                  </button>
                </div>
              </div>

              {/* Desktop Tabs */}
              <TabsList className="hidden sm:grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Personal Details</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Address & Family</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Education Details</span>
                </TabsTrigger>
                <TabsTrigger value="program" className="flex items-center space-x-1">
                  <GraduationCap className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Program Selection</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <PersonalDetailsForm
                  applicationData={application}
                  onSave={handleSavePersonalDetails}
                  saving={saving}
                  onProfilePictureUpdate={fetchApplicationData}
                  sectionStatus={application.sectionStatus?.personalDetails}
                />
              </TabsContent>

               <TabsContent value="address" className="mt-4">
                 <Suspense fallback={<div className="flex items-center justify-center p-6"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>}>
                   <AddressAndFamilyForm
                     applicationData={application}
                     onSave={handleSaveAddressAndFamily}
                     saving={saving}
                     sectionStatus={application.sectionStatus?.addressFamilyDetails}
                   />
                 </Suspense>
               </TabsContent>

               <TabsContent value="education" className="mt-4">
                 <Suspense fallback={<div className="flex items-center justify-center p-6"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>}>
                   <EducationDetailsForm
                     applicationData={application}
                     onSave={handleSaveEducationDetails}
                     saving={saving}
                     sectionStatus={application.sectionStatus?.educationDetails}
                   />
                 </Suspense>
               </TabsContent>

               <TabsContent value="program" className="mt-4">
                 <Suspense fallback={<div className="flex items-center justify-center p-6"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>}>
                   <ProgramSelectionForm
                     applicationData={application}
                     onSave={handleSaveProgramSelection}
                     saving={saving}
                   />
                 </Suspense>
               </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}