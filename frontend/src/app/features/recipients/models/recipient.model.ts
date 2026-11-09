export interface Recipient {
  recipientId: number;
  recipientName: string;
  emailAddress: string;
}

export interface RecipientManagement {
  recipientId: number;
  recipientName: string;
  emailAddress: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipientRequest {
  recipientName: string;
  emailAddress: string;
}

export interface UpdateRecipientRequest {
  recipientName: string;
  emailAddress: string;
}

export interface RecipientStatusRequest {
  isActive: boolean;
}

export interface RecipientRecordAssignment {
  recordId: number;
  recordReference: string;
  recordTitle: string;
  recordIsActive: boolean;
  isAssigned: boolean;
}

export interface RecipientAssignmentRequest {
  isAssigned: boolean;
}
