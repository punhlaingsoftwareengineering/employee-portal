import nodemailer from 'nodemailer';
import { SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '$app/env/private';

type OtpType = 'sign-in' | 'email-verification' | 'forget-password';

const subjects: Record<OtpType, string> = {
	'email-verification': 'Verify your Employee Portal email',
	'sign-in': 'Your Employee Portal sign-in code',
	'forget-password': 'Your Employee Portal password reset code'
};

export function sendVerificationOtpEmail(data: {
	email: string;
	otp: string;
	type: OtpType;
}): void {
	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		console.info(`[mail] OTP for ${data.email} (${data.type}): ${data.otp}`);
		return;
	}

	const port = Number(SMTP_PORT || 587);
	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS }
	});

	void transporter
		.sendMail({
			from: SMTP_FROM,
			to: data.email,
			subject: subjects[data.type],
			text: `Your verification code is: ${data.otp}\n\nThis code expires in 3 minutes.`
		})
		.catch((err) => {
			console.error('[mail] Failed to send OTP email', err);
		});
}

export function sendPasswordResetEmail(data: { email: string; url: string }): void {
	const subject = 'Reset your Employee Portal password';
	const text = `You requested a password reset for your Employee Portal account.

Open this link to choose a new password (expires in 1 hour):
${data.url}

If you did not request this, you can ignore this email.`;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		console.info(`[mail] Password reset for ${data.email}: ${data.url}`);
		return;
	}

	const port = Number(SMTP_PORT || 587);
	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS }
	});

	void transporter
		.sendMail({
			from: SMTP_FROM,
			to: data.email,
			subject,
			text
		})
		.catch((err) => {
			console.error('[mail] Failed to send password reset email', err);
		});
}

export function sendInviteEmail(data: { email: string; name: string; inviteUrl: string }): void {
	const subject = 'You are invited to Employee Portal';
	const text = `Hello ${data.name},

You have been invited to join Employee Portal.

Open this link to set your password and activate your account (expires in 24 hours):
${data.inviteUrl}

If you did not expect this invitation, you can ignore this email.`;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		console.info(`[mail] Invite for ${data.email}: ${data.inviteUrl}`);
		return;
	}

	const port = Number(SMTP_PORT || 587);
	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS }
	});

	void transporter
		.sendMail({
			from: SMTP_FROM,
			to: data.email,
			subject,
			text
		})
		.catch((err) => {
			console.error('[mail] Failed to send invite email', err);
		});
}
