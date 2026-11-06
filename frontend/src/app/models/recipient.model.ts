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
