'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, MapPin, Users, Home, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Address Information
    houseNumber: "",
    street: "",
    postOffice: "",
    pinCode: "",
    district: "",
    state: "",
    country: "India",

    // Parents Information
    fatherName: "",
    fatherMobile: "",
    motherName: "",
    motherMobile: "",

    // Guardian Information
    guardianName: "",
    guardianPlace: "",
    guardianContact: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [postOffices, setPostOffices] = useState([]);
  const [sameAsFather, setSameAsFather] = useState(false);
  const [sameAsMother, setSameAsMother] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchExistingData = async () => {
      if (!applicationData) return;

      setIsLoading(true);
      try {
        if (applicationData?.addressFamilyDetails) {
          const details = applicationData.addressFamilyDetails;
          // Extract data from nested structure if it exists
          const address = details.address || {};
          const parents = details.parents || {};
          const guardian = details.guardian || {};

          setFormData({
            // Address Information
            houseNumber: address.houseNumber || "",
            street: address.street || "",
            postOffice: address.postOffice || "",
            pinCode: address.pinCode || "",
            district: address.district || "",
            state: address.state || "",
            country: address.country || "India",

            // Parents Information
            fatherName: parents.fatherName || "",
            fatherMobile: parents.fatherMobile || "",
            motherName: parents.motherName || "",
            motherMobile: parents.motherMobile || "",

            // Guardian Information
            guardianName: guardian.guardianName || "",
            guardianPlace: guardian.guardianPlace || "",
            guardianContact: guardian.guardianContact || ""
          });
        }
      } catch (error: any) {
        console.error("Error fetching application data:", error);
        toast({
          title: "Error",
          description: "Failed to load existing address and family details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [applicationData, toast]);

  // Validate Indian mobile number
  const validateIndianMobile = (mobile: string) => {
    // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(mobile);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleMobileChange = (field: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');

    // Limit to 10 digits
    if (numericValue.length <= 10) {
      handleInputChange(field, numericValue);

      // Validate if exactly 10 digits
      if (numericValue.length === 10 && !validateIndianMobile(numericValue)) {
        toast({
          title: "Invalid Mobile Number",
          description: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
          variant: "destructive",
        });
      }
    }
  };

  const handleSameAsFatherChange = (checked: boolean) => {
    setSameAsFather(checked);
    if (checked) {
      setSameAsMother(false); // Uncheck mother option
      setFormData(prev => ({
        ...prev,
        guardianName: prev.fatherName,
        guardianContact: prev.fatherMobile,
        guardianPlace: "" // You can set this to a default value if needed
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        guardianName: "",
        guardianContact: "",
        guardianPlace: ""
      }));
    }
    setHasChanges(true);
  };

  const handleSameAsMotherChange = (checked: boolean) => {
    setSameAsMother(checked);
    if (checked) {
      setSameAsFather(false); // Uncheck father option
      setFormData(prev => ({
        ...prev,
        guardianName: prev.motherName,
        guardianContact: prev.motherMobile,
        guardianPlace: "" // You can set this to a default value if needed
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        guardianName: "",
        guardianContact: "",
        guardianPlace: ""
      }));
    }
    setHasChanges(true);
  };

  // Function to fetch address details from PIN code
  const fetchAddressFromPincode = useCallback(async (pincode: string) => {
    if (pincode.length !== 6) return;

    setIsLoadingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data[0].Status === 'Success') {
        const postOfficeList = data[0].PostOffice;

        // Filter out non-delivery post offices for better UX
        const deliveryOffices = postOfficeList.filter((office: any) => office.DeliveryStatus === 'Delivery');
        const availableOffices = deliveryOffices.length > 0 ? deliveryOffices : postOfficeList;

        setPostOffices(availableOffices);

        // Auto-fill with first post office if only one exists
        if (availableOffices.length === 1) {
          const postOffice = availableOffices[0];
          setFormData(prev => ({
            ...prev,
            district: postOffice.District || '',
            state: postOffice.State || '',
            postOffice: postOffice.Name || ''
          }));
        } else {
          // Clear post office selection if multiple options exist
          // But still fill district and state from first entry
          const firstOffice = availableOffices[0];
          setFormData(prev => ({
            ...prev,
            district: firstOffice.District || '',
            state: firstOffice.State || '',
            postOffice: '' // Clear to let user select
          }));
        }

        if (availableOffices.length > 1) {
          toast({
            title: "Multiple Post Offices Found",
            description: `Found ${availableOffices.length} post offices. Please select your preferred one.`,
          });
        }
      } else {
        setPostOffices([]);
        toast({
          title: "Invalid PIN Code",
          description: "Invalid PIN code. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
      setPostOffices([]);
      toast({
        title: "Error",
        description: "Failed to fetch address details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPincode(false);
    }
  }, [toast]);

  // Effect to trigger address lookup when PIN code changes
  useEffect(() => {
    if (formData.pinCode.length === 6) {
      fetchAddressFromPincode(formData.pinCode);
    }
  }, [formData.pinCode, fetchAddressFromPincode]);

  const validateForm = (): boolean => {
    // Validate mobile numbers before submission
    const mobileFields = [
      { field: 'fatherMobile', name: "Father's mobile number" },
      { field: 'motherMobile', name: "Mother's mobile number" }
    ];

    // Add guardian contact if it's filled
    if (formData.guardianContact) {
      mobileFields.push({ field: 'guardianContact', name: "Guardian's contact number" });
    }

    for (const { field, name } of mobileFields) {
      const mobile = formData[field as keyof typeof formData];
      if (mobile && mobile.length === 10 && !validateIndianMobile(mobile)) {
        toast({
          title: "Invalid Mobile Number",
          description: `${name} must be a valid Indian mobile number starting with 6, 7, 8, or 9`,
          variant: "destructive",
        });
        return false;
      }
      if (mobile && mobile.length > 0 && mobile.length !== 10) {
        toast({
          title: "Invalid Mobile Number",
          description: `${name} must be exactly 10 digits`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Structure the payload according to the schema
      const addressFamilyDetails = {
        address: {
          houseNumber: formData.houseNumber,
          street: formData.street,
          postOffice: formData.postOffice,
          pinCode: formData.pinCode,
          district: formData.district,
          state: formData.state,
          country: formData.country
        },
        parents: {
          fatherName: formData.fatherName,
          fatherMobile: formData.fatherMobile,
          motherName: formData.motherName,
          motherMobile: formData.motherMobile
        },
        guardian: {
          guardianName: formData.guardianName,
          guardianPlace: formData.guardianPlace,
          guardianContact: formData.guardianContact
        }
      };

      onSave(addressFamilyDetails);
      setHasChanges(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Address & Family Details</h1>
        <p className="text-gray-700 text-sm leading-relaxed">
          Please fill in your address and family information
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-3 text-gray-700">Loading your information...</span>
        </div>
      ) : (
        <>
          {/* Address Information */}
          <Card className="border border-gray-200 rounded-none px-2 py-3 gap-0">
            <CardHeader className="px-2 py-0">
              <CardTitle className="text-base">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-2 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="text-sm font-medium">
                    House Name/Number*
                  </Label>
                  <Input
                    id="houseNumber"
                    placeholder="Enter house"
                    value={formData.houseNumber}
                    onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium">
                    Place/Street*
                  </Label>
                  <Input
                    id="street"
                    placeholder="Enter place/street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pinCode" className="text-sm font-medium">
                    PIN Code*
                  </Label>
                  <div className="relative">
                    <Input
                      id="pinCode"
                      placeholder="Enter PIN code"
                      value={formData.pinCode}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange("pinCode", value);
                      }}
                      className="rounded-none"
                      maxLength={6}
                      onBlur={(e) => {
                        if (e.target.value.length === 6) {
                          fetchAddressFromPincode(e.target.value);
                        }
                      }}
                      disabled={saving || isLoadingPincode}
                    />
                    {isLoadingPincode && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-secondary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postOffice" className="text-sm font-medium">
                    Post Office*
                    {isLoadingPincode && (
                      <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                    )}
                  </Label>
                  {postOffices.length > 1 ? (
                    <Select
                      value={formData.postOffice}
                      onValueChange={(value) => handleInputChange("postOffice", value)}
                      disabled={saving || isLoadingPincode}
                    >
                      <SelectTrigger className="w-full rounded-none">
                        <SelectValue placeholder="Select post office" />
                      </SelectTrigger>
                      <SelectContent>
                        {postOffices.map((office: any) => (
                          <SelectItem key={`${office.Name}-${office.BranchType}`} value={office.Name}>
                            {office.Name} ({office.BranchType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="postOffice"
                      placeholder="Enter post office or PIN code to auto-fill"
                      value={formData.postOffice}
                      onChange={(e) => handleInputChange("postOffice", e.target.value)}
                      className="rounded-none"
                      disabled={saving || isLoadingPincode}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">
                    District*
                  </Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State*
                  </Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2 cursor-not-allowed">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country*
                  </Label>
                  <Input
                    id="country"
                    disabled
                    value="India"
                    className="rounded-none cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parents Information */}
          <Card className="border border-gray-200 rounded-none px-2 py-3 gap-0">
            <CardHeader className="px-2 py-0">
              <CardTitle className="text-base">Parents Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-2 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fatherName" className="text-sm font-medium">
                    Father&apos;s Name*
                  </Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange("fatherName", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherMobile" className="text-sm font-medium">
                    Father&apos;s Mobile Number*
                  </Label>
                  <Input
                    id="fatherMobile"
                    placeholder="Enter father's mobile (10 digits)"
                    value={formData.fatherMobile}
                    onChange={(e) => handleMobileChange("fatherMobile", e.target.value)}
                    className={`rounded-none ${formData.fatherMobile && formData.fatherMobile.length === 10 && !validateIndianMobile(formData.fatherMobile) ? 'border-red-500 focus:border-red-500' : ''}`}
                    maxLength={10}
                    disabled={saving}
                  />
                </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <div className="space-y-2">
                   <Label htmlFor="motherName" className="text-sm font-medium">
                     Mother&apos;s Name*
                   </Label>
                  <Input
                    id="motherName"
                    placeholder="Enter mother's name"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange("motherName", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherMobile" className="text-sm font-medium">
                    Mother&apos;s Mobile Number*
                  </Label>
                  <Input
                    id="motherMobile"
                    placeholder="Enter mother's mobile (10 digits)"
                    value={formData.motherMobile}
                    onChange={(e) => handleMobileChange("motherMobile", e.target.value)}
                    className={`rounded-none ${formData.motherMobile && formData.motherMobile.length === 10 && !validateIndianMobile(formData.motherMobile) ? 'border-red-500 focus:border-red-500' : ''}`}
                    maxLength={10}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card className="border border-gray-200 rounded-none px-2 py-3 gap-0">
            <CardHeader className="px-2 py-0">
              <CardTitle className="text-base">Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-2 py-3">
              {/* Checkboxes to copy parent information */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsFather"
                    checked={sameAsFather}
                    onCheckedChange={handleSameAsFatherChange}
                    disabled={saving || !formData.fatherName || !formData.fatherMobile}
                  />
                  <Label
                    htmlFor="sameAsFather"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Same as Father&apos;s Information
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsMother"
                    checked={sameAsMother}
                    onCheckedChange={handleSameAsMotherChange}
                    disabled={saving || !formData.motherName || !formData.motherMobile}
                  />
                  <Label
                    htmlFor="sameAsMother"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Same as Mother&apos;s Information
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="guardianName"
                    placeholder="Enter name"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange("guardianName", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPlace" className="text-sm font-medium">
                    Place
                  </Label>
                  <Input
                    id="guardianPlace"
                    placeholder="Enter place"
                    value={formData.guardianPlace}
                    onChange={(e) => handleInputChange("guardianPlace", e.target.value)}
                    className="rounded-none"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianContact" className="text-sm font-medium">
                  Contact Number
                </Label>
                <Input
                  id="guardianContact"
                  placeholder="Enter contact (10 digits)"
                  value={formData.guardianContact}
                  onChange={(e) => handleMobileChange("guardianContact", e.target.value)}
                  className={`rounded-none ${formData.guardianContact && formData.guardianContact.length === 10 && !validateIndianMobile(formData.guardianContact) ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={10}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
            >
              <Save className="w-3 h-3 mr-2" />
              {saving ? 'Saving...' : 'Save Address & Family Details'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};