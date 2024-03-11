import { EventEmitter } from "events";
import { TConfNotification, TNotification } from "../types/notification";
import { firebaseAdmin } from "../config/firebaseAdmin";

class Notification {
  private notificationEventEmitter: EventEmitter;
  private confNotificationEventEmitter: EventEmitter;
  private chatEventEmitter: EventEmitter;
  private firebaseMessaging: any;

  constructor() {
    this.notificationEventEmitter = new EventEmitter();
    this.notificationEventEmitter.setMaxListeners(50);
    this.confNotificationEventEmitter = new EventEmitter();
    this.confNotificationEventEmitter.setMaxListeners(50);
    this.chatEventEmitter = new EventEmitter();
    this.chatEventEmitter.setMaxListeners(50);
    this.firebaseMessaging = firebaseAdmin.messaging();
  }

  emitNotificationEvent(message: TNotification) {
    this.notificationEventEmitter.emit("notification", message);
  }

  listenNotificationEvent() {
    return this.notificationEventEmitter;
  }

  listenConfNotificationEvent() {
    return this.confNotificationEventEmitter;
  }

  emitConfNotificationEvent(message: TConfNotification) {
    this.confNotificationEventEmitter.emit("conferenceNotification", message);
  }

  emitChatEvent(message: any) {
    this.chatEventEmitter.emit("chat", message);
  }

  listenChatEvent() {
    return this.chatEventEmitter;
  }

  async sendPushNotification(notification: TNotification) {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      webpush: {
        notification: {
          icon: "https://res.cloudinary.com/dlmv4ot9h/image/upload/v1707821338/DoceaseV2/docease-logo.jpg",
        },
      },
      token: notification.deviceToken,
    };

    try {
      const response = await this.firebaseMessaging.send(message);
      console.log("Successfully sent push notification message:", response);
    } catch (error) {
      console.error("Error sending push notification message:", error);
    }
  }
}

const notification = new Notification();

export { notification };
