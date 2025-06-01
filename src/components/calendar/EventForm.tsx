'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Event interface is defined here

// Define a local Event interface to match the expected structure
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  isPublic: boolean;
}
import { cn } from '@/lib/utils'; // Assuming cn utility for classnames

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Event>) => void;
  initialData?: Event | null;
  isLoading: boolean;
  error: Error | null;
}

interface EventFormState {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
  isPublic: boolean;
}

interface EventFormErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

// Helper to format Date to YYYY-MM-DDTHH:mm for datetime-local input
const formatDateTimeLocal = (date?: Date): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function EventForm({ isOpen, onClose, onSubmit, initialData, isLoading, error }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormState>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6', // Default blue
    isPublic: false,
  });
  const [errors, setErrors] = useState<EventFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: formatDateTimeLocal(initialData.startDate),
        endDate: formatDateTimeLocal(initialData.endDate),
        color: initialData.color || '#3b82f6',
        isPublic: initialData.isPublic || false,
      });
    } else {
      // Reset form when opening for new event
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        color: '#3b82f6',
        isPublic: false,
      });
    }
    // Reset errors when dialog opens or initialData changes
    setErrors({});
  }, [initialData, isOpen]); // Depend on isOpen to reset when dialog closes and re-opens

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublic: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: EventFormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required.';
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare data for submission, converting date strings to Date objects or ISO strings
      const dataToSubmit: Partial<Event> = {
        id: initialData?.id, // Include ID if editing
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate), // Convert back to Date
        endDate: new Date(formData.endDate),     // Convert back to Date
        color: formData.color,
        isPublic: formData.isPublic,
      };
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={cn("col-span-3", errors.title && "border-destructive")}
            />
          </div>
          {errors.title && <p className="col-span-4 col-start-2 text-sm text-destructive -mt-2">{errors.title}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleInputChange}
              className={cn("col-span-3", errors.startDate && "border-destructive")}
            />
          </div>
           {errors.startDate && <p className="col-span-4 col-start-2 text-sm text-destructive -mt-2">{errors.startDate}</p>}


          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleInputChange}
              className={cn("col-span-3", errors.endDate && "border-destructive")}
            />
          </div>
           {errors.endDate && <p className="col-span-4 col-start-2 text-sm text-destructive -mt-2">{errors.endDate}</p>}


          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
 className="col-span-3 h-8 border rounded-md px-2 py-1" // Basic select styling
 >
 <option value="#3b82f6">Blue</option>
 <option value="#22c55e">Green</option>
 <option value="#ef4444">Red</option>
 <option value="#a855f7">Purple</option>
 <option value="#f97316">Orange</option>
 </select>
          </div>


          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPublic" className="text-right">
              Public
            </Label>
            <Checkbox
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onCheckedChange={handleCheckboxChange}
              className="col-span-3"
            />
          </div>

        </div>

        {error && (
           <div className="text-destructive text-sm text-center mb-2">{error.message || 'An error occurred.'}</div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}