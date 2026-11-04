export interface EmailTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  subjectTemplate: string;
  bodyHtml: string | null;
  bodyText: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  templateCode: string;
  templateName: string;
  subjectTemplate: string;
  bodyHtml: string;
  bodyText: string | null;
}

export interface UpdateEmailTemplateRequest {
  templateName: string;
  subjectTemplate: string;
  bodyHtml: string;
  bodyText: string | null;
}
