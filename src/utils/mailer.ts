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

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
};

const mailUser = required('MAIL_USER');
const mailPassword = required('MAIL_PASSWORD');
const mailFrom = process.env.MAIL_FROM ?? `"FitQuest" <${mailUser}>`;
const mailService = process.env.MAIL_SERVICE ?? 'gmail';
const mailHost = process.env.MAIL_HOST;
const mailPort = toNumber(process.env.MAIL_PORT, 465);
const secureConnection = toBoolean(process.env.MAIL_SECURE, mailPort === 465);
const connectionTimeout = toNumber(process.env.MAIL_CONNECTION_TIMEOUT_MS, 10_000);
const greetingTimeout = toNumber(process.env.MAIL_GREETING_TIMEOUT_MS, 10_000);
const socketTimeout = toNumber(process.env.MAIL_SOCKET_TIMEOUT_MS, 15_000);

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

    try {
      console.info('[Mailer] SMTP config', {
        host: mailHost ?? `(service:${mailService})`,
        port: mailPort,
        secure: secureConnection,
        user: mailUser,
        hasPassword: Boolean(mailPassword),
        passwordLength: mailPassword.length,
        connectionTimeout,
        greetingTimeout,
        socketTimeout,
      });

      await transport.verify();
      console.info('[Mailer] SMTP verify success');
    } catch (error: any) {
      console.error('[Mailer] SMTP verify failed', {
        message: error?.message,
        code: error?.code,
        command: error?.command,
        response: error?.response,
        responseCode: error?.responseCode,
      });
      throw error;
    }

    await transport.sendMail({
      from: mailFrom,
      to: email,
      subject,
      html: message,
    });
  },
};
