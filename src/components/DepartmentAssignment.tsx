'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { get, post } from '@/utilities/AxiosInterceptor';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Star,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PreferredBranch {
  branch: string;
  priority: number;
  programLevel: string;
  programName: string;
  mode?: string;
  specialization?: string;
}

interface PreferredBranchesData {
  admissionId: string;
  applicationId: string;
  currentDepartment?: string;
  applicantName: string;
  preferredBranches: PreferredBranch[];
  availableDepartments: string[];
}

interface DepartmentAssignmentProps {
  applicationId: string;
  currentDepartment?: string;
  onDepartmentAssigned?: (newDepartment: string) => void;
}

export const DepartmentAssignment: React.FC<DepartmentAssignmentProps> = ({
  applicationId,
  currentDepartment,
  onDepartmentAssigned
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [branchesData, setBranchesData] = useState<PreferredBranchesData | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const { toast } = useToast();
  const { hasRole } = useAuth();

  // Check if user can assign departments
  const canAssignDepartment = hasRole(['super_admin', 'admission_officer']);

  const fetchPreferredBranches = async () => {
    if (!applicationId) return;

    setLoading(true);
    try {
      const response = await get<any>(`/api/v1/admission/admin/${applicationId}/preferred-branches`);
      
      if (response.success) {
        setBranchesData(response.data);
        setSelectedDepartment(''); // Reset selection
        setRemarks(''); // Reset remarks
      } else {
        throw new Error(response.message || 'Failed to fetch preferred branches');
      }
    } catch (error: any) {
      console.error('Error fetching preferred branches:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load preferred branches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDepartment = async () => {
    if (!selectedDepartment || !applicationId) return;

    setAssignmentLoading(true);
    try {
      const response = await post<any>(`/api/v1/admission/admin/${applicationId}/assign-department`, {
        department: selectedDepartment,
        remarks: remarks.trim()
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: `Department assigned to ${selectedDepartment} successfully`,
        });
        
        // Close dialog first
        setIsOpen(false);
        
        // Reset form
        setSelectedDepartment('');
        setRemarks('');
        
        // Call the callback to update parent component
        if (onDepartmentAssigned) {
          onDepartmentAssigned(selectedDepartment);
        }
      } else {
        throw new Error(response.message || 'Failed to assign department');
      }
    } catch (error: any) {
      console.error('Error assigning department:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign department',
        variant: 'destructive',
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchPreferredBranches();
    }
  };

  const isDepartmentFromPreferences = (department: string): boolean => {
    return branchesData?.preferredBranches.some(branch => branch.branch === department) || false;
  };

  const getPriorityForDepartment = (department: string): number | null => {
    const branch = branchesData?.preferredBranches.find(branch => branch.branch === department);
    return branch ? branch.priority : null;
  };

  const renderPreferredBranches = () => {
    if (!branchesData?.preferredBranches || branchesData.preferredBranches.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No preferred branches found</p>
          <p className="text-sm">You can still assign any available department</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Star className="w-4 h-4 mr-2 text-yellow-500" />
          Applicant&apos;s Preferred Branches
        </h4>
        <div className="grid gap-2">
          {branchesData.preferredBranches.map((branch, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                selectedDepartment === branch.branch 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } cursor-pointer transition-colors`}
              onClick={() => setSelectedDepartment(branch.branch)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {branch.priority}. Priority
                  </Badge>
                  <span className="font-medium text-gray-900">{branch.branch}</span>
                  {selectedDepartment === branch.branch && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                {currentDepartment === branch.branch && (
                  <Badge variant="default" className="text-xs">
                    Currently Assigned
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {branch.programLevel} - {branch.programName}
                {branch.mode && ` (${branch.mode})`}
                {branch.specialization && ` - ${branch.specialization}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // const renderDepartmentSelection = () => {
  //   if (!branchesData) return null;

  //   return (
  //     <div className="space-y-4">
  //       <div>
  //         <Label htmlFor="department-select" className="text-sm font-medium">
  //           Select Department to Assign
  //         </Label>
  //         <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
  //           <SelectTrigger className="mt-2">
  //             <SelectValue placeholder="Choose a department..." />
  //           </SelectTrigger>
  //           <SelectContent>
  //             {branchesData.availableDepartments.map((department) => {
  //               const isFromPreferences = isDepartmentFromPreferences(department);
  //               const priority = getPriorityForDepartment(department);
                
  //               return (
  //                 <SelectItem key={department} value={department}>
  //                   <div className="flex items-center justify-between w-full">
  //                     <span>{department}</span>
  //                     <div className="flex items-center space-x-1 ml-2">
  //                       {isFromPreferences && (
  //                         <>
  //                           <Star className="w-3 h-3 text-yellow-500" />
  //                           <span className="text-xs text-gray-500">
  //                             {priority}. Choice
  //                           </span>
  //                         </>
  //                       )}
  //                       {currentDepartment === department && (
  //                         <Badge variant="outline" className="text-xs ml-1">
  //                           Current
  //                         </Badge>
  //                       )}
  //                     </div>
  //                   </div>
  //                 </SelectItem>
  //               );
  //             })}
  //           </SelectContent>
  //         </Select>
          
  //         {selectedDepartment && (
  //           <div className="mt-2 p-2 bg-gray-50 rounded-md">
  //             <div className="flex items-center space-x-2 text-sm">
  //               {isDepartmentFromPreferences(selectedDepartment) ? (
  //                 <>
  //                   <CheckCircle className="w-4 h-4 text-green-500" />
  //                   <span className="text-green-700">
  //                     This department is from applicant's preferred branches 
  //                     (Priority {getPriorityForDepartment(selectedDepartment)})
  //                   </span>
  //                 </>
  //               ) : (
  //                 <>
  //                   <AlertCircle className="w-4 h-4 text-orange-500" />
  //                   <span className="text-orange-700">
  //                     This department is not in applicant's preferred branches (Manual assignment)
  //                   </span>
  //                 </>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>

  //       {/* <div>
  //         <Label htmlFor="assignment-remarks" className="text-sm font-medium">
  //           Assignment Remarks (Optional)
  //         </Label>
  //         <Textarea
  //           id="assignment-remarks"
  //           value={remarks}
  //           onChange={(e) => setRemarks(e.target.value)}
  //           placeholder="Add any remarks for this department assignment..."
  //           className="mt-2"
  //           rows={3}
  //         />
  //       </div> */}
  //     </div>
  //   );
  // };

  if (!canAssignDepartment) {
    return null; // Don't render if user doesn't have permission
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <Building2 className="w-4 h-4 mr-2" />
          {currentDepartment ? 'Reassign Department' : 'Assign Department'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Department Assignment
          </DialogTitle>
          <DialogDescription>
            {branchesData && (
              <>
                Assign department for <strong>{branchesData.applicantName}</strong> 
                (Application ID: {branchesData.applicationId})
                {currentDepartment && (
                  <span className="block mt-1">
                    Currently assigned to: <strong>{currentDepartment}</strong>
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span className="text-gray-600">Loading preferred branches...</span>
            </div>
          ) : (
            <>
              {renderPreferredBranches()}
              
              {/* <div className="border-t pt-4">
                {renderDepartmentSelection()}
              </div> */}
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={assignmentLoading}
            className='cursor-pointer'
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignDepartment}
            disabled={!selectedDepartment || assignmentLoading}
            className="bg-blue-900 hover:bg-blue-950 cursor-pointer"
          >
            {assignmentLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Assign Department
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentAssignment;