import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Loader2, Upload, FileUp, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { PendingContent } from "@/types/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadForm from "@/components/upload-form";

const contentFilter = (content: PendingContent, searchTerm: string, selectedType: string): boolean => {
  if (selectedType !== 'all' && content.type !== selectedType) return false;
  const term = searchTerm.toLowerCase();
  return Boolean(
    content.title?.toLowerCase().includes(term) ||
    content.description?.toLowerCase().includes(term) ||
    content.content?.toLowerCase().includes(term)
  );
};

// Using React.memo for optimized rendering
const ContentCard = React.memo(({
  content,
  onModerate,
  isSelected,
  onSelect
}: {
  content: PendingContent;
  onModerate: (status: string) => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}) => (
  <Card>
    <CardContent className="flex items-start p-4 gap-4">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
      />
      {content.thumbnailUrl && (
        <img
          src={content.thumbnailUrl}
          alt={content.title || "Content"}
          className="w-48 h-32 object-cover rounded-md"
          loading="lazy"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg">
            {content.title || content.content}
          </h3>
          {content.reportCount && content.reportCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {content.reportCount} reports
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {content.description || content.content}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {content.type}
          </Badge>
          {content.aiTags && content.aiTags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground">
            Posted {new Date(content.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onModerate("approved")}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onModerate("rejected")}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    </CardContent>
  </Card>
));

export default function ContentModeration() {
  const [selectedContent, setSelectedContent] = React.useState<number[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'movies' | 'posts' | 'comments'>('all');
  const [search, setSearch] = React.useState("");
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: pendingContent = [], isLoading, error } = useQuery<PendingContent[]>({
    queryKey: ["/api/admin/content/pending", filter],
    staleTime: 30000,
  });

  // Memoized filtered content to prevent unnecessary recalculations
  const filteredContent = React.useMemo(() => {
    return pendingContent.filter(content => contentFilter(content, search, filter));
  }, [pendingContent, filter, search]);

  // Virtual list setup for better performance with large lists
  const rowVirtualizer = useVirtualizer({
    count: filteredContent.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Approximate height of content card
    overscan: 3
  });

  const handleContentModeration = React.useCallback(async (contentId: number, status: string) => {
    try {
      await apiRequest("POST", `/api/admin/content/${contentId}/moderate`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pending"] });
      toast({
        title: "Success",
        description: `Content ${status === "approved" ? "approved" : "rejected"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleBulkModeration = React.useCallback(async (status: 'approved' | 'rejected') => {
    try {
      await Promise.all(
        selectedContent.map(contentId =>
          apiRequest("POST", `/api/admin/content/${contentId}/moderate`, { status })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pending"] });
      setSelectedContent([]);
      toast({
        title: "Success",
        description: `Successfully ${status} ${selectedContent.length} items`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} content`,
        variant: "destructive",
      });
    }
  }, [selectedContent, toast]);

  const handleBulkImport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiRequest("POST", "/api/admin/movies/bulk-import", formData);
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Success",
        description: "Movies imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import movies",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        <h3 className="font-semibold mb-2">Error loading content</h3>
        <p className="text-sm mb-4">{(error as Error).message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pending"] })}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="moderation">
        <TabsList>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="upload">Upload Movie</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[300px]"
                />
                <Select value={filter} onValueChange={(value: 'all' | 'movies' | 'posts' | 'comments') => setFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="movies">Movies</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="comments">Comments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedContent.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button onClick={() => handleBulkModeration('approved')}>
                    Approve Selected ({selectedContent.length})
                  </Button>
                  <Button variant="destructive" onClick={() => handleBulkModeration('rejected')}>
                    Reject Selected
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[600px]" ref={parentRef}>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const content = filteredContent[virtualRow.index];
                  return (
                    <div
                      key={content.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        padding: '8px 0',
                      }}
                    >
                      <ContentCard
                        content={content}
                        onModerate={(status) => handleContentModeration(content.id, status)}
                        isSelected={selectedContent.includes(content.id)}
                        onSelect={(checked) => {
                          setSelectedContent(checked
                            ? [...selectedContent, content.id]
                            : selectedContent.filter(id => id !== content.id)
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <UploadForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <Input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkImport(file);
                  }}
                  className="hidden"
                  id="bulk-import"
                />
                <label htmlFor="bulk-import" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="h-8 w-8" />
                    <h3 className="font-semibold">Bulk Import Movies</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV or JSON file containing movie data
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}