export type TNotification = {
  userId: string;
  message: string;
  deviceToken?: string;
  title?: TPushNotificationTitleEnum;
  body?: string;
  link?: string;
};

export enum TPushNotificationTitleEnum {
  APPOINTMENT = "Appointment",
  MESSAGE = "Message",
  MEDICATION = "Medication",
}

export type TPushNotificationInput = {
  deviceToken: string;
  title: TPushNotificationTitleEnum;
  body: string;
};

export type TConfNotification = {
  userId: string;
  videoConferenceId: string;
  message?: string;
  peerId?: string;
};
