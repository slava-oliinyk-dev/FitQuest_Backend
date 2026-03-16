import { config as loadEnv } from 'dotenv';
import nodemailer from 'nodemailer';

loadEnv();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Mailer] Missing environment variable: ${key}`);
  }
  return value;
};

const mailUser = required('MAIL_USER');
const mailPassword = required('MAIL_PASSWORD');
const mailFrom = process.env.MAIL_FROM ?? `"FitQuest" <${mailUser}>`;
const mailService = process.env.MAIL_SERVICE ?? 'gmail';
const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
const secureConnection = process.env.MAIL_SECURE
  ? process.env.MAIL_SECURE === 'true'
  : mailPort === 465;
const connectionTimeout = Number(process.env.MAIL_CONNECTION_TIMEOUT_MS ?? 10_000);
const greetingTimeout = Number(process.env.MAIL_GREETING_TIMEOUT_MS ?? 10_000);
const socketTimeout = Number(process.env.MAIL_SOCKET_TIMEOUT_MS ?? 15_000);

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transport = nodemailer.createTransport({
      service: mailHost ? undefined : mailService,
      host: mailHost,
      port: mailPort,
      secure: secureConnection,
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      auth: {
        user: mailUser,
        pass: mailPassword,
      },
    });

    await transport.verify();

    await transport.sendMail({
      from: mailFrom,
      to: email,
      subject,
      html: message,
    });
  },
};
