'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { get, patch } from '@/utilities/AxiosInterceptor';
import { useToast } from '@/components/ui/use-toast';
import { PersonalDetailsForm } from '@/components/profile/PersonalDetailsForm';
import { AddressAndFamilyForm } from '@/components/profile/AddressAndFamilyForm';
import { ProgramSelectionForm } from '@/components/profile/ProgramSelectionForm';
import { EducationDetailsForm } from '@/components/profile/EducationDetailsForm';
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
}

export default function ProfilePage() {
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicationData();
  }, []);

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
      breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "My Profile" }
      ]}
    >

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{application.personalDetails.fullName}</h1>
              <p className="text-blue-100">
                {application.admissionNumber} | {application.department} | {application.applicationId}
              </p>
            </div>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Profile Editing Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Personal Details</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Address & Family</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Education Details</span>
                </TabsTrigger>
                <TabsTrigger value="program" className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Program Selection</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <PersonalDetailsForm
                  applicationData={application}
                  onSave={handleSavePersonalDetails}
                  saving={saving}
                />
              </TabsContent>

              <TabsContent value="address" className="mt-6">
                <AddressAndFamilyForm
                  applicationData={application}
                  onSave={handleSaveAddressAndFamily}
                  saving={saving}
                />
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                <EducationDetailsForm
                  applicationData={application}
                  onSave={handleSaveEducationDetails}
                  saving={saving}
                />
              </TabsContent>

              <TabsContent value="program" className="mt-6">
                <ProgramSelectionForm
                  applicationData={application}
                  onSave={handleSaveProgramSelection}
                  saving={saving}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}