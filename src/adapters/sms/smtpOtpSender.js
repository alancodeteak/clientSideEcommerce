import nodemailer from "nodemailer";
import { SmsSender } from "../../application/ports/SmsSender.js";
import { logger } from "../../config/logger.js";

export class SmtpOtpSender extends SmsSender {
  constructor({
    host,
    port = 587,
    user,
    pass,
    fromEmail,
    secure = false
  }) {
    super();
    this.fromEmail = fromEmail;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }

  async sendOtp({ to, code }) {
    await this.transporter.sendMail({
      from: this.fromEmail,
      to,
      subject: "Your OTP Code",
      text: `Your OTP code is ${code}. This code expires soon.`
    });

    logger.info(
      {
        event: "api.auth.otp.sent",
        provider: "smtp",
        recipient: to
      },
      "OTP sent (smtp sender)"
    );
  }
}
