'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { post } from '@/utilities/AxiosInterceptor';
import {
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QuickAdmissionProgramSelection } from '@/components/QuickAdmissionProgramSelection';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  fullName: string;
  mobile: string;
  programLevel: 'diploma' | 'mba' | '';
  programName: string;
  mode?: 'Regular' | 'Part-time' | 'LET';
  specialization?: string;
  branchPreferences?: Array<{
    branch: string;
    priority: number;
  }>;
}

const steps = [
  { id: 1, name: 'Basic Details', icon: User },
  { id: 2, name: 'Program Selection', icon: GraduationCap }
];

export default function QuickAdmission() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    programLevel: '',
    programName: '',
    mode: undefined,
    specialization: undefined,
    branchPreferences: []
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.mobile || formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      toast({
        title: "Error", 
        description: "Valid 10-digit mobile number is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleCreateAnother = () => {
    setCreatedApplicationId(null);
    setFormData({
      fullName: '',
      mobile: '',
      programLevel: '',
      programName: '',
      mode: undefined,
      specialization: undefined,
      branchPreferences: []
    });
    setCurrentStep(1);
  };

  const validateStep2 = () => {
    if (!formData.programLevel || !formData.programName) {
      toast({
        title: "Error",
        description: "Please select a program to continue",
        variant: "destructive",
      });
      return false;
    }

    // For diploma programs, mode is required
    if (formData.programLevel === 'diploma' && !formData.mode) {
      toast({
        title: "Error",
        description: "Please select a mode for the diploma program",
        variant: "destructive",
      });
      return false;
    }

    // For diploma programs, at least one branch must be selected
    if (formData.programLevel === 'diploma' &&
        formData.mode &&
        (!formData.branchPreferences || formData.branchPreferences.length === 0)) {
      toast({
        title: "Error",
        description: "Please select at least one branch preference",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Show progress toast
      toast({
        title: "Creating Application",
        description: "Please wait while we create the admission application...",
      });

      // Step 1: Create application
      const createResponse = await post('/api/v1/admission/create-application', {
        mobile: formData.mobile
      });

      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Failed to create application');
      }

      const applicationId = createResponse.data.applicationId;

      // Step 2: Save personal details
      const personalDetailsResponse = await post('/api/v1/admission/personal-details', {
        applicationId,
        personalDetails: {
          fullName: formData.fullName,
          // Set minimal required fields for quick admission
          dob: new Date('2000-01-01').toISOString().split('T')[0], // Default DOB
          gender: 'male', // Default gender
          religion: 'Not specified', // Default religion
          email: `${formData.mobile}@temp.com` // Temporary email
        }
      });

      if (!personalDetailsResponse.success) {
        throw new Error(personalDetailsResponse.message || 'Failed to save personal details');
      }

      // Step 3: Save program selection
      const programSelections = [{
        programLevel: formData.programLevel,
        programName: formData.programName,
        ...(formData.mode && { mode: formData.mode }),
        ...(formData.specialization && { specialization: formData.specialization }),
        ...(formData.branchPreferences && { branchPreferences: formData.branchPreferences }),
        selected: true,
        priority: 1
      }];

      const programResponse = await post(`/api/v1/admission/add-program-selection/${applicationId}`, {
        programSelections
      });

      if (!programResponse.success) {
        throw new Error(programResponse.message || 'Failed to save program selection');
      }

      // Success feedback
      toast({
        title: "Application Created Successfully!",
        description: `Application ID: ${applicationId}. The applicant can now complete their application using this ID.`,
      });

      // Set the created application ID to show success state
      setCreatedApplicationId(applicationId);

    } catch (error: any) {
      console.error('Error creating quick admission:', error);

      // Enhanced error handling
      let errorMessage = "Failed to create application";

      if (error.message?.includes('mobile')) {
        errorMessage = "This mobile number is already registered. Please use a different number.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error Creating Application",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step.id 
              ? 'bg-[#001c67] border-[#001c67] text-white' 
              : 'border-gray-300 text-gray-500'
          }`}>
            <step.icon className="w-5 h-5" />
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStep >= step.id ? 'text-[#001c67]' : 'text-gray-500'
          }`}>
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <ProtectedRoute requiredRoles={['super_admin', 'admission_officer']}>
      <DashboardLayout title="Quick Admission">
        <div className="bg-gray-50 min-h-full">
          <div className="mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Quick Admission</h1>
              <p className="text-gray-600 mt-2">
                Create admission applications quickly for applicants
              </p>
              <div className="mt-4">
                <Badge variant="outline">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Admin Tool
                </Badge>
              </div>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Form Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {createdApplicationId ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Application Created Successfully
                    </>
                  ) : currentStep === 1 ? (
                    <>
                      <User className="w-5 h-5" />
                      Basic Applicant Details
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" />
                      Program Selection
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {createdApplicationId
                    ? "The admission application has been created successfully"
                    : currentStep === 1
                      ? "Enter the basic information for the applicant"
                      : "Select the program for the applicant"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {createdApplicationId ? (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Application Created Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The admission application has been created with the following details:
                      </p>

                      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Application ID:</span>
                            <span className="text-[#001c67] font-mono">{createdApplicationId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Applicant Name:</span>
                            <span>{formData.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Mobile Number:</span>
                            <span>{formData.mobile}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Program:</span>
                            <span>{formData.programName}</span>
                          </div>
                          {formData.mode && (
                            <div className="flex justify-between">
                              <span className="font-medium">Mode:</span>
                              <span>{formData.mode}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-6">
                        The applicant can now use this Application ID to complete their full application on the main website.
                      </p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={handleCreateAnother}
                        variant="outline"
                        className="rounded-none border-[#001c67] text-[#001c67]"
                      >
                        Create Another Application
                      </Button>

                      <Button
                        onClick={() => router.push('/applications')}
                        className="bg-[#001c67] hover:bg-[#001c67]/80 text-white rounded-none"
                      >
                        View All Applications
                      </Button>
                    </div>
                  </div>
                ) : currentStep === 1 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Enter applicant's full name"
                          className="rounded-none"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                          Mobile Number *
                        </Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          className="rounded-none"
                          maxLength={10}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleStep1Next}
                        disabled={isSubmitting}
                        className="bg-[#001c67] hover:bg-[#001c67]/80 text-white rounded-none"
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Program Selection Component */}
                    <QuickAdmissionProgramSelection
                      formData={formData}
                      onUpdate={handleInputChange}
                    />

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="rounded-none border-[#001c67] text-[#001c67]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#001c67] hover:bg-[#001c67]/80 text-white rounded-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Create Application
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
