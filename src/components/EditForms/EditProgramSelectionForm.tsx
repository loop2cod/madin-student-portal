'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, BookOpen, Plus, X } from 'lucide-react';

interface ProgramSelectionFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
  saving: boolean;
}

const EditProgramSelectionForm: React.FC<ProgramSelectionFormProps> = ({
  applicationData,
  onSave,
  onChange,
  saving
}) => {
  const [programSelections, setProgramSelections] = useState<any[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (applicationData?.programSelections) {
      setProgramSelections(applicationData.programSelections);
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (programSelections.length === 0) {
      newErrors.programs = 'At least one program selection is required';
    }

    const selectedPrograms = programSelections.filter(p => p.selected);
    if (selectedPrograms.length === 0) {
      newErrors.selected = 'At least one program must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(programSelections);
    }
  };

  const handleProgramChange = (index: number, field: string, value: any) => {
    const updated = [...programSelections];
    updated[index] = { ...updated[index], [field]: value };
    setProgramSelections(updated);
    onChange();
    
    // Clear errors
    setErrors({});
  };

  const handleBranchPreferenceChange = (programIndex: number, branchIndex: number, field: string, value: any) => {
    const updated = [...programSelections];
    updated[programIndex].branchPreferences[branchIndex] = {
      ...updated[programIndex].branchPreferences[branchIndex],
      [field]: value
    };
    setProgramSelections(updated);
    onChange();
  };

  const addBranchPreference = (programIndex: number) => {
    const updated = [...programSelections];
    const newBranch = {
      branch: '',
      priority: (updated[programIndex].branchPreferences?.length || 0) + 1,
      _id: Date.now().toString()
    };
    updated[programIndex].branchPreferences = [...(updated[programIndex].branchPreferences || []), newBranch];
    setProgramSelections(updated);
    onChange();
  };

  const removeBranchPreference = (programIndex: number, branchIndex: number) => {
    const updated = [...programSelections];
    updated[programIndex].branchPreferences.splice(branchIndex, 1);
    // Reorder priorities
    updated[programIndex].branchPreferences.forEach((branch, index) => {
      branch.priority = index + 1;
    });
    setProgramSelections(updated);
    onChange();
  };

  const programs = {
    'engineering': ['Computer Science', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics Engineering'],
    'mba': ['MBA General', 'MBA Finance', 'MBA Marketing', 'MBA HR'],
    'architecture': ['Architecture']
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Program Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {programSelections.map((program, programIndex) => (
            <div key={programIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Program {programIndex + 1}</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`selected-${programIndex}`} className="text-sm">Selected</Label>
                  <input
                    id={`selected-${programIndex}`}
                    type="checkbox"
                    checked={program.selected}
                    onChange={(e) => handleProgramChange(programIndex, 'selected', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Program Level</Label>
                  <Select 
                    value={program.programLevel} 
                    onValueChange={(value) => handleProgramChange(programIndex, 'programLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ug">UG (Undergraduate)</SelectItem>
                      <SelectItem value="pg">PG (Postgraduate)</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program Name</Label>
                  <Select 
                    value={program.programName} 
                    onValueChange={(value) => handleProgramChange(programIndex, 'programName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="mba">MBA</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select 
                    value={program.mode} 
                    onValueChange={(value) => handleProgramChange(programIndex, 'mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branch Preferences */}
              {program.programName && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Branch Preferences</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBranchPreference(programIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Branch
                    </Button>
                  </div>
                  
                  {program.branchPreferences?.map((branch, branchIndex) => (
                    <div key={branchIndex} className="flex items-center space-x-2">
                      <Badge variant="outline" className="min-w-8 text-center">
                        {branch.priority}
                      </Badge>
                      <Select 
                        value={branch.branch} 
                        onValueChange={(value) => handleBranchPreferenceChange(programIndex, branchIndex, 'branch', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {(programs[program.programName as keyof typeof programs] || []).map((branchName) => (
                            <SelectItem key={branchName} value={branchName}>
                              {branchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBranchPreference(programIndex, branchIndex)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

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
              {saving ? 'Saving...' : 'Save Program Selection'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditProgramSelectionForm;