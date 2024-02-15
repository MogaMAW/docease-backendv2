import { EventEmitter } from "events";
import { TNotification } from "../types/notification";
import { firebaseAdmin } from "../config/firebaseAdmin";

class Notification {
  private eventEmitter: EventEmitter;
  private firebaseMessaging: any;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(50);
    this.firebaseMessaging = firebaseAdmin.messaging();
  }

  emitNotificationEvent(message: TNotification) {
    this.eventEmitter.emit("notification", message);
  }

  listenNotificationEvent() {
    return this.eventEmitter;
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
