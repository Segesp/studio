'use client';

import * as React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Assuming Task interface is defined elsewhere, e.g., in a shared types file
// For now, defining a basic one here based on previous analysis:
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // e.g., "pending", "in_progress", "done"
  priority?: number;
  dueDate?: string; // ISO string
  tags?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}


interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string, newStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleStatus, onEdit, onDelete }: TaskItemProps) {
  const isDone = task.status === 'done';

  const handleToggle = () => {
    const newStatus = isDone ? 'pending' : 'done';
    onToggleStatus(task.id, newStatus);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    // Optional: add a confirmation dialog before deleting
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-b last:border-b-0",
      isDone && "opacity-70 line-through"
    )}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Checkbox
          checked={isDone}
          onCheckedChange={handleToggle}
          id={`task-${task.id}`}
          aria-label={`Mark task "${task.title}" as ${isDone ? 'pending' : 'done'}`}
        />
        <label
          htmlFor={`task-${task.id}`}
          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 break-words"
        >
          {task.title}
          {/* You might add more details like due date, priority here */}
          {task.dueDate && (
              <span className="block text-xs text-muted-foreground mt-1">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
          )}
        </label>
      </div>
      <div className="flex items-center space-x-1 ml-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          aria-label={`Edit task "${task.title}"`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={`Delete task "${task.title}"`}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}