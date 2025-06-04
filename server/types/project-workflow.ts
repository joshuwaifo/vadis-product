export interface ProjectWorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
}

export interface ProjectWorkflow {
  projectId: number;
  currentStep: string;
  steps: ProjectWorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActionLog {
  id: number;
  projectId: number;
  userId: number;
  action: string;
  details: any;
  timestamp: Date;
}

export const PROJECT_WORKFLOW_STEPS: ProjectWorkflowStep[] = [
  {
    id: 'project_info',
    title: 'Project Information',
    description: 'Enter project details and upload script',
    status: 'pending'
  },
  {
    id: 'script_analysis',
    title: 'Script Analysis Tools',
    description: 'Choose analysis features and run AI analysis',
    status: 'pending'
  },
  {
    id: 'review_results',
    title: 'Review Results',
    description: 'Review and edit analysis results',
    status: 'pending'
  },
  {
    id: 'finalize_project',
    title: 'Finalize Project',
    description: 'Complete project and publish to marketplace',
    status: 'pending'
  }
];