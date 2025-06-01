import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, Edit3 } from "lucide-react";
import Image from "next/image";

export default function CollaborativeDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Collaborative Document Editing</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Create, edit, and collaborate on documents in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt="Collaborative editing placeholder" 
              width={400} 
              height={200} 
              className="mb-4 rounded-md opacity-70"
              data-ai-hint="document editing"
            />
            <h2 className="text-2xl font-semibold text-foreground">Document Editor Coming Soon!</h2>
            <p className="text-muted-foreground">
              This section will feature a rich text editor enabling real-time collaboration,
              version history, and seamless synchronization across your team.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Users className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Real-time Collaboration</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Multiple users can edit the same document simultaneously, seeing changes as they happen.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Edit3 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Rich Text Formatting</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enjoy a full suite of formatting tools: bold, italics, lists, tables, image embedding, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
