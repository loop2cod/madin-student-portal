'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { post, get } from '@/utilities/AxiosInterceptor';
import { toast } from '@/components/ui/use-toast';

interface CertificateRequestFormProps {
  onRequestSubmitted: () => void;
}

interface StudentData {
  name: string;
  admissionNumber: string;
  department: string;
  email: string;
}

export function CertificateRequestForm({ onRequestSubmitted }: CertificateRequestFormProps) {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    certificateType: '',
    purpose: '',
    priorityLevel: 'normal',
    deliveryMethod: 'download',
    remarks: ''
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await get<{ success: boolean; data: StudentData }>('/api/v1/auth/profile');
      if (response.success) {
        setStudent(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await post<any>('/api/v1/certificates/request', formData);
      if (response.success) {
        onRequestSubmitted();
      }
    } catch (error: any) {
      console.error('Request submission failed:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit certificate request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Information Display */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Name</Label>
                <p className="font-semibold">{student.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Admission Number</Label>
                <p className="font-semibold">{student.admissionNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Department</Label>
                <p className="font-semibold">{student.department}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="font-semibold">{student.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificateType">Certificate Type *</Label>
              <Select 
                value={formData.certificateType} 
                onValueChange={(value) => handleInputChange('certificateType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                  <SelectItem value="fee_certificate">Fee Certificate</SelectItem>
                  <SelectItem value="medium_of_instruction">Medium of Instruction Certificate</SelectItem>
                  <SelectItem value="letter_of_recommendation">Letter of Recommendation</SelectItem>
                  <SelectItem value="course_conduct_certificate">Course and Conduct Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="e.g., apply bank loan, scholarship application, etc."
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Options */}
      <Card>
        <CardHeader>
          <CardTitle>Request Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Priority Level</Label>
              <RadioGroup 
                value={formData.priorityLevel} 
                onValueChange={(value) => handleInputChange('priorityLevel', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Normal (7-10 working days)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent">Urgent (3-5 working days)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Delivery Method</Label>
              <RadioGroup 
                value={formData.deliveryMethod} 
                onValueChange={(value) => handleInputChange('deliveryMethod', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="download" id="download" />
                  <Label htmlFor="download">Digital Download</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup">Physical Pickup</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div>
            <Label htmlFor="remarks">Additional Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Any additional information or special requirements"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.certificateType || !formData.purpose}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}