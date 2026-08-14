import nodemailer, { type Transporter } from 'nodemailer';
import { SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '$app/env/private';
import { normalizeRecipient, parseMailboxAddress } from '$lib/server/mail-address';

type OtpType = 'sign-in' | 'email-verification' | 'forget-password';

const subjects: Record<OtpType, string> = {
	'email-verification': 'Verify your Employee Portal email',
	'sign-in': 'Your Employee Portal sign-in code',
	'forget-password': 'Your Employee Portal password reset code'
};

let transporter: Transporter | null = null;

function smtpConfigured(): boolean {
	return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM);
}

function mailboxFromAddress(): string {
	return parseMailboxAddress(SMTP_USER!);
}

function mailboxFromHeader(): string {
	const fromAddress = parseMailboxAddress(SMTP_FROM!);
	const authAddress = mailboxFromAddress();
	if (fromAddress !== authAddress) {
		console.warn(
			`[mail] SMTP_FROM address (${fromAddress}) differs from SMTP_USER (${authAddress}). Office 365 may reject or quarantine internal mail. Use the same mailbox in both.`
		);
	}
	return fromAddress;
}

function getTransporter(): Transporter {
	if (transporter) return transporter;

	const port = Number(SMTP_PORT || 587);
	transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure: port === 465,
		requireTLS: port === 587,
		auth: { user: SMTP_USER!, pass: SMTP_PASS! },
		tls: { minVersion: 'TLSv1.2' }
	});

	return transporter;
}

async function deliverMail(options: {
	to: string;
	subject: string;
	text: string;
	kind: string;
}): Promise<void> {
	if (!smtpConfigured()) {
		console.info(`[mail] ${options.kind} for ${options.to} (SMTP not configured):\n${options.text}`);
		return;
	}

	const to = normalizeRecipient(options.to);
	const envelopeFrom = mailboxFromAddress();
	mailboxFromHeader();

	try {
		const info = await getTransporter().sendMail({
			from: SMTP_FROM,
			to,
			replyTo: envelopeFrom,
			envelope: {
				from: envelopeFrom,
				to: [to]
			},
			subject: options.subject,
			text: options.text,
			html: `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(options.text)}</pre>`
		});

		const accepted = info.accepted?.map(String).join(', ') || to;
		const rejected = info.rejected?.map(String) ?? [];
		console.info(
			`[mail] Sent ${options.kind} to ${to} id=${info.messageId ?? 'n/a'} accepted=[${accepted}] response=${info.response ?? 'n/a'}`
		);

		if (rejected.length > 0) {
			throw new Error(`SMTP rejected recipient(s): ${rejected.join(', ')}`);
		}
	} catch (err) {
		console.error(`[mail] Failed to send ${options.kind} to ${to}`, err);
		const detail = err instanceof Error ? err.message : 'Unknown SMTP error';
		throw new Error(
			`Failed to send email (${options.kind}): ${detail}. For @punhlainghospitals.com mailboxes, ask IT to check Exchange quarantine and message trace for ${envelopeFrom} → ${to}.`
		);
	}
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export async function sendVerificationOtpEmail(data: {
	email: string;
	otp: string;
	type: OtpType;
}): Promise<void> {
	await deliverMail({
		to: data.email,
		subject: subjects[data.type],
		text: `Your verification code is: ${data.otp}\n\nThis code expires in 3 minutes.`,
		kind: `OTP (${data.type})`
	});
}

export async function sendPasswordResetEmail(data: { email: string; url: string }): Promise<void> {
	await deliverMail({
		to: data.email,
		subject: 'Reset your Employee Portal password',
		text: `You requested a password reset for your Employee Portal account.

Open this link to choose a new password (expires in 1 hour):
${data.url}

If you did not request this, you can ignore this email.`,
		kind: 'password-reset'
	});
}

export async function sendInviteEmail(data: {
	email: string;
	name: string;
	inviteUrl: string;
}): Promise<void> {
	await deliverMail({
		to: data.email,
		subject: 'You are invited to Employee Portal',
		text: `Hello ${data.name},

You have been invited to join Employee Portal.

Open this link to set your password and activate your account (expires in 24 hours):
${data.inviteUrl}

If you did not expect this invitation, you can ignore this email.`,
		kind: 'invite'
	});
}
