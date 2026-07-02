<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';

	type Props = {
		name: string;
		required?: boolean;
		autocomplete?: string;
		minlength?: number;
	};

	let { name, required = false, autocomplete = 'current-password', minlength }: Props = $props();

	let visible = $state(false);
</script>

<div class="password-field relative w-full max-w-md">
	<input
		type={visible ? 'text' : 'password'}
		{name}
		{required}
		{minlength}
		{autocomplete}
		class="input input-bordered w-full pe-10"
	/>
	<button
		type="button"
		class="btn btn-ghost btn-square btn-sm absolute top-1/2 end-1 -translate-y-1/2"
		aria-label={visible ? 'Hide password' : 'Show password'}
		aria-pressed={visible}
		onclick={() => (visible = !visible)}
	>
		{#if visible}
			<EyeOff class="h-4 w-4" />
		{:else}
			<Eye class="h-4 w-4" />
		{/if}
	</button>
</div>
