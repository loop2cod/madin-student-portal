import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {  X, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationFilters } from '@/hooks/useApplicationFilters';

interface AdvancedFiltersProps {
  filters: ApplicationFilters;
  updateFilter: <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => void;
  updateMultipleFilters: (updates: Partial<ApplicationFilters>) => void;
  clearSearchAndFilters: () => void;
  hasActiveFilters: boolean;
  availableFilters?: {
    availableStatuses: string[];
    availableDepartments: string[];
    availableStages: string[];
  } | null;
  statusCounts?: Record<string, number>;
  departmentCounts?: Record<string, number>;
  userRole?: string;
  userDepartment?: string;
  onMultiSelectChange: (filterKey: 'statuses' | 'departments', value: string, checked: boolean) => void;
}

export function AdvancedFilters({
  filters,
  updateFilter,
  clearSearchAndFilters,
  hasActiveFilters,
  availableFilters,
  statusCounts = {},
  departmentCounts = {},
  userRole,
  onMultiSelectChange
}: AdvancedFiltersProps) {

  const removeStatusFilter = (status: string) => {
    const newStatuses = filters.statuses.filter(s => s !== status);
    updateFilter('statuses', newStatuses);
  };

  const removeDepartmentFilter = (department: string) => {
    const newDepartments = filters.departments.filter(d => d !== department);
    updateFilter('departments', newDepartments);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Input
          placeholder="Search by name, email, mobile, or application ID..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Filter className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Quick Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.statuses.length > 0 
                  ? `${filters.statuses.length} selected`
                  : 'All Statuses'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <div className="font-medium">Select Statuses</div>
                <Separator />
                {availableFilters?.availableStatuses.map((status) => (
                  <div key={status} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.statuses.includes(status)}
                        onCheckedChange={(checked) => 
                          onMultiSelectChange('statuses', status, checked as boolean)
                        }
                      />
                      <Label htmlFor={`status-${status}`} className="capitalize">
                        {status.replace('_', ' ')}
                      </Label>
                    </div>
                    {statusCounts[status] && (
                      <Badge variant="secondary" className="text-xs">
                        {statusCounts[status]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Department Filter - Only show for non-department staff */}
        {/* {userRole !== 'department_staff' && (
          <div className="space-y-2">
            <Label>Departments</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.departments.length > 0 
                    ? `${filters.departments.length} selected`
                    : 'All Departments'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">Select Departments</div>
                  <Separator />
                  {availableFilters?.availableDepartments.map((department) => (
                    <div key={department} className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${department}`}
                          checked={filters.departments.includes(department)}
                          onCheckedChange={(checked) => 
                            onMultiSelectChange('departments', department, checked as boolean)
                          }
                        />
                        <Label htmlFor={`dept-${department}`} className="text-sm">
                          {department}
                        </Label>
                      </div>
                      {departmentCounts[department] && (
                        <Badge variant="secondary" className="text-xs">
                          {departmentCounts[department]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )} */}

        {/* Current Stage Filter */}
        <div className="space-y-2">
          <Label>Current Stage</Label>
          <Select value={filters.currentStage} onValueChange={(value) => updateFilter('currentStage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {availableFilters?.availableStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Active Filters
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearchAndFilters}
                className="h-8 px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              
              {filters.statuses.map((status) => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  Status: {status.replace('_', ' ')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeStatusFilter(status)}
                  />
                </Badge>
              ))}
              
              {filters.departments.map((department) => (
                <Badge key={department} variant="secondary" className="flex items-center gap-1">
                  Dept: {department}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeDepartmentFilter(department)}
                  />
                </Badge>
              ))}
              
              {filters.currentStage !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Stage: {filters.currentStage.replace('_', ' ')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('currentStage', 'all')}
                  />
                </Badge>
              )}
              
              {filters.dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {format(new Date(filters.dateFrom), 'MMM dd, yyyy')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('dateFrom', '')}
                  />
                </Badge>
              )}
              
              {filters.dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {format(new Date(filters.dateTo), 'MMM dd, yyyy')}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('dateTo', '')}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}