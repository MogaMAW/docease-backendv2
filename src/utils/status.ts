import { EventEmitter } from "events";
import { TStatus } from "../types/status";

class Status {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  emitStatusEvent(message: TStatus) {
    this.eventEmitter.emit("status", message);
  }

  listenStatusEvent() {
    return this.eventEmitter;
  }
}

const status = new Status();

export { status };
