import axios from "axios";
import dotenv from "dotenv";
import { Tsms } from "../types/sms";
import FormData from "form-data";

dotenv.config();

export class SMS {
  private phoneNumberString: string;
  constructor(phoneNumberString: string) {
    this.phoneNumberString = phoneNumberString;
  }

  async sendSMS(message: string, ssid: string) {
    let data = new FormData();
    data.append("key", process.env.PIMERUG_API_KEY);
    data.append("action", "sms");
    data.append("ssid", ssid);
    data.append("contacts", this.phoneNumberString);
    data.append("message", message);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://app.pimerug.com/api/v1.php",
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async sendVerificationToken(token: string) {
    const message = `Your verification token is ${token}. Please don't share it with anyone`;
    const ssid = "Docease";

    await this.sendSMS(message, ssid);
  }

  async send2FAConfirmationToken(token: string) {
    const message = `Your 2FA confirmation token is ${token}. Please don't share it with anyone`;
    const ssid = "Docease";

    await this.sendSMS(message, ssid);
  }
}
