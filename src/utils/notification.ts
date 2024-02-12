import { EventEmitter } from "events";
import { TNotification } from "../types/notification";

class Notification {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  emitNotificationEvent(message: TNotification) {
    this.eventEmitter.emit("notification", message);
  }

  listenNotificationEvent() {
    return this.eventEmitter;
  }

  // TODO: To include push notifications using FCM
}

const notification = new Notification();

export { notification };
