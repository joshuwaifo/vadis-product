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
    id: 'analysis_dashboard',
    title: 'Analysis Dashboard',
    description: 'Run and manage script analysis tools',
    status: 'pending'
  },
  {
    id: 'finalize_project',
    title: 'Finalize Project',
    description: 'Complete project and publish to marketplace',
    status: 'pending'
  }
];

export interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'error';
  icon: string;
  estimatedTime: string;
  completedAt?: Date;
}

export const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: 'scene_extraction',
    title: 'Scene Extraction & Breakdown',
    description: 'Extract and analyze individual scenes from the script',
    status: 'not_started',
    icon: 'Film',
    estimatedTime: '2-3 min'
  },
  {
    id: 'character_analysis',
    title: 'Character Analysis',
    description: 'Analyze characters and their relationships',
    status: 'not_started',
    icon: 'Users',
    estimatedTime: '3-4 min'
  },
  {
    id: 'casting_suggestions',
    title: 'Casting Suggestions',
    description: 'AI-powered actor recommendations for each character',
    status: 'not_started',
    icon: 'Star',
    estimatedTime: '4-5 min'
  },
  {
    id: 'location_analysis',
    title: 'Location Analysis',
    description: 'Identify filming locations and logistics',
    status: 'not_started',
    icon: 'MapPin',
    estimatedTime: '3-4 min'
  },
  {
    id: 'vfx_analysis',
    title: 'VFX Requirements',
    description: 'Analyze visual effects needs and complexity',
    status: 'not_started',
    icon: 'Zap',
    estimatedTime: '3-4 min'
  },
  {
    id: 'product_placement',
    title: 'Product Placement',
    description: 'Identify brand integration opportunities',
    status: 'not_started',
    icon: 'Package',
    estimatedTime: '2-3 min'
  },
  {
    id: 'financial_planning',
    title: 'Financial Planning',
    description: 'Budget estimation and revenue projections',
    status: 'not_started',
    icon: 'DollarSign',
    estimatedTime: '4-5 min'
  },
  {
    id: 'project_summary',
    title: 'Project Summary',
    description: 'Comprehensive reader\'s report and summary',
    status: 'not_started',
    icon: 'FileText',
    estimatedTime: '3-4 min'
  }
];