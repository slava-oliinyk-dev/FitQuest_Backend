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

export const emailAdapter = {
	async sendEmail(email: string, subject: string, message: string) {
		const transport = nodemailer.createTransport({
			service: mailService,
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
	},
};
