'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 as Loader } from 'lucide-react';
// Unifico la definición de Task para que incluya createdAt y updatedAt opcionales
interface Task {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  tags?: string; // Changed to string to match SQLite schema
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  title?: string;
}

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => void;
  initialData?: Partial<Task>; // Use Partial for initialData as not all fields may be present
  isLoading: boolean; // Add isLoading prop
  error: Error | null; // Add error prop
}

export function TaskForm({ onClose, onSubmit, initialData, isLoading, error }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    priority: 0,
    tags: '',
    status: '',
  });
 const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        priority: initialData.priority !== undefined ? initialData.priority : 0,
        tags: initialData.tags || '',
        status: initialData.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 0,
        tags: '',
        status: '',
      });
    }
    setErrors({});
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
    setFormData(prev => ({
      ...prev,
      tags: e.target.value,
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

    const dataToSubmit: Partial<Task> = {
      ...formData,
      dueDate: formData?.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Title *
          </Label>
          <Input
            id="title"
            name="title"
            value={formData?.title || ''}
            onChange={handleChange}
            className="mt-1"
            placeholder="Enter task title"
            required
          />
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData?.description || ''}
            onChange={handleChange}
            className="mt-1"
            placeholder="Enter task description"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData?.dueDate || ''}
              onChange={handleDateChange}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <select
              id="priority"
              name="priority"
              value={formData?.priority !== undefined ? formData.priority.toString() : '0'}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="0">🟢 Low</option>
              <option value="1">🟡 Medium</option>
              <option value="2">🟠 High</option>
              <option value="3">🔴 Urgent</option>
            </select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="tags" className="text-sm font-medium">
            Tags
          </Label>
          <Input
            id="tags"
            name="tags"
            type="text"
            value={formData.tags || ''}
            onChange={handleTagsChange}
            className="mt-1"
            placeholder="Comma-separated tags (e.g., work, urgent)"
          />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">
            Error: {error.message || 'An unknown error occurred.'}
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Task')}
        </Button>
      </div>
    </div>
  );
}
