'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, MapPin, Users, Home, Phone } from 'lucide-react';

interface AddressAndFamilyFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  saving: boolean;
}

interface AddressAndFamilyData {
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

export const AddressAndFamilyForm: React.FC<AddressAndFamilyFormProps> = ({
  applicationData,
  onSave,
  saving
}) => {
  const [formData, setFormData] = useState<AddressAndFamilyData>({
    address: {
      houseNumber: '',
      street: '',
      postOffice: '',
      pinCode: '',
      district: '',
      state: '',
      country: 'India'
    },
    parents: {
      fatherName: '',
      fatherMobile: '',
      motherName: '',
      motherMobile: ''
    },
    guardian: {
      guardianName: '',
      guardianPlace: '',
      guardianContact: ''
    }
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (applicationData?.addressFamilyDetails) {
      const details = applicationData.addressFamilyDetails;
      setFormData({
        address: {
          houseNumber: details.address?.houseNumber || '',
          street: details.address?.street || '',
          postOffice: details.address?.postOffice || '',
          pinCode: details.address?.pinCode || '',
          district: details.address?.district || '',
          state: details.address?.state || '',
          country: details.address?.country || 'India'
        },
        parents: {
          fatherName: details.parents?.fatherName || '',
          fatherMobile: details.parents?.fatherMobile || '',
          motherName: details.parents?.motherName || '',
          motherMobile: details.parents?.motherMobile || ''
        },
        guardian: {
          guardianName: details.guardian?.guardianName || '',
          guardianPlace: details.guardian?.guardianPlace || '',
          guardianContact: details.guardian?.guardianContact || ''
        }
      });
    }
  }, [applicationData]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    if (!formData.address.district.trim()) {
      newErrors['address.district'] = 'District is required';
    }
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.pinCode.trim()) {
      newErrors['address.pinCode'] = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.address.pinCode)) {
      newErrors['address.pinCode'] = 'PIN code must be 6 digits';
    }

    // Parent validation
    if (!formData.parents.fatherName.trim()) {
      newErrors['parents.fatherName'] = 'Father name is required';
    }

    // Mobile validation helper
    const validateMobile = (mobile: string): boolean => {
      return mobile === '' || /^\d{10}$/.test(mobile);
    };

    if (formData.parents.fatherMobile && !validateMobile(formData.parents.fatherMobile)) {
      newErrors['parents.fatherMobile'] = 'Mobile number must be 10 digits';
    }
    if (formData.parents.motherMobile && !validateMobile(formData.parents.motherMobile)) {
      newErrors['parents.motherMobile'] = 'Mobile number must be 10 digits';
    }
    if (formData.guardian.guardianContact && !validateMobile(formData.guardian.guardianContact)) {
      newErrors['guardian.guardianContact'] = 'Contact number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof AddressAndFamilyData],
            [keys[1]]: value
          }
        };
      }
      return prev;
    });
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
    <div className="space-y-6">
      {/* Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Address Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">House/Building Number</Label>
              <Input
                id="houseNumber"
                value={formData.address.houseNumber}
                onChange={(e) => handleInputChange('address.houseNumber', e.target.value)}
                placeholder="House/Building number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className={errors['address.street'] ? 'border-red-500' : ''}
                placeholder="Street, locality, area"
              />
              {errors['address.street'] && (
                <span className="text-sm text-red-500">{errors['address.street']}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postOffice">Post Office</Label>
              <Input
                id="postOffice"
                value={formData.address.postOffice}
                onChange={(e) => handleInputChange('address.postOffice', e.target.value)}
                placeholder="Post office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pinCode">PIN Code *</Label>
              <Input
                id="pinCode"
                value={formData.address.pinCode}
                onChange={(e) => handleInputChange('address.pinCode', e.target.value)}
                className={errors['address.pinCode'] ? 'border-red-500' : ''}
                placeholder="6-digit PIN code"
                maxLength={6}
              />
              {errors['address.pinCode'] && (
                <span className="text-sm text-red-500">{errors['address.pinCode']}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.address.district}
                onChange={(e) => handleInputChange('address.district', e.target.value)}
                className={errors['address.district'] ? 'border-red-500' : ''}
                placeholder="District"
              />
              {errors['address.district'] && (
                <span className="text-sm text-red-500">{errors['address.district']}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className={errors['address.state'] ? 'border-red-500' : ''}
                placeholder="State"
              />
              {errors['address.state'] && (
                <span className="text-sm text-red-500">{errors['address.state']}</span>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>Parent Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father&apos;s Name *</Label>
              <Input
                id="fatherName"
                value={formData.parents.fatherName}
                onChange={(e) => handleInputChange('parents.fatherName', e.target.value)}
                className={errors['parents.fatherName'] ? 'border-red-500' : ''}
                placeholder="Father's full name"
              />
              {errors['parents.fatherName'] && (
                <span className="text-sm text-red-500">{errors['parents.fatherName']}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherMobile">Father&apos;s Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="fatherMobile"
                  value={formData.parents.fatherMobile}
                  onChange={(e) => handleInputChange('parents.fatherMobile', e.target.value)}
                  className={`pl-10 ${errors['parents.fatherMobile'] ? 'border-red-500' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              {errors['parents.fatherMobile'] && (
                <span className="text-sm text-red-500">{errors['parents.fatherMobile']}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">Mother&apos;s Name</Label>
              <Input
                id="motherName"
                value={formData.parents.motherName}
                onChange={(e) => handleInputChange('parents.motherName', e.target.value)}
                placeholder="Mother's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherMobile">Mother&apos;s Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="motherMobile"
                  value={formData.parents.motherMobile}
                  onChange={(e) => handleInputChange('parents.motherMobile', e.target.value)}
                  className={`pl-10 ${errors['parents.motherMobile'] ? 'border-red-500' : ''}`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              {errors['parents.motherMobile'] && (
                <span className="text-sm text-red-500">{errors['parents.motherMobile']}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-purple-600" />
            <span>Guardian Information (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardian.guardianName}
                onChange={(e) => handleInputChange('guardian.guardianName', e.target.value)}
                placeholder="Guardian's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPlace">Guardian Place</Label>
              <Input
                id="guardianPlace"
                value={formData.guardian.guardianPlace}
                onChange={(e) => handleInputChange('guardian.guardianPlace', e.target.value)}
                placeholder="Guardian's place"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="guardianContact"
                  value={formData.guardian.guardianContact}
                  onChange={(e) => handleInputChange('guardian.guardianContact', e.target.value)}
                  className={`pl-10 ${errors['guardian.guardianContact'] ? 'border-red-500' : ''}`}
                  placeholder="10-digit contact number"
                  maxLength={10}
                />
              </div>
              {errors['guardian.guardianContact'] && (
                <span className="text-sm text-red-500">{errors['guardian.guardianContact']}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
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
        <p className="text-sm text-orange-600 text-right">
          You have unsaved changes
        </p>
      )}
    </div>
  );
};