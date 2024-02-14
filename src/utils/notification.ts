import { EventEmitter } from "events";
// import { initializeApp } from "firebase/app";
// import { getMessaging } from "firebase/messaging";
import {
  TNotification,
  TPushNotificationTitleEnum,
} from "../types/notification";
// import { firebaseConfig,  } from "../config/firebase";
import { firebaseAdmin } from "../config/firebaseAdmin";

class Notification {
  private eventEmitter: EventEmitter;
  private firebaseMessaging: any;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(50);

    // const firebaseApp = initializeApp(firebaseConfig);
    // this.firebaseMessaging = getMessaging(firebaseApp);
    this.firebaseMessaging = firebaseAdmin.messaging;
  }

  emitNotificationEvent(message: TNotification) {
    this.eventEmitter.emit("notification", message);
  }

  listenNotificationEvent() {
    return this.eventEmitter;
  }

  async sendPushNotification(
    deviceToken: string,
    title: TPushNotificationTitleEnum,
    bodyContent: string
  ) {
    // const message = {
    //   // data: {
    //   //   score: '850',
    //   //   time: '2:45'
    //   // },
    //   data: data,
    //   token: deviceToken,
    // };
    const message = {
      notification: {
        title: title,
        body: bodyContent,
        requireInteraction: true,
      },
      webpush: {
        notification: {
          icon: "https://res.cloudinary.com/dlmv4ot9h/image/upload/v1707821338/DoceaseV2/docease-logo.jpg",
        },
      },
      token: deviceToken,
    };

    // this.firebaseMessaging
    //   .send(message)
    //   .then((response: string) => {
    //   })
    //   .catch((error: any) => {
    //     console.error("Error sending FCM message:", error);
    //   });
    try {
      const response = await this.firebaseMessaging.send(message);
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending FCM message:", error);
    }
  }
}

const notification = new Notification();

export { notification };
