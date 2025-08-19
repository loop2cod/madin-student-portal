'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  GraduationCap, 
  Book, 
  Award, 
  Plus, 
  Trash2,
  Info,
  School
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EducationDetailsFormProps {
  applicationData: any;
  onSave: (educationDetails: any) => void;
  saving: boolean;
}

interface EducationEntry {
  examination: string;
  passedFailed: string;
  groupSubject: string;
  groupTrade: string;
  period: string;
  yearOfPass: string;
  percentageMarks: string;
  boardUniversity: string;
  noOfChances: string;
  english: string;
  physics: string;
  chemistry: string;
  maths: string;
}

interface SubjectScore {
  examination: string;
  physics: string;
  chemistry: string;
  maths: string;
  total: string;
  remarks: string;
}

export function EducationDetailsForm({ applicationData, onSave, saving }: EducationDetailsFormProps) {
  const [educationData, setEducationData] = useState<EducationEntry[]>([]);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [achievements, setAchievements] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [entranceExams, setEntranceExams] = useState({
    kmat: { selected: false, score: '' },
    cmat: { selected: false, score: '' },
    cat: { selected: false, score: '' }
  });
  const [hasChanges, setHasChanges] = useState(false);

  const isDiploma = applicationData?.programSelections?.some((p: any) => p.programLevel === 'diploma');
  const isMBA = applicationData?.programSelections?.some((p: any) => p.programLevel === 'mba');

  useEffect(() => {
    // Initialize form with existing data if available
    if (applicationData?.educationDetails) {
      const details = applicationData.educationDetails;
      setEducationData(details.educationData || [getDefaultEducationEntry()]);
      setSubjectScores(details.subjectScores || []);
      setAchievements(details.achievements || '');
      setCollegeName(details.collegeName || '');
      setEntranceExams(details.entranceExams || {
        kmat: { selected: false, score: '' },
        cmat: { selected: false, score: '' },
        cat: { selected: false, score: '' }
      });
    } else {
      // Initialize with default values
      setEducationData([getDefaultEducationEntry()]);
    }
  }, [applicationData]);

  function getDefaultEducationEntry(): EducationEntry {
    return {
      examination: '',
      passedFailed: '',
      groupSubject: '',
      groupTrade: '',
      period: '',
      yearOfPass: '',
      percentageMarks: '',
      boardUniversity: '',
      noOfChances: '',
      english: '',
      physics: '',
      chemistry: '',
      maths: ''
    };
  }

  function getDefaultSubjectScore(): SubjectScore {
    return {
      examination: '',
      physics: '',
      chemistry: '',
      maths: '',
      total: '',
      remarks: ''
    };
  }

  const handleEducationDataChange = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...educationData];
    updated[index] = { ...updated[index], [field]: value };
    setEducationData(updated);
    setHasChanges(true);
  };

  const addEducationEntry = () => {
    setEducationData([...educationData, getDefaultEducationEntry()]);
    setHasChanges(true);
  };

  const removeEducationEntry = (index: number) => {
    if (educationData.length > 1) {
      const updated = educationData.filter((_, i) => i !== index);
      setEducationData(updated);
      setHasChanges(true);
    }
  };

  const handleSubjectScoreChange = (index: number, field: keyof SubjectScore, value: string) => {
    const updated = [...subjectScores];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectScores(updated);
    setHasChanges(true);
  };

  const addSubjectScore = () => {
    setSubjectScores([...subjectScores, getDefaultSubjectScore()]);
    setHasChanges(true);
  };

  const removeSubjectScore = (index: number) => {
    const updated = subjectScores.filter((_, i) => i !== index);
    setSubjectScores(updated);
    setHasChanges(true);
  };

  const handleEntranceExamChange = (exam: string, field: 'selected' | 'score', value: boolean | string) => {
    setEntranceExams(prev => ({
      ...prev,
      [exam]: {
        ...prev[exam as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const educationDetails = {
      educationData,
      subjectScores,
      achievements,
      collegeName,
      entranceExams
    };

    onSave(educationDetails);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Education Details</h2>
            <p className="text-sm text-gray-600">
              {isDiploma && "Update your academic records and qualifications"}
              {isMBA && "Update your academic records, entrance exam scores, and achievements"}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={saving || !hasChanges}
          className="flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {hasChanges && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have unsaved changes. Don't forget to save your updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Academic Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="w-5 h-5 text-blue-600" />
            <span>Academic Records</span>
            <Badge variant="outline" className="ml-2">Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {educationData.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 relative">
              {educationData.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducationEntry(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Examination</Label>
                  <Select 
                    value={entry.examination} 
                    onValueChange={(value) => handleEducationDataChange(index, 'examination', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select examination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSLC">SSLC</SelectItem>
                      <SelectItem value="Plus Two">Plus Two</SelectItem>
                      <SelectItem value="Degree">Degree</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="ITI">ITI</SelectItem>
                      <SelectItem value="PG">Post Graduation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Passed/Failed</Label>
                  <Select 
                    value={entry.passedFailed} 
                    onValueChange={(value) => handleEducationDataChange(index, 'passedFailed', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passed">Passed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Pursuing">Pursuing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Group/Subject</Label>
                  <Input
                    value={entry.groupSubject}
                    onChange={(e) => handleEducationDataChange(index, 'groupSubject', e.target.value)}
                    placeholder="e.g., Science, Commerce, Arts"
                  />
                </div>

                <div>
                  <Label>Trade/Stream</Label>
                  <Input
                    value={entry.groupTrade}
                    onChange={(e) => handleEducationDataChange(index, 'groupTrade', e.target.value)}
                    placeholder="e.g., PCM, PCB, Computer Science"
                  />
                </div>

                <div>
                  <Label>Period</Label>
                  <Input
                    value={entry.period}
                    onChange={(e) => handleEducationDataChange(index, 'period', e.target.value)}
                    placeholder="e.g., 2020-2022"
                  />
                </div>

                <div>
                  <Label>Year of Passing</Label>
                  <Input
                    value={entry.yearOfPass}
                    onChange={(e) => handleEducationDataChange(index, 'yearOfPass', e.target.value)}
                    placeholder="e.g., 2022"
                  />
                </div>

                <div>
                  <Label>Percentage/Marks</Label>
                  <Input
                    value={entry.percentageMarks}
                    onChange={(e) => handleEducationDataChange(index, 'percentageMarks', e.target.value)}
                    placeholder="e.g., 85%"
                  />
                </div>

                <div>
                  <Label>Board/University</Label>
                  <Input
                    value={entry.boardUniversity}
                    onChange={(e) => handleEducationDataChange(index, 'boardUniversity', e.target.value)}
                    placeholder="e.g., CBSE, Kerala Board"
                  />
                </div>

                <div>
                  <Label>Number of Chances</Label>
                  <Input
                    value={entry.noOfChances}
                    onChange={(e) => handleEducationDataChange(index, 'noOfChances', e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              {isDiploma && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Subject-wise Marks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm">English</Label>
                      <Input
                        value={entry.english}
                        onChange={(e) => handleEducationDataChange(index, 'english', e.target.value)}
                        placeholder="Marks"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Physics</Label>
                      <Input
                        value={entry.physics}
                        onChange={(e) => handleEducationDataChange(index, 'physics', e.target.value)}
                        placeholder="Marks"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Chemistry</Label>
                      <Input
                        value={entry.chemistry}
                        onChange={(e) => handleEducationDataChange(index, 'chemistry', e.target.value)}
                        placeholder="Marks"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Mathematics</Label>
                      <Input
                        value={entry.maths}
                        onChange={(e) => handleEducationDataChange(index, 'maths', e.target.value)}
                        placeholder="Marks"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addEducationEntry}
            className="w-full flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Academic Record</span>
          </Button>
        </CardContent>
      </Card>

      {/* Subject Scores for Diploma */}
      {isDiploma && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Subject Scores</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjectScores.map((score, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubjectScore(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Examination</Label>
                    <Input
                      value={score.examination}
                      onChange={(e) => handleSubjectScoreChange(index, 'examination', e.target.value)}
                      placeholder="e.g., Plus Two"
                    />
                  </div>
                  <div>
                    <Label>Physics</Label>
                    <Input
                      value={score.physics}
                      onChange={(e) => handleSubjectScoreChange(index, 'physics', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div>
                    <Label>Chemistry</Label>
                    <Input
                      value={score.chemistry}
                      onChange={(e) => handleSubjectScoreChange(index, 'chemistry', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div>
                    <Label>Mathematics</Label>
                    <Input
                      value={score.maths}
                      onChange={(e) => handleSubjectScoreChange(index, 'maths', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input
                      value={score.total}
                      onChange={(e) => handleSubjectScoreChange(index, 'total', e.target.value)}
                      placeholder="Total Score"
                    />
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Input
                      value={score.remarks}
                      onChange={(e) => handleSubjectScoreChange(index, 'remarks', e.target.value)}
                      placeholder="Any remarks"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              onClick={addSubjectScore}
              className="w-full flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject Score Entry</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* MBA Specific Fields */}
      {isMBA && (
        <>
          {/* College Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="w-5 h-5 text-indigo-600" />
                <span>College Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>College Name</Label>
                <Input
                  value={collegeName}
                  onChange={(e) => {
                    setCollegeName(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Enter your college/university name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Achievements & Awards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Achievements</Label>
                <Textarea
                  value={achievements}
                  onChange={(e) => {
                    setAchievements(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Describe your academic achievements, awards, certifications, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Entrance Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="w-5 h-5 text-red-600" />
                <span>Entrance Exam Scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(entranceExams).map(([examKey, examData]) => (
                <div key={examKey} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={examData.selected}
                      onCheckedChange={(checked) => 
                        handleEntranceExamChange(examKey, 'selected', checked as boolean)
                      }
                    />
                    <Label className="text-sm font-medium">
                      {examKey.toUpperCase()} - {
                        examKey === 'kmat' ? 'Kerala Management Aptitude Test' :
                        examKey === 'cmat' ? 'Common Management Aptitude Test' :
                        'Common Admission Test'
                      }
                    </Label>
                  </div>
                  
                  {examData.selected && (
                    <div>
                      <Label>Score</Label>
                      <Input
                        value={examData.score}
                        onChange={(e) => handleEntranceExamChange(examKey, 'score', e.target.value)}
                        placeholder={`Enter your ${examKey.toUpperCase()} score`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}