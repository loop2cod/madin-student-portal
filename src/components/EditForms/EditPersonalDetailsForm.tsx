'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DatePicker } from '../ui/date-picker';

interface PersonalDetailsFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
  saving: boolean;
}

interface PersonalDetailsData {
  fullName: string;
  dob: Date | undefined;
  gender: string;
  religion: string;
  email: string;
  mobile: string;
}

const EditPersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  applicationData,
  onSave,
  onChange,
  saving
}) => {
  const [formData, setFormData] = useState<PersonalDetailsData>({
    fullName: '',
    dob: undefined,
    gender: '',
    religion: '',
    email: '',
    mobile: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (applicationData?.personalDetails) {
      setFormData({
        fullName: applicationData.personalDetails.fullName || 
                  (applicationData.personalDetails.firstName + ' ' + applicationData.personalDetails.lastName) || '',
        dob: applicationData.personalDetails.dob ? new Date(applicationData.personalDetails.dob) : undefined,
        gender: applicationData.personalDetails.gender || '',
        religion: applicationData.personalDetails.religion || '',
        email: applicationData.personalDetails.email || '',
        mobile: applicationData.personalDetails.mobile || applicationData.mobile || ''
      });
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const today = new Date();
      const age = today.getFullYear() - formData.dob.getFullYear();
      if (age < 16) {
        newErrors.dob = 'Minimum age requirement is 16 years';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.religion) {
      newErrors.religion = 'Religion is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof PersonalDetailsData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onChange();
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter full name"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <DatePicker
                date={formData.dob}
                setDate={(date:any) => handleInputChange('dob', date)}
                placeholder="Select your date of birth"
                className="w-full rounded-none h-10"
              />
              {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="religion">Religion *</Label>
              <Select value={formData.religion} onValueChange={(value) => handleInputChange('religion', value)}>
                <SelectTrigger className={errors.religion ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="islam">Islam</SelectItem>
                  <SelectItem value="christianity">Christianity</SelectItem>
                  <SelectItem value="hinduism">Hinduism</SelectItem>
                  <SelectItem value="buddhism">Buddhism</SelectItem>
                  <SelectItem value="judaism">Judaism</SelectItem>
                  <SelectItem value="sikhism">Sikhism</SelectItem>
                  <SelectItem value="jainism">Jainism</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.religion && <p className="text-sm text-red-500">{errors.religion}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="Enter mobile number"
                className={errors.mobile ? 'border-red-500' : ''}
              />
              {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Personal Details'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditPersonalDetailsForm;