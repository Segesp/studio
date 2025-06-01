'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, KanbanSquare, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskItem } from '@/components/task-list/TaskItem';
import { TaskForm } from '@/components/task-list/TaskForm';
import { Loader } from '@/components/ui/loader';

// Assuming a Task interface based on your Prisma schema/API responses
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  tags?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Function to fetch tasks from the API
const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
};

// Assuming a basic Task structure for form data
interface TaskFormData extends Partial<Task> {
  // Include any fields used in the form that might be slightly different initially
  // e.g., dueDate might be a string from input before conversion
}

export default function TaskListPage() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading, error } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Ajuste para que editingTask nunca sea null, sino undefined
  const [editingTask, setEditingTask] = useState<Partial<Task>>();

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined); // Reset editing task when form is closed
  };

  // Mutation for updating task status
  const onToggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('Toggle status mutation called', { id, status });
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error('Failed to update task status');
      }
      return res.json(); // Or handle 200/204 appropriately
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refetch tasks after successful update
    },
  });

  // Mutation for deleting a task
  const onDelete = useMutation({
    mutationFn: async (id: string) => {
      console.log('Delete mutation called', id);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete task');
      }
      // No body for 204, just check res.ok
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refetch tasks after successful deletion
    },
  });

  return (
    <div>
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ListChecks className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Task Management</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Organize your to-dos with priorities, deadlines, and statuses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
            <img 
              src="https://placehold.co/800x400.png" 
              alt="Task list placeholder" 
              width={400} 
              height={200} 
              className="mb-4 rounded-md opacity-70"
              data-ai-hint="task board"
            />
            <h2 className="text-2xl font-semibold text-foreground">Task List Feature In Progress</h2>
            <p className="text-muted-foreground">
              This section will provide a comprehensive task management system, including
              Kanban views, status tracking, and smart notifications.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <KanbanSquare className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Kanban View</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize your workflow with an optional Kanban board and drag-and-drop task movement.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Tag className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Priorities & Tags</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set priorities, due dates, and apply tags for efficient filtering and organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <h1 className="text-3xl font-bold">Task List</h1>
      <button className="mb-4 flex items-center" onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
      </button>
      {isLoading && <Loader />}
      {error && (
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      )}
      {!isLoading && !error && tasks && (
        tasks.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No tasks yet. Create your first task!
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={(id, status) => onToggleStatus.mutate({ id, status })}
                onEdit={setEditingTask}
                onDelete={(id) => onDelete.mutate(id)}
              />
            ))}
          </div>
        )
      )}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={(formData) => {
          if (formData.id) {
            // Edit operation
            console.log('Submit Edit Mutation Placeholder:', formData);
          } else {
            // Create operation
            console.log('Submit Create Mutation Placeholder:', formData);
          }
        }}
        initialData={editingTask}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
