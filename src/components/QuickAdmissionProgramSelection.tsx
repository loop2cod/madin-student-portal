'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
  onUpdate: (field: string, value: unknown) => void;
}

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
    "Electrical and Electronics Engineering"
  ],
  LET: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical and Electronics Engineering",
    "Computer Engineering",
    "Automobile Engineering"
  ]
};

export const QuickAdmissionProgramSelection: React.FC<ProgramSelectionProps> = ({
  formData,
  onUpdate
}) => {
  const [selectedProgramType, setSelectedProgramType] = useState<'diploma' | 'mba' | null>(
    formData.programLevel || null
  );
  const [selectedProgram, setSelectedProgram] = useState<string>(
    programs.find(p => p.name === formData.programName)?.id || ''
  );
  const [selectedMode, setSelectedMode] = useState<'Regular' | 'Part-time' | 'LET' | null>(
    formData.mode || null
  );

  // Store branch selections for each mode separately
  const [branchSelections, setBranchSelections] = useState<{
    Regular: string[];
    'Part-time': string[];
    LET: string[];
  }>(() => {
    const initialSelections: {
      Regular: string[];
      'Part-time': string[];
      LET: string[];
    } = {
      Regular: [],
      'Part-time': [],
      LET: []
    };

    // Initialize with existing branch preferences if they exist
    if (formData.branchPreferences && formData.mode) {
      const sortedBranches = [...formData.branchPreferences]
        .sort((a, b) => a.priority - b.priority)
        .map(bp => bp.branch);
      initialSelections[formData.mode] = sortedBranches;
    }

    return initialSelections;
  });

  // This is a computed value based on the selected mode
  const selectedBranches = selectedMode ? branchSelections[selectedMode] : [];



  const handleProgramTypeSelect = (type: 'diploma' | 'mba') => {
    setSelectedProgramType(type);
    setSelectedProgram('');
    setSelectedMode(null);

    // Update form data
    onUpdate('programLevel', type);
    onUpdate('programName', '');
    onUpdate('mode', undefined);
    onUpdate('specialization', undefined);
    onUpdate('branchPreferences', []);

    // Reset branch selections when changing program type
    if (type === 'mba') {
      setBranchSelections({
        Regular: [],
        'Part-time': [],
        LET: []
      });
    }
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    setSelectedMode(null);

    const program = programs.find(p => p.id === programId);
    if (program) {
      onUpdate('programName', program.name);
      onUpdate('mode', undefined);
      onUpdate('branchPreferences', []); // Only clear when selecting a new program
    }
  };

  const handleModeSelect = (mode: 'Regular' | 'Part-time' | 'LET') => {
    setSelectedMode(mode);
    onUpdate('mode', mode);

    // Update branch preferences based on current selections for this mode
    const currentBranches = branchSelections[mode];
    const branchPreferences = currentBranches.map((branch, index) => ({
      branch,
      priority: index + 1
    }));
    onUpdate('branchPreferences', branchPreferences);
  };

  const handleBranchToggle = (branch: string) => {
    if (!selectedMode) return;

    setBranchSelections(prev => {
      const currentSelections = [...prev[selectedMode]];

      // If branch is already selected, remove it
      if (currentSelections.includes(branch)) {
        const newSelections = currentSelections.filter(b => b !== branch);
        const branchPreferences = newSelections.map((b, index) => ({
          branch: b,
          priority: index + 1
        }));
        onUpdate('branchPreferences', branchPreferences);

        return {
          ...prev,
          [selectedMode]: newSelections
        };
      }
      // Otherwise add it to the end (maintaining selection order for priority)
      else {
        const newSelections = [...currentSelections, branch];
        const branchPreferences = newSelections.map((b, index) => ({
          branch: b,
          priority: index + 1
        }));
        onUpdate('branchPreferences', branchPreferences);

        return {
          ...prev,
          [selectedMode]: newSelections
        };
      }
    });
  };

  const moveBranchUp = (index: number) => {
    if (!selectedMode || index === 0) return;

    setBranchSelections(prev => {
      const currentSelections = [...prev[selectedMode]];

      // Swap with the item above
      [currentSelections[index], currentSelections[index - 1]] =
        [currentSelections[index - 1], currentSelections[index]];

      const branchPreferences = currentSelections.map((branch, idx) => ({
        branch,
        priority: idx + 1
      }));
      onUpdate('branchPreferences', branchPreferences);

      return {
        ...prev,
        [selectedMode]: currentSelections
      };
    });
  };

  const moveBranchDown = (index: number) => {
    if (!selectedMode) return;

    setBranchSelections(prev => {
      const currentSelections = [...prev[selectedMode]];
      if (index >= currentSelections.length - 1) return prev; // Can't move down if already at the bottom

      // Swap with the item below
      [currentSelections[index], currentSelections[index + 1]] =
        [currentSelections[index + 1], currentSelections[index]];

      const branchPreferences = currentSelections.map((branch, idx) => ({
        branch,
        priority: idx + 1
      }));
      onUpdate('branchPreferences', branchPreferences);

      return {
        ...prev,
        [selectedMode]: currentSelections
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Program Type Selection */}
      <Card className="border border-gray-200 rounded-none p-2 gap-0">
        <CardHeader className="p-2">
          <CardTitle>Select Program Type</CardTitle>
          <CardDescription>
            Choose between Diploma or MBA programs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
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
        </CardContent>
      </Card>

      {/* Program Selection */}
      {selectedProgramType && (
        <Card className="border border-gray-200 rounded-none p-2 gap-0">
          <CardHeader className="p-2">
            <CardTitle>
              {selectedProgramType === 'diploma' ? 'Diploma' : 'MBA'} Programs
            </CardTitle>
            <CardDescription>
              Select your preferred {selectedProgramType === 'diploma' ? 'Diploma' : 'MBA'} program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-2">
            <RadioGroup
              value={selectedProgram}
              onValueChange={handleProgramSelect}
            >
              {programs
                .filter(program => program.type === selectedProgramType)
                .map(program => (
                  <div key={program.id} className="flex flex-col space-y-2 border px-2 py-3 rounded-none mb-4">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value={program.id} id={program.id} />
                      <Label htmlFor={program.id} className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">{program.name}</p>
                          <p className="text-sm text-gray-500">{program.description}</p>
                        </div>
                      </Label>
                    </div>

                    {/* Mode selection for diploma programs */}
                    {selectedProgram === program.id && program.type === 'diploma' && program.modes && (
                      <div className="ml-8 space-y-3">
                        <h4 className="text-sm font-medium">Select Mode:</h4>
                        <RadioGroup
                          value={selectedMode || ''}
                          onValueChange={handleModeSelect}
                          className="flex gap-4"
                        >
                          {program.modes.map(mode => (
                            <div key={mode} className="flex items-center space-x-2">
                              <RadioGroupItem value={mode} id={`mode-${mode}`} />
                              <Label htmlFor={`mode-${mode}`}>{mode}</Label>
                            </div>
                          ))}
                        </RadioGroup>

                        {/* Branch selection for Regular Diploma */}
                        {selectedMode === 'Regular' && (
                          <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-medium">Select Branch Preferences:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {BRANCHES.REGULAR.map(branch => (
                                <div key={branch} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`branch-${branch}`}
                                    defaultChecked={selectedBranches.includes(branch)}
                                    onCheckedChange={() => handleBranchToggle(branch)}
                                  />
                                  <Label htmlFor={`branch-${branch}`}>{branch}</Label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">Select your preferred branches in order of priority</p>

                            {/* Selection overview for Regular */}
                            {selectedBranches.length > 0 && (
                              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                <h5 className="text-sm font-medium mb-2">Your Branch Preferences:</h5>
                                <div className="space-y-2">
                                  {selectedBranches.map((branch, index) => (
                                    <div key={branch} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className="w-6 text-center font-medium">{index + 1}.</span>
                                        <span className="text-sm">{branch}</span>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchUp(index)}
                                          disabled={index === 0}
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchDown(index)}
                                          disabled={index === selectedBranches.length - 1}
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Branch selection for Part-time Diploma */}
                        {selectedMode === 'Part-time' && (
                          <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-medium">Select Branch Preferences:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {BRANCHES.PART_TIME.map(branch => (
                                <div key={branch} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`branch-parttime-${branch}`}
                                    checked={selectedBranches.includes(branch)}
                                    onCheckedChange={() => handleBranchToggle(branch)}
                                  />
                                  <Label htmlFor={`branch-parttime-${branch}`}>{branch}</Label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">Select your preferred branches in order of priority</p>

                            {/* Selection overview for Part-time */}
                            {selectedBranches.length > 0 && (
                              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                <h5 className="text-sm font-medium mb-2">Your Branch Preferences:</h5>
                                <div className="space-y-2">
                                  {selectedBranches.map((branch, index) => (
                                    <div key={branch} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className="w-6 text-center font-medium">{index + 1}.</span>
                                        <span className="text-sm">{branch}</span>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchUp(index)}
                                          disabled={index === 0}
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchDown(index)}
                                          disabled={index === selectedBranches.length - 1}
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Branch selection for LET Diploma */}
                        {selectedMode === 'LET' && (
                          <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-medium">Select Branch Preferences:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {BRANCHES.LET.map(branch => (
                                <div key={branch} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`branch-let-${branch}`}
                                    checked={selectedBranches.includes(branch)}
                                    onCheckedChange={() => handleBranchToggle(branch)}
                                  />
                                  <Label htmlFor={`branch-let-${branch}`}>{branch}</Label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">Select your preferred branches in order of priority</p>

                            {/* Selection overview */}
                            {selectedBranches.length > 0 && (
                              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                                <h5 className="text-sm font-medium mb-2">Your Branch Preferences:</h5>
                                <div className="space-y-2">
                                  {selectedBranches.map((branch, index) => (
                                    <div key={branch} className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <span className="w-6 text-center font-medium">{index + 1}.</span>
                                        <span className="text-sm">{branch}</span>
                                      </div>
                                      <div className="flex space-x-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchUp(index)}
                                          disabled={index === 0}
                                        >
                                          <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => moveBranchDown(index)}
                                          disabled={index === selectedBranches.length - 1}
                                        >
                                          <ChevronDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* MBA specialization */}
                    {selectedProgram === program.id && program.type === 'mba' && (
                      <div className="ml-8 space-y-3">
                        <h4 className="text-sm font-medium">MBA Specialization (Optional):</h4>
                        <div className="text-sm text-gray-600">
                          Default specialization: General
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
