'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useQuery } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react'; // Import TipTap hooks and components
import Collaboration from '@tiptap/extension-collaboration'; // Import TipTap Collaboration extension
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'; // Import TipTap CollaborationCursor extension
import StarterKit from '@tiptap/starter-kit'; // Import TipTap StarterKit
import * as Y from 'yjs'; // Import Yjs
import { WebsocketProvider } from 'y-websocket'; // Import WebsocketProvider
import { useSession } from 'next-auth/react'; // Import useSession

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { DialogTitle } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader } from '@/components/ui/loader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

// Define a basic Doc interface for frontend use
interface Doc {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Define an asynchronous function to fetch documents
const fetchDocs = async (): Promise<Doc[]> => {
  const res = await fetch('/api/docs');
  if (!res.ok) {
    throw new Error('Failed to fetch documents');
  }
  return res.json();
};

// Function to fetch document content (latest version) - Placeholder for now
const fetchDocContent = async (docId: string): Promise<any> => {
    // This should fetch the content from your /api/docs/[id] or /api/docs/[id]/versions endpoint
    // For now, returning empty object
    console.log("Fetching content for doc:", docId);
    const res = await fetch(`/api/docs/${docId}?include=versions&latest=true`); // Example fetch, adjust according to your API
     if (!res.ok) {
        throw new Error('Failed to fetch document content');
    }
    const doc = await res.json();
    // Assuming your API returns the latest version content within the doc object
    return doc.versions?.[0]?.content || {}; // Adjust based on your actual API response structure
};


export default function CollaborativeDocsPage() {
  const { data: session } = useSession(); // Get session for collaboration cursor
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null); // State for Yjs doc
  const [provider, setProvider] = useState<WebsocketProvider | null>(null); // State for Yjs provider


  const { data: docs, isLoading: isLoadingDocs, error: docsError } = useQuery({
    queryKey: ['collaborativeDocs'],
    initialData: [] as Doc[],
    queryFn: fetchDocs,
  });

   // Effect to initialize Yjs and TipTap editor when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      // Cleanup previous provider if exists
      provider?.destroy();
      ydoc?.destroy(); // Destroy previous ydoc

      const newYdoc = new Y.Doc();
      setYdoc(newYdoc);

      // Initialize WebsocketProvider - REPLACE WITH YOUR ACTUAL WS SERVER URL
      const newProvider = new WebsocketProvider(
        'wss://your-yjs-websocket-server.com', // Replace with your WebSocket server URL
        selectedDoc.id, // Use document ID as the room name
        newYdoc,
         { // Optional: Add auth parameters if your WS server requires
            params: {
                // token: session?.accessToken // Assuming accessToken is available in session
                // Si necesitas un token, obténlo de otra forma o elimina esta línea si no es necesario
            }
         }
      );
       setProvider(newProvider);

      // Load initial content (placeholder logic)
      // In a real app, you'd fetch the latest version from your backend
       fetchDocContent(selectedDoc.id).then(initialContent => {
           // Apply initial content to the ydoc
           // Depending on your CRDT content format, this might involve
           // loading a snapshot or applying updates.
           // For simplicity, this is a placeholder. You might need a Yjs specific loading mechanism.
           console.log("Loaded initial content:", initialContent);
            // Example: if initialContent is a Yjs update binary
           // Y.applyUpdate(newYdoc, new Uint8Array(initialContent));
           // Or if your editor loads content from a plain text/JSON representation of the CRDT state
           // Editor instance will need to load this content.
       }).catch(err => {
           console.error("Failed to load initial document content:", err);
       });


      // Cleanup provider and ydoc when component unmounts or selectedDoc changes
      return () => {
        newProvider.destroy();
        newYdoc.destroy();
         setProvider(null);
         setYdoc(null);
      };
    } else {
         // Cleanup provider and ydoc if selectedDoc becomes null
        provider?.destroy();
        ydoc?.destroy();
        setProvider(null);
        setYdoc(null);
    }
  }, [selectedDoc, session]); // Re-run effect when selectedDoc or session changes


  // Configure TipTap editor
   const editor = useEditor({
    extensions: [
      StarterKit, // Basic extensions like bold, italic, lists
      Collaboration.configure({
        document: ydoc as Y.Doc, // Pass the Yjs document
      }),
      CollaborationCursor.configure({
        provider: provider as WebsocketProvider, // Pass the WebsocketProvider
        user: {
          name: session?.user?.name || 'Anonymous', // Display user name
          color: '#ffcc00', // Placeholder color, use a random color function in real app
        },
         // Optional: disable cursors if provider or ydoc is null
         render(user) {
             const cursorBuilder = document.createElement('span');
             cursorBuilder.style.cssText = `border-left: 2px solid ${user.color}; border-bottom: 2px solid ${user.color}; position: absolute; pointer-events: none;`;
             const label = document.createElement('span');
             label.style.cssText = `background-color: ${user.color}; color: white; font-size: 0.75rem; line-height: 1rem; padding: 2px 4px; white-space: nowrap;`;
             label.innerText = user.name;
             cursorBuilder.appendChild(label);
             return cursorBuilder;
         }
      }),
    ],
    // Set initial content here if not loading from Yjs document directly
    // content: \'<p>Loading document...</p>\',
     editorProps: {
         attributes: {
             className: 'prose dark:prose-invert max-w-none focus:outline-none', // Basic Tailwind prose styles
         },
     },
     // Dependency array for useEditor
  }, [ydoc, provider, session]); // Re-initialize editor when ydoc, provider or session changes


  const handleCloseCreateDocModal = () => {
    setIsCreateDocModalOpen(false);
    setNewDocTitle('');
  };

  // Placeholder function for creating a document
  const onCreateDocSubmit = (title: string) => {
    console.log('Creating document with title:', title);
    // TODO: Implement actual mutation to POST /api/docs
    handleCloseCreateDocModal();
  };

  return (
    <div className="flex h-screen"> {/* Adjusted height for full screen */}
      {/* List Section (Sidebar) */}
      <div className="w-64 flex-none border-r p-4 bg-background overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
        <Button className="mb-4 w-full" onClick={() => setIsCreateDocModalOpen(true)}>
          Create New Document
        </Button>
        {isLoadingDocs && (
          <div className="flex justify-center"><Loader size={24} /></div>
        )}
        {docsError && (
          <div className="text-red-500 text-sm">Error loading docs: {docsError.message}</div>
        )}
         {docs && Array.isArray(docs) && docs.length === 0 && !isLoadingDocs && (
            <p className="text-muted-foreground text-sm text-center">No documents yet. Click above to create one.</p>
 )}
        {docs && Array.isArray(docs) && (
          <div className="space-y-2">
            {docs.map((doc: Doc) => (
              <button
 // Using a button for accessibility and correct styling

                key={doc.id}
                className={`w-full text-left p-2 rounded-md hover:bg-accent transition-colors ${
                  selectedDoc?.id === doc.id ? 'bg-accent text-accent-foreground' : 'text-foreground'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Section (Main Content) */}
      <div className="flex-1 flex flex-col bg-card overflow-hidden"> {/* Use flex-col for title + editor layout */}
 {selectedDoc ? (
           <> {/* Use fragment if multiple top-level elements */}
            <div className="p-6 border-b bg-background"> {/* Title section */}
                <h2 className="text-2xl font-bold">{selectedDoc.title}</h2>
                {/* Optional: Add last edited info here */}
            </div>
             <div className="flex-1 overflow-y-auto p-6"> {/* Editor content area */}
               {/* Placeholder for Rich Text Editor */}
                 {editor ? (
                    <EditorContent editor={editor} />
                 ) : (
                     <div className="flex h-full items-center justify-center">
                         <Loader size={32} /> {/* Show loader while editor initializes */}
                     </div>
                 )}
             </div>
           </>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-muted-foreground text-lg text-center">
              Select a document from the list or create a new one to start collaborating.
            </p>
          </div>
        )}
      </div>

      {/* Create New Document Dialog */}
      <Dialog open={isCreateDocModalOpen} onOpenChange={setIsCreateDocModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newDocTitle" className="text-right">
                Title
              </Label>
              <Input
                id="newDocTitle"
                value={newDocTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
 </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateDocModal}>
              Cancel
            </Button>
            <Button onClick={() => onCreateDocSubmit(newDocTitle)}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
