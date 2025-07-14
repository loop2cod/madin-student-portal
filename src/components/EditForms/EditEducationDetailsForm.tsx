'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, GraduationCap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
  const [formData, setFormData] = useState<any>({});
  const [programSelections, setProgramSelections] = useState<any[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected program details
  const selectedProgram = programSelections.find(p => p.selected) || programSelections[0];

  useEffect(() => {
    if (applicationData?.educationDetails) {
      setFormData(applicationData.educationDetails);
    }
    if (applicationData?.programSelections) {
      setProgramSelections(applicationData.programSelections);
    }
  }, [applicationData]);

  // Initialize form data based on program type and mode
  useEffect(() => {
    if (selectedProgram && !formData.educationData) {
      initializeFormData();
    }
  }, [selectedProgram]);

  const initializeFormData = () => {
    if (!selectedProgram) return;

    let initialData = { programDetails: selectedProgram };

    if (selectedProgram.programLevel === 'mba') {
      initialData = {
        ...initialData,
        educationData: [
          {
            examination: "SSLC",
            passedFailed: "",
            groupSubject: "",
            period: "",
            yearOfPass: "",
            percentageMarks: "",
            boardUniversity: "",
          },
          {
            examination: "+2",
            passedFailed: "",
            groupSubject: "",
            period: "",
            yearOfPass: "",
            percentageMarks: "",
            boardUniversity: "",
          },
          {
            examination: "Degree",
            passedFailed: "",
            groupSubject: "",
            period: "",
            yearOfPass: "",
            percentageMarks: "",
            boardUniversity: "",
          },
        ],
        achievements: "",
        collegeName: "",
        entranceExams: {
          kmat: { selected: false, score: "" },
          cmat: { selected: false, score: "" },
          cat: { selected: false, score: "" }
        }
      };
    } else if (selectedProgram.programLevel === 'diploma') {
      if (selectedProgram.mode === 'LET') {
        initialData = {
          ...initialData,
          educationData: [
            {
              examination: "SSLC/THSLC/CBSE",
              passedFailed: "",
              groupTrade: "",
              period: "",
              yearOfPass: "",
              percentageMarks: "",
              noOfChances: "",
              english: "",
              physics: "",
              chemistry: "",
              maths: "",
            },
            {
              examination: "+2/VHSE",
              passedFailed: "",
              groupTrade: "",
              period: "",
              yearOfPass: "",
              percentageMarks: "",
              noOfChances: "",
              english: "",
              physics: "",
              chemistry: "",
              maths: "",
            },
            {
              examination: "ITI",
              passedFailed: "",
              groupTrade: "",
              period: "",
              yearOfPass: "",
              percentageMarks: "",
              noOfChances: "",
              english: "",
              physics: "",
              chemistry: "",
              maths: "",
            },
          ],
          subjectScores: [
            { examination: "+2/VHSE", physics: "", chemistry: "", maths: "", total: "", remarks: "" },
          ]
        };
      } else {
        // Regular and Part-time
        initialData = {
          ...initialData,
          educationData: [
            {
              examination: "SSLC/THSLC/CBSE",
              passedFailed: "",
              groupTrade: "",
              period: "",
              yearOfPass: "",
              percentageMarks: "",
              noOfChances: "",
              english: "",
              physics: "",
              chemistry: "",
              maths: "",
            },
            {
              examination: "+2/VHSE",
              passedFailed: "",
              groupTrade: "",
              period: "",
              yearOfPass: "",
              percentageMarks: "",
              noOfChances: "",
              english: "",
              physics: "",
              chemistry: "",
              maths: "",
            },
          ],
        };
      }
    }

    setFormData(initialData);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.educationData || formData.educationData.length === 0) {
      newErrors.education = 'Education details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Handle input changes for education data
  const handleEducationDataChange = (index: number, field: string, value: string) => {
    const updatedEducationData = [...(formData.educationData || [])];
    updatedEducationData[index] = {
      ...updatedEducationData[index],
      [field]: value
    };

    setFormData({
      ...formData,
      educationData: updatedEducationData
    });
    onChange();
  };

  // Handle changes for achievements and college name
  const handleTextChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    onChange();
  };

  // Handle entrance exam changes
  const handleEntranceExamChange = (exam: string, field: string, value: any) => {
    setFormData({
      ...formData,
      entranceExams: {
        ...formData.entranceExams,
        [exam]: {
          ...formData.entranceExams?.[exam],
          [field]: value
        }
      }
    });
    onChange();
  };

  // Handle subject scores changes (for diploma LET)
  const handleSubjectScoreChange = (index: number, field: string, value: string) => {
    const updatedSubjectScores = [...(formData.subjectScores || [])];
    updatedSubjectScores[index] = {
      ...updatedSubjectScores[index],
      [field]: value
    };

    setFormData({
      ...formData,
      subjectScores: updatedSubjectScores
    });
    onChange();
  };

  // Render the appropriate form based on program type and mode
  const renderEducationForm = () => {
    if (!selectedProgram) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Please select a program first to configure education details.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (selectedProgram.programLevel === 'mba') {
      return renderMBAForm();
    } else if (selectedProgram.programLevel === 'diploma') {
      if (selectedProgram.mode === 'LET') {
        return renderDiplomaLETForm();
      } else {
        return renderDiplomaRegularForm();
      }
    }

    return null;
  };

  // MBA Education Form
  const renderMBAForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education Details - MBA Program
        </CardTitle>
        <CardDescription>
          Please fill in your academic qualifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Education Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Passed/Failed</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Group/Subject</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Period</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Year of Pass</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">% of Marks</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Board/University</th>
                </tr>
              </thead>
              <tbody>
                {(formData.educationData || []).map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <span className="font-normal text-sm">
                        {row.examination}
                      </span>
                    </td>
                    <td className="border border-gray-300">
                      <Select
                        value={row.passedFailed}
                        onValueChange={(value) => handleEducationDataChange(index, 'passedFailed', value)}
                      >
                        <SelectTrigger className="border-0 w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.groupSubject || ''}
                        onChange={(e) => handleEducationDataChange(index, 'groupSubject', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Enter group/subject"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.period || ''}
                        onChange={(e) => handleEducationDataChange(index, 'period', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 2018-2021"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.yearOfPass || ''}
                        onChange={(e) => handleEducationDataChange(index, 'yearOfPass', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 2021"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.percentageMarks || ''}
                        onChange={(e) => handleEducationDataChange(index, 'percentageMarks', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 85"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.boardUniversity || ''}
                        onChange={(e) => handleEducationDataChange(index, 'boardUniversity', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Enter board/university"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Entrance Exams */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Entrance Examinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['kmat', 'cmat', 'cat'].map((exam) => (
                <div key={exam} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={exam}
                      checked={formData.entranceExams?.[exam]?.selected || false}
                      onCheckedChange={(checked) => handleEntranceExamChange(exam, 'selected', checked)}
                    />
                    <Label htmlFor={exam} className="font-medium">
                      {exam.toUpperCase()}
                    </Label>
                  </div>
                  {formData.entranceExams?.[exam]?.selected && (
                    <div className="space-y-2">
                      <Label>Score</Label>
                      <Input
                        value={formData.entranceExams?.[exam]?.score || ''}
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
                value={formData.achievements || ''}
                onChange={(e) => handleTextChange('achievements', e.target.value)}
                placeholder="Enter any achievements or work experience"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>College Name (UG)</Label>
              <Input
                value={formData.collegeName || ''}
                onChange={(e) => handleTextChange('collegeName', e.target.value)}
                placeholder="Enter college name for undergraduate studies"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Diploma Regular/Part-time Form
  const renderDiplomaRegularForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education Details - Diploma Program ({selectedProgram?.mode})
        </CardTitle>
        <CardDescription>
          Please fill in your academic qualifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Passed/Failed</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Group/Trade</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Period</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Year of Pass</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">% of Marks</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">No. of Chances</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">English</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Physics</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Chemistry</th>
                <th className="border border-gray-300 p-2 text-left text-sm font-medium">Maths</th>
              </tr>
            </thead>
            <tbody>
              {(formData.educationData || []).map((row: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    <span className="font-normal text-sm">
                      {row.examination}
                    </span>
                  </td>
                  <td className="border border-gray-300">
                    <Select
                      value={row.passedFailed}
                      onValueChange={(value) => handleEducationDataChange(index, 'passedFailed', value)}
                    >
                      <SelectTrigger className="border-0 w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.groupTrade || ''}
                      onChange={(e) => handleEducationDataChange(index, 'groupTrade', e.target.value)}
                      className="border-0 w-full"
                      placeholder="Enter group/trade"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.period || ''}
                      onChange={(e) => handleEducationDataChange(index, 'period', e.target.value)}
                      className="border-0 w-full"
                      placeholder="e.g., 2018-2021"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.yearOfPass || ''}
                      onChange={(e) => handleEducationDataChange(index, 'yearOfPass', e.target.value)}
                      className="border-0 w-full"
                      placeholder="e.g., 2021"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.percentageMarks || ''}
                      onChange={(e) => handleEducationDataChange(index, 'percentageMarks', e.target.value)}
                      className="border-0 w-full"
                      placeholder="e.g., 85"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.noOfChances || ''}
                      onChange={(e) => handleEducationDataChange(index, 'noOfChances', e.target.value)}
                      className="border-0 w-full"
                      placeholder="e.g., 1"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.english || ''}
                      onChange={(e) => handleEducationDataChange(index, 'english', e.target.value)}
                      className="border-0 w-full"
                      placeholder="Grade"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.physics || ''}
                      onChange={(e) => handleEducationDataChange(index, 'physics', e.target.value)}
                      className="border-0 w-full"
                      placeholder="Grade"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.chemistry || ''}
                      onChange={(e) => handleEducationDataChange(index, 'chemistry', e.target.value)}
                      className="border-0 w-full"
                      placeholder="Grade"
                    />
                  </td>
                  <td className="border border-gray-300">
                    <Input
                      value={row.maths || ''}
                      onChange={(e) => handleEducationDataChange(index, 'maths', e.target.value)}
                      className="border-0 w-full"
                      placeholder="Grade"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // Diploma LET Form
  const renderDiplomaLETForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education Details - Diploma LET Program
        </CardTitle>
        <CardDescription>
          Please fill in your academic qualifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Education Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Passed/Failed</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Group/Trade</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Period</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Year of Pass</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">% of Marks</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">No. of Chances</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">English</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Physics</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Chemistry</th>
                  <th className="border border-gray-300 p-2 text-left text-sm font-medium">Maths</th>
                </tr>
              </thead>
              <tbody>
                {(formData.educationData || []).map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <span className="font-normal text-sm">
                        {row.examination}
                      </span>
                    </td>
                    <td className="border border-gray-300">
                      <Select
                        value={row.passedFailed}
                        onValueChange={(value) => handleEducationDataChange(index, 'passedFailed', value)}
                      >
                        <SelectTrigger className="border-0 w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.groupTrade || ''}
                        onChange={(e) => handleEducationDataChange(index, 'groupTrade', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Enter group/trade"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.period || ''}
                        onChange={(e) => handleEducationDataChange(index, 'period', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 2018-2021"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.yearOfPass || ''}
                        onChange={(e) => handleEducationDataChange(index, 'yearOfPass', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 2021"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.percentageMarks || ''}
                        onChange={(e) => handleEducationDataChange(index, 'percentageMarks', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 85"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.noOfChances || ''}
                        onChange={(e) => handleEducationDataChange(index, 'noOfChances', e.target.value)}
                        className="border-0 w-full"
                        placeholder="e.g., 1"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.english || ''}
                        onChange={(e) => handleEducationDataChange(index, 'english', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Grade"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.physics || ''}
                        onChange={(e) => handleEducationDataChange(index, 'physics', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Grade"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.chemistry || ''}
                        onChange={(e) => handleEducationDataChange(index, 'chemistry', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Grade"
                      />
                    </td>
                    <td className="border border-gray-300">
                      <Input
                        value={row.maths || ''}
                        onChange={(e) => handleEducationDataChange(index, 'maths', e.target.value)}
                        className="border-0 w-full"
                        placeholder="Grade"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subject Scores Table */}
          {formData.subjectScores && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Subject Scores</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Examination</th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Physics</th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Chemistry</th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Maths</th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Total</th>
                      <th className="border border-gray-300 p-2 text-left text-sm font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.subjectScores.map((row: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">
                          <span className="font-normal text-sm">
                            {row.examination}
                          </span>
                        </td>
                        <td className="border border-gray-300">
                          <Input
                            value={row.physics || ''}
                            onChange={(e) => handleSubjectScoreChange(index, 'physics', e.target.value)}
                            className="border-0 w-full"
                            placeholder="Physics score"
                          />
                        </td>
                        <td className="border border-gray-300">
                          <Input
                            value={row.chemistry || ''}
                            onChange={(e) => handleSubjectScoreChange(index, 'chemistry', e.target.value)}
                            className="border-0 w-full"
                            placeholder="Chemistry score"
                          />
                        </td>
                        <td className="border border-gray-300">
                          <Input
                            value={row.maths || ''}
                            onChange={(e) => handleSubjectScoreChange(index, 'maths', e.target.value)}
                            className="border-0 w-full"
                            placeholder="Maths score"
                          />
                        </td>
                        <td className="border border-gray-300">
                          <Input
                            value={row.total || ''}
                            onChange={(e) => handleSubjectScoreChange(index, 'total', e.target.value)}
                            className="border-0 w-full"
                            placeholder="Total"
                          />
                        </td>
                        <td className="border border-gray-300">
                          <Input
                            value={row.remarks || ''}
                            onChange={(e) => handleSubjectScoreChange(index, 'remarks', e.target.value)}
                            className="border-0 w-full"
                            placeholder="Remarks"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderEducationForm()}

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
          disabled={saving || isLoading}
          className="bg-[#001c67] hover:bg-[#001c67]/90 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Education Details'}
        </Button>
      </div>
    </div>
  );
};

export default EditEducationDetailsForm;