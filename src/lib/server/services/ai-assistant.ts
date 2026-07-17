import type { AiChatMessage } from '$lib/schemas/ai-chat';
import {
	AI_ASSISTANT_SUGGESTED_PROMPTS,
	AI_ASSISTANT_WELCOME_MESSAGE
} from '$lib/constants/ai-assistant';

const WELCOME_MESSAGE = AI_ASSISTANT_WELCOME_MESSAGE;
const SUGGESTED_PROMPTS = AI_ASSISTANT_SUGGESTED_PROMPTS;

function normalize(text: string): string {
	return text.trim().toLowerCase();
}

function replyFor(message: string): string {
	const text = normalize(message);

	if (/service|app|tool/.test(text)) {
		return 'Browse Services and Apps from the top navigation, or find them on the onboarding home page. Signed-in users also see assigned tools under Tools in the sidebar.';
	}

	if (/password|login|sign in|sign up|account|otp|verify/.test(text)) {
		return 'Use Sign in or Get started in the navbar. Forgot password? Go to /auth/forget-password. New accounts verify email with an OTP at /auth/otp.';
	}

	if (/theme|dark|light|appearance/.test(text)) {
		return 'Change your theme with the palette icon in the navbar. Administrators can limit allowed themes under Settings → Theme policy.';
	}

	if (/employee|department|facility|dashboard/.test(text)) {
		return 'After sign-in, use the sidebar for Dashboard, Employees, Departments, and Facilities — visibility depends on your role permissions.';
	}

	if (/doc|guide|tutorial|learn/.test(text)) {
		return 'Check Docs (external), Tips & Tutorials, and Community in the top navigation for guides and learning resources.';
	}

	if (/hello|hi|hey|thanks|thank you/.test(text)) {
		return 'Hello! Ask me about tools, login, themes, or where to find features in the portal.';
	}

	return 'I am not sure about that yet. Try asking about services, login, themes, or employees.';
}

export function getAiAssistantWelcome(): { message: string; suggestions: readonly string[] } {
	return { message: WELCOME_MESSAGE, suggestions: SUGGESTED_PROMPTS };
}

export function generateAiAssistantReply(
	message: string,
	_history: AiChatMessage[] = []
): AiChatMessage {
	return {
		role: 'assistant',
		content: replyFor(message)
	};
}
