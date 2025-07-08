'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, MapPin, Users } from 'lucide-react';

interface AddressAndFamilyFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
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

const EditAddressAndFamilyForm: React.FC<AddressAndFamilyFormProps> = ({
  applicationData,
  onSave,
  onChange,
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

  useEffect(() => {
    if (applicationData?.addressFamilyDetails) {
      setFormData({
        address: {
          houseNumber: applicationData.addressFamilyDetails.address?.houseNumber || '',
          street: applicationData.addressFamilyDetails.address?.street || '',
          postOffice: applicationData.addressFamilyDetails.address?.postOffice || '',
          pinCode: applicationData.addressFamilyDetails.address?.pinCode || '',
          district: applicationData.addressFamilyDetails.address?.district || '',
          state: applicationData.addressFamilyDetails.address?.state || '',
          country: applicationData.addressFamilyDetails.address?.country || 'India'
        },
        parents: {
          fatherName: applicationData.addressFamilyDetails.parents?.fatherName || '',
          fatherMobile: applicationData.addressFamilyDetails.parents?.fatherMobile || '',
          motherName: applicationData.addressFamilyDetails.parents?.motherName || '',
          motherMobile: applicationData.addressFamilyDetails.parents?.motherMobile || ''
        },
        guardian: {
          guardianName: applicationData.addressFamilyDetails.guardian?.guardianName || '',
          guardianPlace: applicationData.addressFamilyDetails.guardian?.guardianPlace || '',
          guardianContact: applicationData.addressFamilyDetails.guardian?.guardianContact || ''
        }
      });
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Address validation
    if (!formData.address.houseNumber.trim()) {
      newErrors.houseNumber = 'House number is required';
    }

    if (!formData.address.street.trim()) {
      newErrors.street = 'Street is required';
    }

    if (!formData.address.postOffice.trim()) {
      newErrors.postOffice = 'Post office is required';
    }

    if (!formData.address.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.address.pinCode)) {
      newErrors.pinCode = 'PIN code must be 6 digits';
    }

    if (!formData.address.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Parents validation
    if (!formData.parents.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required';
    }

    if (!formData.parents.fatherMobile.trim()) {
      newErrors.fatherMobile = 'Father mobile is required';
    } else if (!/^\d{10}$/.test(formData.parents.fatherMobile)) {
      newErrors.fatherMobile = 'Father mobile must be 10 digits';
    }

    if (!formData.parents.motherName.trim()) {
      newErrors.motherName = 'Mother name is required';
    }

    if (!formData.parents.motherMobile.trim()) {
      newErrors.motherMobile = 'Mother mobile is required';
    } else if (!/^\d{10}$/.test(formData.parents.motherMobile)) {
      newErrors.motherMobile = 'Mother mobile must be 10 digits';
    }

    // Guardian validation (optional fields)
    if (formData.guardian.guardianContact && !/^\d{10}$/.test(formData.guardian.guardianContact)) {
      newErrors.guardianContact = 'Guardian contact must be 10 digits';
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

  const handleInputChange = (section: keyof AddressAndFamilyData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    onChange();
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi', 'Puducherry',
    'Ladakh', 'Jammu and Kashmir'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number *</Label>
                <Input
                  id="houseNumber"
                  value={formData.address.houseNumber}
                  onChange={(e) => handleInputChange('address', 'houseNumber', e.target.value)}
                  placeholder="Enter house number"
                  className={errors.houseNumber ? 'border-red-500' : ''}
                />
                {errors.houseNumber && <p className="text-sm text-red-500">{errors.houseNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street *</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  placeholder="Enter street name"
                  className={errors.street ? 'border-red-500' : ''}
                />
                {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postOffice">Post Office *</Label>
                <Input
                  id="postOffice"
                  value={formData.address.postOffice}
                  onChange={(e) => handleInputChange('address', 'postOffice', e.target.value)}
                  placeholder="Enter post office"
                  className={errors.postOffice ? 'border-red-500' : ''}
                />
                {errors.postOffice && <p className="text-sm text-red-500">{errors.postOffice}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code *</Label>
                <Input
                  id="pinCode"
                  value={formData.address.pinCode}
                  onChange={(e) => handleInputChange('address', 'pinCode', e.target.value)}
                  placeholder="Enter PIN code"
                  className={errors.pinCode ? 'border-red-500' : ''}
                />
                {errors.pinCode && <p className="text-sm text-red-500">{errors.pinCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.address.district}
                  onChange={(e) => handleInputChange('address', 'district', e.target.value)}
                  placeholder="Enter district"
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.address.state} onValueChange={(value) => handleInputChange('address', 'state', value)}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Parents Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Parents Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    value={formData.parents.fatherName}
                    onChange={(e) => handleInputChange('parents', 'fatherName', e.target.value)}
                    placeholder="Enter father's name"
                    className={errors.fatherName ? 'border-red-500' : ''}
                  />
                  {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherMobile">Father's Mobile *</Label>
                  <Input
                    id="fatherMobile"
                    value={formData.parents.fatherMobile}
                    onChange={(e) => handleInputChange('parents', 'fatherMobile', e.target.value)}
                    placeholder="Enter father's mobile"
                    className={errors.fatherMobile ? 'border-red-500' : ''}
                  />
                  {errors.fatherMobile && <p className="text-sm text-red-500">{errors.fatherMobile}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name *</Label>
                  <Input
                    id="motherName"
                    value={formData.parents.motherName}
                    onChange={(e) => handleInputChange('parents', 'motherName', e.target.value)}
                    placeholder="Enter mother's name"
                    className={errors.motherName ? 'border-red-500' : ''}
                  />
                  {errors.motherName && <p className="text-sm text-red-500">{errors.motherName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherMobile">Mother's Mobile *</Label>
                  <Input
                    id="motherMobile"
                    value={formData.parents.motherMobile}
                    onChange={(e) => handleInputChange('parents', 'motherMobile', e.target.value)}
                    placeholder="Enter mother's mobile"
                    className={errors.motherMobile ? 'border-red-500' : ''}
                  />
                  {errors.motherMobile && <p className="text-sm text-red-500">{errors.motherMobile}</p>}
                </div>
              </div>
            </div>

            {/* Guardian Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Guardian Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardian.guardianName}
                    onChange={(e) => handleInputChange('guardian', 'guardianName', e.target.value)}
                    placeholder="Enter guardian name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPlace">Guardian Place</Label>
                  <Input
                    id="guardianPlace"
                    value={formData.guardian.guardianPlace}
                    onChange={(e) => handleInputChange('guardian', 'guardianPlace', e.target.value)}
                    placeholder="Enter guardian place"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianContact">Guardian Contact</Label>
                  <Input
                    id="guardianContact"
                    value={formData.guardian.guardianContact}
                    onChange={(e) => handleInputChange('guardian', 'guardianContact', e.target.value)}
                    placeholder="Enter guardian contact"
                    className={errors.guardianContact ? 'border-red-500' : ''}
                  />
                  {errors.guardianContact && <p className="text-sm text-red-500">{errors.guardianContact}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Address & Family Details'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAddressAndFamilyForm;