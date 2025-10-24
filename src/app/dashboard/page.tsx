'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, BookOpen, FileText, Settings, GraduationCap, Bell, Download, HelpCircle, CreditCard, Award, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { get } from '@/utilities/AxiosInterceptor';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StudentFeeDisplay } from '@/components/StudentFeeDisplay';

interface StudentData {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  applicationId: string;
  department: string;
  role: string;
}

interface ProfileStatus {
  sectionStatus: {
    personalDetails: { isCompleted: boolean; isLocked: boolean; };
    addressFamilyDetails: { isCompleted: boolean; isLocked: boolean; };
    educationDetails: { isCompleted: boolean; isLocked: boolean; };
    programSelection: { isCompleted: boolean; isLocked: boolean; };
  };
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await get<{ success: boolean; data: StudentData }>('/api/v1/auth/profile');
      if (response.success && response.data.role === 'student') {
        setStudent(response.data);
        // Store user data for sidebar
        localStorage.setItem('studentUser', JSON.stringify(response.data));
        
        // Fetch profile status
        await fetchProfileStatus();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const response = await get<{ success: boolean; data: ProfileStatus }>('/api/v1/auth/student/profile');
      if (response.success) {
        setProfileStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  // Check for incomplete sections
  const getIncompleteSection = () => {
    if (!profileStatus?.sectionStatus) return null;
    
    const sections = [
      { key: 'personalDetails', name: 'Personal Details', tab: 'personal' },
      { key: 'addressFamilyDetails', name: 'Address & Family Details', tab: 'address' },
      { key: 'educationDetails', name: 'Education Details', tab: 'education' },
      { key: 'programSelection', name: 'Program Selection', tab: 'program' }
    ];

    for (const section of sections) {
      const status = profileStatus.sectionStatus[section.key as keyof typeof profileStatus.sectionStatus];
      if (!status.isCompleted && !status.isLocked) {
        return { ...section, status };
      }
    }
    return null;
  };

  const incompleteSection = getIncompleteSection();

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 p-2">

        {/* Student Info Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="w-4 h-4" />
              <span>Student Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Name</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{student.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Admission No.</span>
                  <span className="text-xs md:text-sm font-mono font-semibold text-blue-600">{student.admissionNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Application ID</span>
                  <span className="text-xs md:text-sm font-mono font-semibold text-gray-900">{student.applicationId}</span>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Email</span>
                  <span className="text-xs md:text-sm  font-semibold text-gray-900" title={student.email}>
                    {student.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Department</span>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {student.department}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs md:text-sm font-medium text-gray-600">Status</span>
                  <Badge variant="default" className="text-xs px-2 py-1 bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Prompt */}
        {incompleteSection && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-1">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">
                    Your <strong>{incompleteSection.name}</strong> section is pending completion. 
                    Please complete it to proceed with your application.
                  </p>
                  <Link href={`/profile?tab=${incompleteSection.tab}`}>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Complete {incompleteSection.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/application">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Application Status</h3>
                    <p className="text-xs md:text-sm text-gray-500">View your application</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/certificates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Certificates</h3>
                    <p className="text-xs md:text-sm text-gray-500">Request certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Profile</h3>
                    <p className="text-xs md:text-sm text-gray-500">Update information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Help & Support</h3>
                    <p className="text-xs md:text-sm text-gray-500">Get assistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Fee Structure */}
        <StudentFeeDisplay />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-xs md:text-sm text-gray-500">Your student account was successfully created</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Welcome to {student.department}</p>
                  <p className="text-xs md:text-sm text-gray-500">You have been assigned to the {student.department} department</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}