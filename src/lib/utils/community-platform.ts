import type { Component } from 'svelte';
import {
	Briefcase,
	Camera,
	Code,
	Globe,
	Hash,
	MessageCircle,
	Phone,
	Play,
	Send,
	Users
} from '@lucide/svelte';
import type { CommunityPlatform } from '$lib/constants/community';

const PLATFORM_ICONS: Record<CommunityPlatform, Component> = {
	facebook: Users,
	instagram: Camera,
	linkedin: Briefcase,
	youtube: Play,
	github: Code,
	discord: MessageCircle,
	telegram: Send,
	whatsapp: Phone,
	x: Hash,
	website: Globe,
	other: Globe
};

const PLATFORM_COLORS: Record<CommunityPlatform, string> = {
	facebook: 'bg-blue-600',
	instagram: 'bg-gradient-to-br from-purple-600 to-pink-500',
	linkedin: 'bg-sky-700',
	youtube: 'bg-red-600',
	github: 'bg-neutral-800',
	discord: 'bg-indigo-600',
	telegram: 'bg-sky-500',
	whatsapp: 'bg-emerald-600',
	x: 'bg-neutral-900',
	website: 'bg-primary',
	other: 'bg-secondary'
};

export function getCommunityPlatformIcon(platform: CommunityPlatform): Component {
	return PLATFORM_ICONS[platform] ?? Globe;
}

export function getCommunityPlatformColorClass(platform: CommunityPlatform): string {
	return PLATFORM_COLORS[platform] ?? 'bg-primary';
}
