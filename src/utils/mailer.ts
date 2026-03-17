import axios from 'axios';
import { config as loadEnv } from 'dotenv';
import nodemailer from 'nodemailer';

loadEnv();

type MailProvider = 'SMTP' | 'RESEND';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[Mailer] Missing environment variable: ${key}`);
  }
  return value;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === 'true';
};

const mailProvider =
  (process.env.MAIL_PROVIDER?.toUpperCase() as MailProvider | undefined) ?? 'SMTP';

const sendWithResend = async (email: string, subject: string, message: string): Promise<void> => {
  const resendApiKey = required('RESEND_API_KEY');
  const mailFrom = required('MAIL_FROM');

  try {
    console.info('[Mailer] Sending with RESEND provider');
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: mailFrom,
        to: [email],
        subject,
        html: message,
      },
      {
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: toNumber(process.env.MAIL_HTTP_TIMEOUT_MS, 10_000),
      },
    );
  } catch (error: any) {
    console.error('[Mailer] Resend send failed', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

const sendWithSmtp = async (email: string, subject: string, message: string): Promise<void> => {
  const mailUser = required('MAIL_USER');
  const mailPassword = required('MAIL_PASSWORD');
  const mailFrom = process.env.MAIL_FROM ?? `"FitQuest" <${mailUser}>`;
  const mailService = process.env.MAIL_SERVICE ?? 'gmail';
  const mailHost = process.env.MAIL_HOST;
  const mailPort = toNumber(process.env.MAIL_PORT, 465);
  const secureConnection = toBoolean(process.env.MAIL_SECURE, mailPort === 465);

  const transport = nodemailer.createTransport({
    service: mailHost ? undefined : mailService,
    host: mailHost,
    port: mailPort,
    secure: secureConnection,
    connectionTimeout: toNumber(process.env.MAIL_CONNECTION_TIMEOUT_MS, 10_000),
    greetingTimeout: toNumber(process.env.MAIL_GREETING_TIMEOUT_MS, 10_000),
    socketTimeout: toNumber(process.env.MAIL_SOCKET_TIMEOUT_MS, 15_000),
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
  });

  await transport.sendMail({
    from: mailFrom,
    to: email,
    subject,
    html: message,
  });
};

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    if (mailProvider === 'RESEND') {
      await sendWithResend(email, subject, message);
      return;
    }

    await sendWithSmtp(email, subject, message);
  },
};
