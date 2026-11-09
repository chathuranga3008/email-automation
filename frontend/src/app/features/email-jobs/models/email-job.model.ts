export interface SendEmailRequest {
  recordId: number;
  templateId: number;
  idempotencyKey: string;
}

export interface EmailJobResponse {
  id: number;
  status: string;
  totalRecipients: number;
  createdAt: string;
}

export interface EmailJobHistory {
  id: number;
  recordReference: string;
  recordTitle: string;
  templateName: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface EmailJobDetails {
  id: number;
  recordReference: string;
  recordTitle: string;
  templateName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdBy: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface EmailJobLog {
  id: number;
  recipientName: string;
  recipientEmail: string;
  status: string;
  attemptCount: number;
  isRetryable: boolean;
  lastAttemptAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
}
