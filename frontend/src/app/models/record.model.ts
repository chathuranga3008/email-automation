// Existing model used by Send Emails.
export interface Record {
  id: number;
  recordReference: string;
  recordTitle: string;
  description: string | null;
  createdAt: string;
}

// Extended model used by Record Management.
export interface RecordManagement {
  id: number;
  recordReference: string;
  recordTitle: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordRequest {
  recordReference: string;
  recordTitle: string;
  description: string | null;
}

export interface UpdateRecordRequest {
  recordReference: string;
  recordTitle: string;
  description: string | null;
}

export interface RecordStatusRequest {
  isActive: boolean;
}
