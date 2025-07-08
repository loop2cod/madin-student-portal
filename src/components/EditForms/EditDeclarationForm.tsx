'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, FileText, Check } from 'lucide-react';

interface DeclarationFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
  saving: boolean;
}

const EditDeclarationForm: React.FC<DeclarationFormProps> = ({
  applicationData,
  onSave,
  onChange,
  saving
}) => {
  const [agreed, setAgreed] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (applicationData?.declaration) {
      setAgreed(applicationData.declaration.agreed || false);
      setDigitalSignature(applicationData.declaration.digitalSignature || '');
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!agreed) {
      newErrors.agreed = 'You must agree to the declaration to proceed';
    }

    if (!digitalSignature.trim()) {
      newErrors.digitalSignature = 'Digital signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const formData = {
        agreed,
        digitalSignature,
        agreedAt: new Date().toISOString()
      };
      onSave(formData);
    }
  };

  const handleAgreedChange = (value: boolean) => {
    setAgreed(value);
    onChange();
    
    if (errors.agreed) {
      setErrors(prev => ({ ...prev, agreed: '' }));
    }
  };

  const handleDigitalSignatureChange = (value: string) => {
    setDigitalSignature(value);
    onChange();
    
    if (errors.digitalSignature) {
      setErrors(prev => ({ ...prev, digitalSignature: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Declaration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Declaration Text */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Declaration Statement</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                I hereby declare that all the information provided in this application is true and accurate to the best of my knowledge and belief.
              </p>
              <p>
                I understand that any false or misleading information may result in the rejection of my application or cancellation of admission if discovered at any stage.
              </p>
              <p>
                I agree to abide by the rules, regulations, and policies of the institution as may be in force from time to time.
              </p>
              <p>
                I understand that the institution reserves the right to verify any information provided in this application.
              </p>
              <p>
                I acknowledge that the admission process is subject to the availability of seats and merit-based selection criteria.
              </p>
              <p>
                I understand that the payment of application fees does not guarantee admission to the institution.
              </p>
              <p>
                I agree to inform the institution immediately of any changes to the information provided in this application.
              </p>
              <p>
                I understand that the institution's decision on admission matters is final and binding.
              </p>
            </div>
          </div>

          {/* Digital Signature */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="digitalSignature">Digital Signature *</Label>
              <Input
                id="digitalSignature"
                value={digitalSignature}
                onChange={(e) => handleDigitalSignatureChange(e.target.value)}
                placeholder="Enter your full name as digital signature"
                className={errors.digitalSignature ? 'border-red-500' : ''}
              />
              {errors.digitalSignature && (
                <p className="text-sm text-red-500">{errors.digitalSignature}</p>
              )}
              <p className="text-sm text-gray-600">
                By typing your name above, you are providing your digital signature to this declaration.
              </p>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreed"
                checked={agreed}
                onCheckedChange={handleAgreedChange}
                className={errors.agreed ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="agreed" 
                  className={`text-sm font-medium cursor-pointer ${errors.agreed ? 'text-red-500' : 'text-gray-900'}`}
                >
                  I agree to the above declaration and confirm that all information provided is accurate *
                </Label>
                {errors.agreed && (
                  <p className="text-sm text-red-500">{errors.agreed}</p>
                )}
              </div>
            </div>
          </div>

          {/* Current Status */}
          {applicationData?.declaration?.agreed && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-green-800">
                <Check className="w-5 h-5" />
                <span className="font-medium">Declaration Previously Agreed</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Original signature: {applicationData.declaration.digitalSignature}
              </p>
              {applicationData.declaration.agreedAt && (
                <p className="text-sm text-green-700">
                  Agreed on: {new Date(applicationData.declaration.agreedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Declaration'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditDeclarationForm;