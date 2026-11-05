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
