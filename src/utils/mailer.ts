import nodemailer from 'nodemailer';

export const emailAdapter = {
	async sendEmail(email: string, subject: string, message: string) {
		const transport = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'fitquestde@gmail.com',
				pass: 'csat teni upgk oiln',
			},
		});

		const info = await transport.sendMail({
			from: '"FitQuest" <fitquestde@gmail.com>',
			to: email,
			subject: subject,
			html: message,
		});
		return;
	},
};
