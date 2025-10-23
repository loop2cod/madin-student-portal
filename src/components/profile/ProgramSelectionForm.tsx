'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, GraduationCap, CheckCircle, AlertCircle } from 'lucide-react';

interface ProgramSelectionFormProps {
  applicationData: any;
  onSave: (data: any) => void;
  saving: boolean;
}

interface ProgramSelection {
  programLevel: string;
  programName: string;
  mode?: string;
  branchPreferences?: Array<{
    branch: string;
    priority: number;
  }>;
  specialization?: string;
  selected: boolean;
  priority: number;
}

export const ProgramSelectionForm: React.FC<ProgramSelectionFormProps> = ({
  applicationData,
  onSave,
  saving
}) => {
  const [programSelections, setProgramSelections] = useState<ProgramSelection[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (applicationData?.programSelections) {
      setProgramSelections(applicationData.programSelections);
    }
  }, [applicationData]);

  const handleSave = () => {
    onSave(programSelections);
    setHasChanges(false);
  };

  const formatBranchPreferences = (branchPreferences: Array<{branch: string; priority: number}>) => {
    if (!branchPreferences || branchPreferences.length === 0) return 'No preferences specified';
    
    return branchPreferences
      .sort((a, b) => a.priority - b.priority)
      .map((pref, index) => `${index + 1}. ${pref.branch}`)
      .join(' | ');
  };

  const getProgramIcon = (programLevel: string) => {
    switch (programLevel) {
      case 'diploma':
        return '🎓';
      case 'mba':
        return '💼';
      default:
        return '📚';
    }
  };

  const getProgramModeColor = (mode: string) => {
    switch (mode) {
      case 'Regular':
        return 'bg-blue-100 text-blue-800';
      case 'Part-time':
        return 'bg-green-100 text-green-800';
      case 'LET':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!programSelections || programSelections.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Program Selection Found</h3>
          <p className="text-gray-600">
            No program selections are available for your application. Contact administration if this seems incorrect.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Selected Programs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {programSelections.map((program, index) => (
              <div
                key={index}
                className={`p-2 border rounded-lg ${
                  program.selected 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">
                          {program.programName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {program.programLevel.toUpperCase()}
                          </Badge>
                          {program.mode && (
                            <Badge className={`text-xs ${getProgramModeColor(program.mode)}`}>
                              {program.mode}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Priority {program.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Branch Preferences for Diploma Programs */}
                    {program.branchPreferences && program.branchPreferences.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Branch Preferences:
                        </h5>
                        <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                          {formatBranchPreferences(program.branchPreferences)}
                        </div>
                      </div>
                    )}

                    {/* Specialization for MBA Programs */}
                    {program.specialization && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">
                          Specialization:
                        </h5>
                        <Badge variant="outline" className="text-xs">
                          {program.specialization}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {program.selected && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Department Assignment Info */}
          {applicationData?.department && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h4 className="font-medium text-green-900 mb-1">Department Assignment</h4>
                  <p className="text-green-700">
                    You have been assigned to: <span className="font-semibold">{applicationData.department}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button - Hidden for now since program selections are read-only */}
      <div className="hidden">
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
          <p className="text-sm text-orange-600 text-right mt-2">
            You have unsaved changes
          </p>
        )}
      </div>
    </div>
  );
};