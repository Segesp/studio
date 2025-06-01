'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, KanbanSquare, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskItem } from '@/components/task-list/TaskItem';
import { TaskForm } from '@/components/task-list/TaskForm';
import { Loader } from '@/components/ui/loader';
import { useTaskSync } from '@/hooks/use-websocket';
import { useSession } from 'next-auth/react';
import { ConnectionStatus } from '@/components/sync/connection-status';

// Assuming a Task interface based on your Prisma schema/API responses
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: number;
  tags?: string; // Changed from string[] to string to match SQLite schema
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
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: tasks, isLoading, error } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Ajuste para que editingTask nunca sea null, sino undefined
  const [editingTask, setEditingTask] = useState<Partial<Task>>();

  // Real-time task synchronization
  const { syncTaskUpdate, syncTaskCreation, syncTaskDeletion, taskUpdates, connected } = useTaskSync(session?.user?.id || null);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined); // Reset editing task when form is closed
  };

  // Listen for real-time task updates from other clients
  useEffect(() => {
    if (!connected || taskUpdates.length === 0) return;

    // Invalidate queries when receiving real-time updates from other clients
    const latestUpdate = taskUpdates[taskUpdates.length - 1];
    console.log('Received real-time task update:', latestUpdate);
    
    // Refresh tasks when we receive updates from other clients
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    
  }, [taskUpdates, connected, queryClient]);  // Mutation for creating/updating a task
  const createOrUpdateTask = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `/api/tasks/${formData.id}` : '/api/tasks';
      
      // Handle tags conversion for API
      const apiData = {
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to ${formData.id ? 'update' : 'create'} task`);
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsFormOpen(false);
      setEditingTask(undefined);
      
      // Sync to other clients via WebSocket
      if (editingTask?.id) {
        syncTaskUpdate(data);
      } else {
        syncTaskCreation(data);
      }
    },
  });

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refetch tasks after successful update
      
      // Sync status change to other clients
      syncTaskUpdate(data);
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refetch tasks after successful deletion
      
      // Sync deletion to other clients
      syncTaskDeletion(id);
    },
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ListChecks className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-headline">Task Management</CardTitle>
                <CardDescription className="text-lg">
                  Organize your to-dos with priorities, deadlines, and statuses.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus />
              <button 
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors" 
                onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
              >
                <PlusCircle className="h-4 w-4" /> 
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && <Loader />}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">Error loading tasks</p>
              <p className="text-destructive/80 text-sm">{error.message}</p>
            </div>
          )}
          {!isLoading && !error && tasks && (
            tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
                <ListChecks className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground">No tasks yet</h3>
                  <p className="text-muted-foreground">
                    Create your first task to get started with organizing your work!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={(id, status) => onToggleStatus.mutate({ id, status })}
                    onEdit={(task) => { setEditingTask(task); setIsFormOpen(true); }}
                    onDelete={(id) => onDelete.mutate(id)}
                  />
                ))}
              </div>
            )
          )}
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <KanbanSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Kanban View</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize your workflow with an optional Kanban board and drag-and-drop task movement.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Tag className="h-5 w-5 text-secondary-foreground" />
                <h3 className="font-semibold">Smart Organization</h3>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask?.id ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            onClose={handleCloseForm}
            onSubmit={(formData) => {
              createOrUpdateTask.mutate(formData);
            }}
            initialData={editingTask}
            isLoading={createOrUpdateTask.isPending}
            error={createOrUpdateTask.error}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
