export type TFile = {
  url: string;
  path: string;
  type: string;
};

export type TChatMessage = {
  messageId?: string;
  chatRoomId: string;
  senderId: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: Date;
  updatedAt?: Date;
};
