'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Focus from '@tiptap/extension-focus';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader } from '@/components/ui/loader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Save, Users, Clock, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDocumentCollaboration } from '@/hooks/use-websocket';
import { ConnectionStatus } from '@/components/sync/connection-status';
import { useSession } from 'next-auth/react';

// Define a basic Doc interface for frontend use
interface Doc {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    name: string;
    email: string;
    image?: string;
  };
  versions?: DocVersion[];
}

interface DocVersion {
  id: string;
  content: any;
  createdAt: string;
  createdBy: string;
}

// Define an asynchronous function to fetch documents
const fetchDocs = async (): Promise<Doc[]> => {
  const res = await fetch('/api/docs');
  if (!res.ok) {
    throw new Error('Failed to fetch documents');
  }
  return res.json();
};

// Function to fetch document content (latest version)
const fetchDocContent = async (docId: string): Promise<string> => {
  const res = await fetch(`/api/docs/${docId}?include=versions&latest=true`);
  if (!res.ok) {
    throw new Error('Failed to fetch document content');
  }
  const doc = await res.json();
  const latestVersion = doc.versions?.[0];
  return latestVersion?.content || '<p>Start writing...</p>';
};


export default function CollaborativeDocsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);

  // Real-time collaboration
  const { 
    collaborators, 
    documentState, 
    sendUpdate, 
    sendPresence, 
    connected: wsConnected 
  } = useDocumentCollaboration(selectedDoc?.id || null);

  const { data: docs, isLoading: isLoadingDocs, error: docsError } = useQuery({
    queryKey: ['collaborativeDocs'],
    queryFn: fetchDocs,
  });

  // Fetch document content when a document is selected
  const { data: docContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['docContent', selectedDoc?.id],
    queryFn: () => fetchDocContent(selectedDoc!.id),
    enabled: !!selectedDoc,
  });

  // Initialize Yjs document when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      const newYdoc = new Y.Doc();
      setYdoc(newYdoc);
      
      // Set up update handler for real-time sync
      const updateHandler = (update: Uint8Array) => {
        sendUpdate(update);
      };
      
      newYdoc.on('update', updateHandler);
      
      // Apply initial document state if available
      if (documentState) {
        Y.applyUpdate(newYdoc, documentState);
      }
      
      return () => {
        newYdoc.off('update', updateHandler);
        newYdoc.destroy();
      };
    } else {
      setYdoc(null);
    }
  }, [selectedDoc, documentState, sendUpdate]);

  // Configure TipTap editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        history: false, // Disable history when using collaboration
      }),
      TextStyle,
      Color,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      // Add collaboration extensions when we have a Yjs document
      ...(ydoc ? [
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: {
            awareness: {
              setLocalStateField: () => {},
              on: () => {},
              off: () => {},
              getStates: () => new Map(),
            } as any,
          },
          user: {
            name: session?.user?.name || 'Anonymous',
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          },
        }),
      ] : []),
    ],
    content: !ydoc ? (docContent || '<p>Loading...</p>') : undefined,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      if (!ydoc) {
        setHasUnsavedChanges(true);
      }
      
      // Send presence info for cursor position
      if (wsConnected && session?.user) {
        sendPresence(session.user, editor.state.selection);
      }
    },
  }, [ydoc, docContent, wsConnected, session?.user, sendPresence]);

  // Update editor content when docContent changes (only for non-collaborative mode)
  useEffect(() => {
    if (editor && docContent && !isLoadingContent && !ydoc) {
      editor.commands.setContent(docContent);
      setHasUnsavedChanges(false);
    }
  }, [editor, docContent, isLoadingContent, ydoc]);

  // Auto-save functionality (only for non-collaborative mode)
  useEffect(() => {
    if (!hasUnsavedChanges || !selectedDoc || !editor || ydoc) return;

    const timer = setTimeout(() => {
      saveDocument();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, selectedDoc, editor, ydoc]);

  // Create document mutation
  const createDocMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to create document');
      return res.json();
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['collaborativeDocs'] });
      setSelectedDoc(newDoc);
      setIsCreateDocModalOpen(false);
      setNewDocTitle('');
      toast({
        title: "Document created",
        description: `"${newDoc.title}" has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save document mutation
  const saveDocMutation = useMutation({
    mutationFn: async ({ docId, content }: { docId: string; content: string }) => {
      const res = await fetch(`/api/docs/${docId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to save document');
      return res.json();
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setIsSaving(false);
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      setIsSaving(false);
      toast({
        title: "Save failed",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDocument = useCallback(() => {
    if (!selectedDoc || !editor || isSaving || ydoc) return; // Don't save if using real-time collaboration
    
    setIsSaving(true);
    const content = editor.getHTML();
    saveDocMutation.mutate({ docId: selectedDoc.id, content });
  }, [selectedDoc, editor, isSaving, ydoc, saveDocMutation]);

  const handleCreateDoc = () => {
    if (!newDocTitle.trim()) return;
    createDocMutation.mutate(newDocTitle.trim());
  };

  const handleCloseCreateDocModal = () => {
    setIsCreateDocModalOpen(false);
    setNewDocTitle('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Documents Sidebar */}
      <div className="w-80 flex-none border-r bg-card overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documents
            </h2>
            <Button size="sm" onClick={() => setIsCreateDocModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingDocs && (
            <div className="flex justify-center p-8">
              <Loader />
            </div>
          )}
          
          {docsError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">Error loading docs: {docsError.message}</p>
            </div>
          )}
          
          {docs && docs.length === 0 && !isLoadingDocs && (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">No documents yet.</p>
              <p className="text-muted-foreground text-sm">Create your first document to start collaborating!</p>
            </div>
          )}
          
          {docs && docs.map((doc: Doc) => (
            <Card
              key={doc.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedDoc?.id === doc.id ? "ring-2 ring-primary bg-primary/5" : ""
              )}
              onClick={() => setSelectedDoc(doc)}
            >
              <CardContent className="p-4">
                <h3 className="font-medium truncate mb-2">{doc.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {formatDate(doc.updatedAt)}</span>
                  {doc.owner && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{doc.owner.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            {/* Document Header */}
            <div className="p-6 border-b bg-card flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{selectedDoc.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Last updated {formatDate(selectedDoc.updatedAt)}
                  </span>
                  {lastSaved && !ydoc && (
                    <span>Saved {formatDate(lastSaved.toISOString())}</span>
                  )}
                  <ConnectionStatus size="sm" />
                  {collaborators.length > 0 && (
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {collaborators.length} colaborador{collaborators.length > 1 ? 'es' : ''} en línea
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && !ydoc && (
                  <Badge variant="secondary">Unsaved changes</Badge>
                )}
                {isSaving && (
                  <Badge variant="outline" className="flex items-center">
                    <Loader className="h-3 w-3 mr-1" />
                    Saving...
                  </Badge>
                )}
                {ydoc && wsConnected && (
                  <Badge variant="default" className="flex items-center">
                    <Wifi className="h-3 w-3 mr-1" />
                    Real-time sync
                  </Badge>
                )}
                {!ydoc && (
                  <Button
                    onClick={saveDocument}
                    disabled={!hasUnsavedChanges || isSaving}
                    variant="outline"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-background">
              {isLoadingContent ? (
                <div className="flex items-center justify-center h-full">
                  <Loader />
                </div>
              ) : editor ? (
                <div className="max-w-4xl mx-auto">
                  <EditorContent editor={editor} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading editor...</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a document to start editing</h3>
              <p className="text-muted-foreground mb-6">
                Choose a document from the sidebar or create a new one to begin collaborating.
              </p>
              <Button onClick={() => setIsCreateDocModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Document
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Document Dialog */}
      <Dialog open={isCreateDocModalOpen} onOpenChange={setIsCreateDocModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDocTitle">Document Title</Label>
              <Input
                id="newDocTitle"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Enter document title..."
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newDocTitle.trim()) {
                    handleCreateDoc();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDocModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDoc}
              disabled={!newDocTitle.trim() || createDocMutation.isPending}
            >
              {createDocMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Document'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
