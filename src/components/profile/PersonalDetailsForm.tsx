'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, User, Mail, Phone, Calendar, Users } from 'lucide-react';

interface PersonalDetailsFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  saving: boolean;
}

interface PersonalDetailsData {
  fullName: string;
  dob: Date | undefined;
  gender: string;
  religion: string;
  email: string;
}

export const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  applicationData,
  onSave,
  saving
}) => {
  const [formData, setFormData] = useState<PersonalDetailsData>({
    fullName: '',
    dob: undefined,
    gender: '',
    religion: '',
    email: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (applicationData?.personalDetails) {
      const details = applicationData.personalDetails;
      setFormData({
        fullName: details.fullName || '',
        dob: details.dob ? new Date(details.dob) : undefined,
        gender: details.gender || '',
        religion: details.religion || '',
        email: details.email || ''
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

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-red-500' : ''}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <span className="text-sm text-red-500">{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>Date of Birth *</Label>
            <DatePicker
              date={formData.dob}
              onDateChange={(date) => handleInputChange('dob', date)}
              placeholder="Select your date of birth"
              className={errors.dob ? 'border-red-500' : ''}
            />
            {errors.dob && (
              <span className="text-sm text-red-500">{errors.dob}</span>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <span className="text-sm text-red-500">{errors.gender}</span>
            )}
          </div>

          {/* Religion */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="religion">Religion</Label>
            <Input
              id="religion"
              type="text"
              value={formData.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
              placeholder="Enter your religion (optional)"
            />
          </div>
        </div>

        {/* Mobile Number (Read-only) */}
        <div className="mt-6">
          <Label>Mobile Number</Label>
          <div className="relative mt-2">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={applicationData?.mobile || ''}
              readOnly
              className="pl-10 bg-gray-50 cursor-not-allowed"
              placeholder="Mobile number"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mobile number cannot be changed. Contact administration if you need to update this.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="min-w-[120px]"
          >
            {saving ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {hasChanges && (
          <p className="text-sm text-orange-600 mt-2 text-right">
            You have unsaved changes
          </p>
        )}
      </CardContent>
    </Card>
  );
};