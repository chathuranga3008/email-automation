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
