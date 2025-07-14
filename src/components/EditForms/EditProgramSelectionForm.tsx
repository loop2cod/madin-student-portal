'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProgramSelectionFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  onChange: () => void;
  saving: boolean;
}

interface Program {
  id: string;
  name: string;
  type: 'diploma' | 'mba';
  description: string;
  modes?: ('Regular' | 'Part-time' | 'LET')[]; // Only for diploma programs
}

const BRANCHES = {
  REGULAR: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical and Electronics Engineering",
    "Computer Engineering",
    "Automobile Engineering",
    "Architecture"
  ],
  PART_TIME: [
    "Electrical and Electronics Engineering",
  ],
  LET: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical and Electronics Engineering",
    "Computer Engineering",
    "Automobile Engineering"
  ]
};

const EditProgramSelectionForm: React.FC<ProgramSelectionFormProps> = ({
  applicationData,
  onSave,
  onChange,
  saving
}) => {
  const [selectedProgramType, setSelectedProgramType] = useState<'diploma' | 'mba' | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'Regular' | 'Part-time' | 'LET' | null>(null);
  const [branchSelections, setBranchSelections] = useState<{
    Regular: string[];
    'Part-time': string[];
    LET: string[];
  }>({
    Regular: [],
    'Part-time': [],
    LET: []
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const selectedBranches = selectedMode ? branchSelections[selectedMode] : [];

  const programs: Program[] = [
    {
      id: 'diploma-eng',
      name: 'Diploma in Engineering',
      type: 'diploma',
      description: '3-year technical diploma program',
      modes: ['Regular', 'Part-time', 'LET']
    },
    {
      id: 'mba-regular',
      name: 'MBA (Regular)',
      type: 'mba',
      description: '2-year master of business administration'
    }
  ];

  useEffect(() => {
    if (applicationData?.programSelections && applicationData.programSelections.length > 0) {
      const selection = applicationData.programSelections[0];

      // Set program type
      if (selection.programLevel === 'diploma') {
        setSelectedProgramType('diploma');

        // Find the matching program ID
        const diplomaProgram = programs.find(p =>
          p.type === 'diploma' && p.name === selection.programName
        );

        if (diplomaProgram) {
          setSelectedProgram(diplomaProgram.id);
        }

        // Set mode if it exists
        if (selection.mode) {
          setSelectedMode(selection.mode as 'Regular' | 'Part-time' | 'LET');
        }

        // Set branch preferences if they exist
        if (selection.branchPreferences && selection.branchPreferences.length > 0 && selection.mode) {
          const sortedBranches = [...selection.branchPreferences]
            .sort((a, b) => a.priority - b.priority)
            .map(bp => bp.branch);

          setBranchSelections(prev => ({
            ...prev,
            [selection.mode]: sortedBranches
          }));
        }
      } else if (selection.programLevel === 'mba') {
        setSelectedProgramType('mba');

        const mbaProgram = programs.find(p =>
          p.type === 'mba' && p.name === selection.programName
        );

        if (mbaProgram) {
          setSelectedProgram(mbaProgram.id);
        }
      }
    }
  }, [applicationData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedProgramType) {
      newErrors.programType = 'Please select a program type';
    }

    if (!selectedProgram) {
      newErrors.program = 'Please select a program';
    }

    if (selectedProgramType === 'diploma' && !selectedMode) {
      newErrors.mode = 'Please select a mode for diploma program';
    }

    if (selectedProgramType === 'diploma' && selectedMode && selectedBranches.length === 0) {
      newErrors.branches = 'Please select at least one branch preference';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const selectedProgramDetails = programs.find(p => p.id === selectedProgram);
      if (!selectedProgramDetails) return;

      let programSelections = [];

      if (selectedProgramType === 'diploma') {
        const branchPreferences = selectedBranches.map((branch, index) => ({
          branch,
          priority: index + 1
        }));

        programSelections.push({
          programLevel: 'diploma',
          programName: selectedProgramDetails.name,
          mode: selectedMode,
          branchPreferences,
          selected: true,
          priority: 1
        });
      } else if (selectedProgramType === 'mba') {
        programSelections.push({
          programLevel: 'mba',
          programName: selectedProgramDetails.name,
          specialization: "General",
          selected: true,
          priority: 1
        });
      }

      onSave(programSelections);
    }
  };

  const handleProgramTypeSelect = (type: 'diploma' | 'mba') => {
    setSelectedProgramType(type);
    setSelectedProgram('');
    setSelectedMode(null);
    if (type === 'mba') {
      setBranchSelections({
        Regular: [],
        'Part-time': [],
        LET: []
      });
    }
    onChange();
    setErrors({});
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    setSelectedMode(null);
    onChange();
  };

  const handleModeSelect = (mode: 'Regular' | 'Part-time' | 'LET') => {
    setSelectedMode(mode);
    onChange();
  };

  const handleBranchToggle = (branch: string) => {
    if (!selectedMode) return;

    setBranchSelections(prev => {
      const currentBranches = prev[selectedMode];
      const isSelected = currentBranches.includes(branch);

      let newBranches;
      if (isSelected) {
        newBranches = currentBranches.filter(b => b !== branch);
      } else {
        newBranches = [...currentBranches, branch];
      }

      return {
        ...prev,
        [selectedMode]: newBranches
      };
    });
    onChange();
  };

  const moveBranchUp = (index: number) => {
    if (!selectedMode || index === 0) return;

    setBranchSelections(prev => {
      const branches = [...prev[selectedMode]];
      [branches[index - 1], branches[index]] = [branches[index], branches[index - 1]];
      return {
        ...prev,
        [selectedMode]: branches
      };
    });
    onChange();
  };

  const moveBranchDown = (index: number) => {
    if (!selectedMode || index === selectedBranches.length - 1) return;

    setBranchSelections(prev => {
      const branches = [...prev[selectedMode]];
      [branches[index], branches[index + 1]] = [branches[index + 1], branches[index]];
      return {
        ...prev,
        [selectedMode]: branches
      };
    });
    onChange();
  };

  return (
    <div className="space-y-6">
      {/* Program Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Select Program Type
          </CardTitle>
          <CardDescription>
            Choose between Diploma or MBA programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedProgramType || ''}
            onValueChange={(value: 'diploma' | 'mba') => handleProgramTypeSelect(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="diploma" id="diploma-type" />
              <Label htmlFor="diploma-type">Diploma Programs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mba" id="mba-type" />
              <Label htmlFor="mba-type">MBA Programs</Label>
            </div>
          </RadioGroup>
          {errors.programType && <p className="text-sm text-red-500 mt-2">{errors.programType}</p>}
        </CardContent>
      </Card>

      {/* Program Selection */}
      {selectedProgramType && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProgramType === 'diploma' ? 'Diploma' : 'MBA'} Programs
            </CardTitle>
            <CardDescription>
              Select your preferred {selectedProgramType === 'diploma' ? 'Diploma' : 'MBA'} program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedProgram}
              onValueChange={handleProgramSelect}
            >
              {programs
                .filter(program => program.type === selectedProgramType)
                .map(program => (
                  <div key={program.id} className="flex flex-col space-y-2 border p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value={program.id} id={program.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={program.id} className="font-medium cursor-pointer">
                          {program.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </RadioGroup>
            {errors.program && <p className="text-sm text-red-500 mt-2">{errors.program}</p>}
          </CardContent>
        </Card>
      )}

      {/* Mode Selection for Diploma */}
      {selectedProgramType === 'diploma' && selectedProgram && (
        <Card>
          <CardHeader>
            <CardTitle>Select Mode</CardTitle>
            <CardDescription>Choose your preferred study mode</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center'>
            <RadioGroup
              value={selectedMode || ''}
              onValueChange={(value: 'Regular' | 'Part-time' | 'LET') => handleModeSelect(value)}
              className="flex items-center"
            >
              {programs.find(p => p.id === selectedProgram)?.modes?.map(mode => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={mode} />
                  <Label htmlFor={mode}>{mode}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors.mode && <p className="text-sm text-red-500 mt-2">{errors.mode}</p>}
          </CardContent>
        </Card>
      )}

      {/* Branch Selection for Diploma */}
      {selectedProgramType === 'diploma' && selectedMode && (
        <Card>
          <CardHeader>
            <CardTitle>Select Branch Preferences</CardTitle>
            <CardDescription>
              Choose your preferred branches in order of priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Available Branches */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Available Branches:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {BRANCHES[selectedMode.toUpperCase().replace('-', '_') as keyof typeof BRANCHES]?.map(branch => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`branch-${branch}`}
                        checked={selectedBranches.includes(branch)}
                        onCheckedChange={() => handleBranchToggle(branch)}
                      />
                      <Label htmlFor={`branch-${branch}`}>{branch}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Branches with Priority */}
              {selectedBranches.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Your Branch Preferences (in order of priority):</h4>
                  <div className="space-y-2">
                    {selectedBranches.map((branch, index) => (
                      <div key={branch} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="bg-[#001c67] text-white px-2 py-1 rounded text-sm font-medium">
                            {index + 1}
                          </span>
                          <span>{branch}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBranchUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBranchDown(index)}
                            disabled={index === selectedBranches.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.branches && <p className="text-sm text-red-500 mt-2">{errors.branches}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="space-y-1">
              {Object.values(errors).map((error, index) => (
                <p key={index} className="text-sm text-red-600">{error}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
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
  );
};

export default EditProgramSelectionForm;