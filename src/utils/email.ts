import path from "path";
import pug from "pug";
import SGmail from "@sendgrid/mail";

export class Email {
  from: string;
  recipients: string;
  subject: string;
  constructor(recipients: string, subject: string) {
    SGmail.setApiKey(process.env.SENDGRID_API_KEY!);

    this.from = "docease.app@gmail.com";
    this.recipients = recipients;
    this.subject = subject;
  }

  async sendHtml(html: any, subject: string) {
    const mailOptions = {
      to: this.recipients,
      from: { email: this.from, name: "Docease" },
      subject: subject,
      html: html,
    };
    try {
      console.log("sending mail");
      await SGmail.send(mailOptions);
      console.log("mail sent");
    } catch (error) {
      console.log("error sending email", error);
    }
  }

  async sendWelcome(firstName: string) {
    const html = pug.renderFile(
      path.join(__dirname, "../views/email/welcome.pug"),
      {
        subject: this.subject,
        firstName: firstName,
      }
    );
    await this.sendHtml(html, "Welcome to Docease");
  }

  async sendPasswordReset(url: string, firstName: any) {
    const html = pug.renderFile(
      path.join(__dirname, "../views/email/resetPassword.pug"),
      {
        subject: "Password Reset",
        firstName: firstName,
        resetURL: url,
      }
    );
    await this.sendHtml(html, "Reset Password");
  }

  async sendVerificationToken(
    token: string,
    url: string,
    device: string,
    firstName: string
  ) {
    const html = pug.renderFile(
      path.join(__dirname, "../views/email/verificationToken.pug"),
      {
        subject: "New Device Verification Token",
        firstName: firstName,
        verificationURL: url,
        verificationToken: token,
        device: device,
      }
    );
    await this.sendHtml(html, "New Device Verification Token");
  }

  async send2FAConfirmationToken(
    token: string,
    firstName: string,
    device: string
  ) {
    const html = pug.renderFile(
      path.join(__dirname, "../views/email/twoFAConfirmationToken.pug"),
      {
        subject: "2FA Confirmation Token",
        firstName: firstName,
        twoFAConfirmationToken: token,
        device: device,
      }
    );
    await this.sendHtml(html, "2FA Confirmation Token");
  }
}
