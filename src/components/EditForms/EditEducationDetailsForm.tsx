'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, GraduationCap, Plus, X } from 'lucide-react';

interface EducationDetailsFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
  saving: boolean;
}

const EditEducationDetailsForm: React.FC<EducationDetailsFormProps> = ({
  applicationData,
  onSave,
  onChange,
  saving
}) => {
  const [educationData, setEducationData] = useState<any[]>([]);
  const [entranceExams, setEntranceExams] = useState<any>({});
  const [achievements, setAchievements] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (applicationData?.educationDetails) {
      setEducationData(applicationData.educationDetails.educationData || []);
      setEntranceExams(applicationData.educationDetails.entranceExams || {});
      setAchievements(applicationData.educationDetails.achievements || '');
      setCollegeName(applicationData.educationDetails.collegeName || '');
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (educationData.length === 0) {
      newErrors.education = 'At least one education entry is required';
    }

    educationData.forEach((edu, index) => {
      if (!edu.examination) {
        newErrors[`examination_${index}`] = 'Examination is required';
      }
      if (!edu.passedFailed) {
        newErrors[`passedFailed_${index}`] = 'Passed/Failed status is required';
      }
      if (!edu.percentageMarks) {
        newErrors[`percentageMarks_${index}`] = 'Percentage marks is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const formData = {
        educationData,
        entranceExams,
        achievements,
        collegeName
      };
      onSave(formData);
    }
  };

  const addEducationEntry = () => {
    const newEntry = {
      examination: '',
      passedFailed: '',
      groupTrade: '',
      period: '',
      yearOfPass: '',
      percentageMarks: '',
      noOfChances: '',
      english: '',
      physics: '',
      chemistry: '',
      maths: '',
      boardUniversity: '',
      _id: Date.now().toString()
    };
    setEducationData([...educationData, newEntry]);
    onChange();
  };

  const removeEducationEntry = (index: number) => {
    const updated = [...educationData];
    updated.splice(index, 1);
    setEducationData(updated);
    onChange();
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...educationData];
    updated[index] = { ...updated[index], [field]: value };
    setEducationData(updated);
    onChange();
    
    // Clear error
    if (errors[`${field}_${index}`]) {
      setErrors(prev => ({ ...prev, [`${field}_${index}`]: '' }));
    }
  };

  const handleEntranceExamChange = (exam: string, field: string, value: any) => {
    setEntranceExams(prev => ({
      ...prev,
      [exam]: {
        ...prev[exam],
        [field]: value
      }
    }));
    onChange();
  };

  const examinations = [
    'SSLC', 'Plus Two', 'Diploma', 'Degree', 'Post Graduation'
  ];

  const subjects = [
    'Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Computer Science', 'Other'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Education Data */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Academic Qualifications</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducationEntry}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education Entry
                </Button>
              </div>

              {educationData.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">Education Entry {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducationEntry(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Examination *</Label>
                      <Select 
                        value={edu.examination} 
                        onValueChange={(value) => handleEducationChange(index, 'examination', value)}
                      >
                        <SelectTrigger className={errors[`examination_${index}`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select examination" />
                        </SelectTrigger>
                        <SelectContent>
                          {examinations.map((exam) => (
                            <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`examination_${index}`] && (
                        <p className="text-sm text-red-500">{errors[`examination_${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Passed/Failed *</Label>
                      <Select 
                        value={edu.passedFailed} 
                        onValueChange={(value) => handleEducationChange(index, 'passedFailed', value)}
                      >
                        <SelectTrigger className={errors[`passedFailed_${index}`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="appearing">Appearing</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors[`passedFailed_${index}`] && (
                        <p className="text-sm text-red-500">{errors[`passedFailed_${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Group/Trade/Subject</Label>
                      <Select 
                        value={edu.groupTrade} 
                        onValueChange={(value) => handleEducationChange(index, 'groupTrade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Input
                        value={edu.period}
                        onChange={(e) => handleEducationChange(index, 'period', e.target.value)}
                        placeholder="e.g., 2018-2021"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Year of Pass</Label>
                      <Input
                        value={edu.yearOfPass}
                        onChange={(e) => handleEducationChange(index, 'yearOfPass', e.target.value)}
                        placeholder="e.g., 2021"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Percentage of Marks *</Label>
                      <Input
                        value={edu.percentageMarks}
                        onChange={(e) => handleEducationChange(index, 'percentageMarks', e.target.value)}
                        placeholder="e.g., 85"
                        className={errors[`percentageMarks_${index}`] ? 'border-red-500' : ''}
                      />
                      {errors[`percentageMarks_${index}`] && (
                        <p className="text-sm text-red-500">{errors[`percentageMarks_${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Board/University</Label>
                      <Input
                        value={edu.boardUniversity}
                        onChange={(e) => handleEducationChange(index, 'boardUniversity', e.target.value)}
                        placeholder="Enter board/university"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Entrance Exams */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Entrance Examinations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['kmat', 'cmat', 'cat'].map((exam) => (
                  <div key={exam} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={exam}
                        checked={entranceExams[exam]?.selected || false}
                        onChange={(e) => handleEntranceExamChange(exam, 'selected', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <Label htmlFor={exam} className="font-medium">
                        {exam.toUpperCase()}
                      </Label>
                    </div>
                    {entranceExams[exam]?.selected && (
                      <div className="space-y-2">
                        <Label>Score</Label>
                        <Input
                          value={entranceExams[exam]?.score || ''}
                          onChange={(e) => handleEntranceExamChange(exam, 'score', e.target.value)}
                          placeholder="Enter score"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Achievements/Work Experience</Label>
                <Textarea
                  value={achievements}
                  onChange={(e) => {
                    setAchievements(e.target.value);
                    onChange();
                  }}
                  placeholder="Enter any achievements or work experience"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>College Name (UG)</Label>
                <Input
                  value={collegeName}
                  onChange={(e) => {
                    setCollegeName(e.target.value);
                    onChange();
                  }}
                  placeholder="Enter college name for undergraduate studies"
                />
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                {Object.values(errors).map((error, index) => (
                  <p key={index} className="text-sm text-red-600">{error}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Education Details'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEducationDetailsForm;