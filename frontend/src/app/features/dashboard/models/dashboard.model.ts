export interface DashboardSummary {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  partialJobs: number;
  failedJobs: number;
  totalRecipients: number;
  sentRecipients: number;
  failedRecipients: number;
}

export interface RecentEmailJob {
  id: number;
  recordReference: string;
  recordTitle: string;
  templateName: string;
  subject: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
