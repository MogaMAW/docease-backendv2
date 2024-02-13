export type TNotification = {
  userId: string;
  message: string;
};

export enum TPushNotificationTitleEnum {
  APPOINTMENT = "Appointment",
  MESSAGE = "Message",
  MEDICATION = "Medication",
}

export type TPushNotificationInput = {
  deviceToken: string;
  title: TPushNotificationTitleEnum;
  bodyContent: string;
};
