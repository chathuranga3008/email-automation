export interface EmailTemplate {
  id: number;
  templateCode: string;
  templateName: string;
  subjectTemplate: string;
  bodyHtml: string | null;
  bodyText: string | null;
}
