'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  type: 'diploma' | 'mba';
  description: string;
  modes?: ('Regular' | 'Part-time' | 'LET')[];
}

interface ProgramSelectionProps {
  formData: {
    programLevel: 'diploma' | 'mba' | '';
    programName: string;
    mode?: 'Regular' | 'Part-time' | 'LET';
    specialization?: string;
    branchPreferences?: Array<{
      branch: string;
      priority: number;
    }>;
  };
  onUpdate: (field: string, value: any) => void;
}

const programs: Program[] = [
  {
    id: 'diploma-engineering',
    name: 'Diploma in Engineering',
    type: 'diploma',
    description: 'Three-year diploma program in various engineering disciplines',
    modes: ['Regular', 'Part-time', 'LET']
  },
  {
    id: 'mba',
    name: 'Master of Business Administration (MBA)',
    type: 'mba',
    description: 'Two-year postgraduate program in business administration'
  }
];

const branches = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical and Electronics Engineering',
  'Computer Engineering',
  'Automobile Engineering',
  'Architecture'
];

const mbaSpecializations = [
  'Finance',
  'Marketing',
  'Human Resources',
  'Operations Management',
  'Information Technology',
  'International Business'
];

export const QuickAdmissionProgramSelection: React.FC<ProgramSelectionProps> = ({
  formData,
  onUpdate
}) => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    diploma: true,
    mba: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProgramSelect = (program: Program) => {
    onUpdate('programLevel', program.type);
    onUpdate('programName', program.name);
    
    // Reset dependent fields
    onUpdate('mode', undefined);
    onUpdate('specialization', undefined);
    onUpdate('branchPreferences', []);
  };

  const handleModeSelect = (mode: 'Regular' | 'Part-time' | 'LET') => {
    onUpdate('mode', mode);
    // Reset branch preferences when mode changes
    onUpdate('branchPreferences', []);
  };

  const handleBranchToggle = (branch: string, checked: boolean) => {
    const currentBranches = formData.branchPreferences || [];
    
    if (checked) {
      const newBranches = [...currentBranches, {
        branch,
        priority: currentBranches.length + 1
      }];
      onUpdate('branchPreferences', newBranches);
    } else {
      const newBranches = currentBranches
        .filter(b => b.branch !== branch)
        .map((b, index) => ({ ...b, priority: index + 1 }));
      onUpdate('branchPreferences', newBranches);
    }
  };

  const selectedProgram = programs.find(p => p.name === formData.programName);
  const selectedBranches = formData.branchPreferences?.map(b => b.branch) || [];

  return (
    <div className="space-y-6">
      {/* Program Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Program Type</h3>
        
        {/* Diploma Programs */}
        <Card className="border-2 hover:border-[#001c67]/20 transition-colors">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('diploma')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Diploma Programs</CardTitle>
                <CardDescription>Three-year engineering diploma programs</CardDescription>
              </div>
              {expandedSections.diploma ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.diploma && (
            <CardContent>
              <RadioGroup
                value={formData.programLevel === 'diploma' ? formData.programName : ''}
                onValueChange={(value) => {
                  const program = programs.find(p => p.name === value);
                  if (program) handleProgramSelect(program);
                }}
              >
                {programs.filter(p => p.type === 'diploma').map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={program.name} id={program.id} />
                    <Label htmlFor={program.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-gray-500">{program.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          )}
        </Card>

        {/* MBA Programs */}
        <Card className="border-2 hover:border-[#001c67]/20 transition-colors">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => toggleSection('mba')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">MBA Programs</CardTitle>
                <CardDescription>Two-year postgraduate business programs</CardDescription>
              </div>
              {expandedSections.mba ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </CardHeader>
          
          {expandedSections.mba && (
            <CardContent>
              <RadioGroup
                value={formData.programLevel === 'mba' ? formData.programName : ''}
                onValueChange={(value) => {
                  const program = programs.find(p => p.name === value);
                  if (program) handleProgramSelect(program);
                }}
              >
                {programs.filter(p => p.type === 'mba').map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={program.name} id={program.id} />
                    <Label htmlFor={program.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-gray-500">{program.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Mode Selection for Diploma */}
      {formData.programLevel === 'diploma' && selectedProgram && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Mode</CardTitle>
            <CardDescription>Choose the mode of study for the diploma program</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.mode || ''}
              onValueChange={(value) => handleModeSelect(value as 'Regular' | 'Part-time' | 'LET')}
            >
              {selectedProgram.modes?.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={mode} />
                  <Label htmlFor={mode} className="cursor-pointer">
                    {mode}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Branch Selection for Diploma */}
      {formData.programLevel === 'diploma' && formData.mode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Branch Preferences</CardTitle>
            <CardDescription>
              Choose your preferred engineering branches (you can select multiple)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch) => (
                <div key={branch} className="flex items-center space-x-2">
                  <Checkbox
                    id={branch}
                    checked={selectedBranches.includes(branch)}
                    onCheckedChange={(checked) => handleBranchToggle(branch, checked as boolean)}
                  />
                  <Label htmlFor={branch} className="cursor-pointer text-sm">
                    {branch}
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedBranches.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Branches:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.branchPreferences?.map((branch, index) => (
                    <Badge key={branch.branch} variant="secondary">
                      {index + 1}. {branch.branch}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Specialization for MBA */}
      {formData.programLevel === 'mba' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MBA Specialization</CardTitle>
            <CardDescription>Choose your area of specialization (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.specialization || ''}
              onValueChange={(value) => onUpdate('specialization', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="no-specialization" />
                <Label htmlFor="no-specialization" className="cursor-pointer">
                  No specific specialization
                </Label>
              </div>
              {mbaSpecializations.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <RadioGroupItem value={spec} id={spec} />
                  <Label htmlFor={spec} className="cursor-pointer">
                    {spec}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
