import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";

// Memoized setting component for better performance
const SettingItem = React.memo(({ 
  title, 
  description, 
  id, 
  defaultChecked = false,
  onChange 
}: {
  title: string;
  description: string;
  id: string;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="space-y-2">
    <h3 className="font-semibold">{title}</h3>
    <div className="flex items-center gap-2">
      <Switch 
        id={id} 
        defaultChecked={defaultChecked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id}>{title}</Label>
    </div>
    <p className="text-sm text-muted-foreground">
      {description}
    </p>
  </div>
));

export default function SystemSettings() {
  const { toast } = useToast();

  // Memoized handlers to prevent unnecessary re-renders
  const handleAutoModerationChange = React.useCallback((checked: boolean) => {
    toast({
      title: "Settings Updated",
      description: `Auto-moderation ${checked ? "enabled" : "disabled"}`,
    });
  }, [toast]);

  const handleRealtimeAnalyticsChange = React.useCallback((checked: boolean) => {
    toast({
      title: "Settings Updated",
      description: `Real-time analytics ${checked ? "enabled" : "disabled"}`,
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SettingItem
                title="Content Moderation"
                description="Automatically moderate content using AI"
                id="auto-moderation"
                onChange={handleAutoModerationChange}
              />
              <SettingItem
                title="Analytics"
                description="Enable real-time data processing"
                id="realtime-analytics"
                onChange={handleRealtimeAnalyticsChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
