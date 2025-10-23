'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, User, Mail, Phone, Calendar, Users, Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { get, patch } from '@/utilities/AxiosInterceptor';

interface PersonalDetailsFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  saving: boolean;
  onProfilePictureUpdate?: () => void;
}

interface PersonalDetailsData {
  fullName: string;
  dob: Date | undefined;
  gender: string;
  religion: string;
  email: string;
  profilePicture?: string;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  applicationData,
  onSave,
  saving,
  onProfilePictureUpdate
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<PersonalDetailsData>({
    fullName: '',
    dob: undefined,
    gender: '',
    religion: '',
    email: '',
    profilePicture: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (applicationData?.personalDetails) {
      const details = applicationData.personalDetails;
      setFormData({
        fullName: details.fullName || '',
        dob: details.dob ? new Date(details.dob) : undefined,
        gender: details.gender || '',
        religion: details.religion || '',
        email: details.email || '',
        profilePicture: details.profilePicture || ''
      });
    }
  }, [applicationData]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PersonalDetailsData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const uploadFile = (file: File, url: string) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr.response) : reject(new Error(`Upload failed with status ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 500KB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Get presigned URL
      const response = await get<{ success: boolean; data: { uploadURL: string; publicURL: string } }>(
        `/api/v1/auth/student/generate-profile-picture-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&fileSize=${file.size}`
      );

      if (response.success && response.data) {
        // Upload file to R2
        await uploadFile(file, response.data.uploadURL);

        // Update form data with new profile picture URL
        setFormData(prev => ({
          ...prev,
          profilePicture: response.data.publicURL
        }));
        setHasChanges(true);

        // Save the profile picture URL to backend
        try {
          const saveResponse = await patch<any>('/api/v1/auth/student/profile/personal-details', {
            personalDetails: {
              profilePicture: response.data.publicURL
            }
          });
          if (saveResponse.success) {
            toast({
              title: "Success",
              description: "Profile picture uploaded and saved successfully",
            });
            if (onProfilePictureUpdate) {
              onProfilePictureUpdate();
            }
          }
        } catch (saveError: any) {
          toast({
            title: "Upload Successful",
            description: "Image uploaded but failed to save. Please try saving manually.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Failed to get upload URL");
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-semibold">Personal Information</h3>
        </div>

        {/* Profile Picture Section */}
        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg mb-4">
          <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
            <AvatarImage src={formData.profilePicture} alt="Profile Picture" />
            <AvatarFallback className="text-sm sm:text-base">
              {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Label className="text-sm font-medium">Profile Picture</Label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-picture-upload"
                disabled={uploading}
              />
              <Label
                htmlFor="profile-picture-upload"
                className={`flex items-center space-x-1 px-2 py-1 rounded cursor-pointer transition-colors text-xs ${
                  uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-2 h-2" />
                    <span>{formData.profilePicture ? 'Change' : 'Upload'}</span>
                  </>
                )}
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP, max 500KB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`h-9 ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <span className="text-xs text-red-500">{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-7 h-9 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <Label className="text-sm">Date of Birth *</Label>
            <DatePicker
              date={formData.dob}
              onDateChange={(date:any) => handleInputChange('dob', date)}
              placeholder="Select your date of birth"
              className={errors.dob ? 'border-red-500' : ''}
            />
            {errors.dob && (
              <span className="text-xs text-red-500">{errors.dob}</span>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label className="text-sm">Gender *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className={`h-9 ${errors.gender ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <span className="text-xs text-red-500">{errors.gender}</span>
            )}
          </div>

          {/* Religion */}
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="religion" className="text-sm">Religion</Label>
            <Input
              id="religion"
              type="text"
              value={formData.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
              className="h-9"
              placeholder="Enter your religion (optional)"
            />
          </div>
        </div>

        {/* Mobile Number (Read-only) */}
        <div className="mt-3">
          <Label className="text-sm">Mobile Number</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              type="text"
              value={applicationData?.mobile || ''}
              readOnly
              className="pl-7 h-9 bg-gray-50 cursor-not-allowed text-sm"
              placeholder="Mobile number"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mobile number cannot be changed. Contact administration if you need to update this.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center mt-4 pt-3 border-t">
          {hasChanges && (
            <p className="text-xs text-orange-600 mr-3">
              You have unsaved changes
            </p>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="h-8 px-3 text-sm"
          >
            {saving ? (
              <div className="animate-spin w-2 h-2 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Save className="w-2 h-2 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};