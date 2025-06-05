import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, User, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectHistoryDialogProps {
  projectId: number;
  projectTitle: string;
}

interface ProjectHistoryEntry {
  id: number;
  userId: number;
  projectId: number;
  action: string;
  details: any;
  createdAt: string;
  user?: {
    email: string;
    name?: string;
  };
}

export default function ProjectHistoryDialog({ projectId, projectTitle }: ProjectHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/history`],
    enabled: open
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'project_created':
        return <Activity className="h-4 w-4 text-green-600" />;
      case 'workflow_step_updated':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'script_uploaded':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'analysis_completed':
        return <Activity className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'project_created':
        return 'Project Created';
      case 'workflow_step_updated':
        return 'Workflow Updated';
      case 'script_uploaded':
        return 'Script Uploaded';
      case 'analysis_completed':
        return 'Analysis Completed';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDetails = (action: string, details: any) => {
    if (!details) return null;
    
    switch (action) {
      case 'project_created':
        return `Title: ${details.title}`;
      case 'workflow_step_updated':
        return `Step: ${details.step}`;
      case 'script_uploaded':
        return `File: ${details.fileName || 'Unknown'}`;
      default:
        return JSON.stringify(details);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-600">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Project History</span>
          </DialogTitle>
          <DialogDescription>
            Activity log for "{projectTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry: ProjectHistoryEntry, index: number) => (
                <div key={entry.id}>
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {getActionLabel(entry.action)}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        <span>{entry.user?.name || entry.user?.email || 'Unknown User'}</span>
                      </div>
                      
                      {entry.details && (
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          {formatDetails(entry.action, entry.details)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < history.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No activity history found for this project.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}