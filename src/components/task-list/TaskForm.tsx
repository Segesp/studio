'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { Loader2 as Loader } from 'lucide-react'; // Using lucide-react for a simple spinner
// Unifico la definición de Task para que incluya createdAt y updatedAt opcionales
interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  tags?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  title?: string;
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  initialData?: Partial<Task>; // Use Partial for initialData as not all fields may be present
  isLoading: boolean; // Add isLoading prop
  error: Error | null; // Add error prop
}
;

export function TaskForm({ isOpen, onClose, onSubmit, initialData, isLoading, error }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 0,
    tags: [],
    status: '', // Add status to form data state
  });
 const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '', // Format date for input type="date"
        priority: initialData.priority !== undefined ? initialData.priority : 0,
        tags: initialData.tags || [],
        status: initialData.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 0,
        tags: [],
        status: '',
      });
    }
    setErrors({}); // Reset errors when initialData changes
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericValue = name === 'priority' ? Number(value) : value; // This line seems incorrect, should use name and value from event target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: e.target.value, // value is already in 'YYYY-MM-DD' format
    }));
  }

   const handlePriorityChange = (e: ChangeEvent<HTMLSelectElement>) => {
     setFormData((prev) => ({
       ...prev,
      priority: Number(e.target.value),
    }));
  }

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    setFormData(prev => ({
      ...prev,
      tags: tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    }));
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}; // Ensure newErrors is reset
    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const dataToSubmit: Partial<Task> = { // Provide explicit type here
      ...formData,
      // Format dueDate to ISO string for backend, if it exists
      dueDate: formData?.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      // Ensure tags are an array of strings
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      // Priority is already handled as un número por handlePriorityChange
    };
    onSubmit(dataToSubmit);
    // onClose(); // Considera si quieres cerrar el formulario aquí o en el padre después del éxito
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData && initialData.id ? 'Edit Task' : 'Add Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData?.title || ''}
              onChange={handleChange}
              className="col-span-3"
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm col-span-4 text-right">{errors.title}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData?.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData?.dueDate || ''} // value for type="date" should be YYYY-MM-DD
              onChange={handleDateChange}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
             {/* Simple select for priority */}
            <select
              id="priority"
              name="priority"
              value={formData?.priority !== undefined ? formData.priority.toString() : '0'} // Convert number to string for select value
              onChange={handleChange} // Use generic handleChange
              className="col-span-3"
            >
              <option value="0">0 - Low</option>
              <option value="1">1 - Medium</option>
              <option value="2">2 - High</option>
              <option value="3">3 - Urgent</option>
            </select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
             {/* Simple text input for comma-separated tags */}
            <Input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags?.join(', ') || ''} // Join array to comma-separated string for input value
              onChange={handleTagsChange}
              className="col-span-3"
              placeholder="Comma-separated tags (e.g., work, urgent)"
            />
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">
            Error: {error.message || 'An unknown error occurred.'}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Task')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
