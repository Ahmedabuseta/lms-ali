'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw } from 'lucide-react';

interface PracticeOptionsProps {
  onRefresh: () => void;
  onShowSettings: () => void;
}

export const PracticeOptions = ({ onRefresh, onShowSettings }: PracticeOptionsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Practice Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" size="sm" className="w-full" onClick={handleRefresh}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Get New Questions
        </Button>

        <Button variant="outline" size="sm" className="w-full" onClick={onShowSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Change Settings
        </Button>
      </CardContent>
    </Card>
  );
};
