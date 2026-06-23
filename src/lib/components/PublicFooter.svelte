<script lang="ts">
	import { Building2, Users } from 'lucide-svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

	const year = new Date().getFullYear();
</script>

<footer class="bg-neutral text-neutral-content">
	<div class="container mx-auto max-w-6xl px-6 py-14">
		<div class="grid gap-12 md:grid-cols-12 md:gap-8">
			<div class="md:col-span-5">
				<p class="text-xl font-semibold tracking-tight">Employee Portal</p>
				<p class="mt-4 max-w-sm text-sm leading-relaxed text-neutral-content/70">
					Manage employees and departments in one place — simple, secure, and built for growing
					teams.
				</p>
				<div class="mt-6 flex gap-3">
					<span class="badge badge-outline gap-1 border-neutral-content/20 text-neutral-content/80">
						<Users class="h-3.5 w-3.5" />
						Employees
					</span>
					<span class="badge badge-outline gap-1 border-neutral-content/20 text-neutral-content/80">
						<Building2 class="h-3.5 w-3.5" />
						Departments
					</span>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-7 md:justify-items-end">
				<nav class="flex flex-col gap-3">
					<p class="text-xs font-semibold tracking-widest text-neutral-content/50 uppercase">
						Product
					</p>
					<a
						href={PUBLIC_ROUTES.onboarding}
						class="text-sm text-neutral-content/80 transition-colors hover:text-neutral-content"
					>
						Overview
					</a>
					<a
						href={AUTH_ROUTES.signup}
						class="text-sm text-neutral-content/80 transition-colors hover:text-neutral-content"
					>
						Create account
					</a>
				</nav>

				<nav class="flex flex-col gap-3">
					<p class="text-xs font-semibold tracking-widest text-neutral-content/50 uppercase">
						Account
					</p>
					<a
						href={AUTH_ROUTES.login}
						class="text-sm text-neutral-content/80 transition-colors hover:text-neutral-content"
					>
						Sign in
					</a>
					<a
						href={AUTH_ROUTES.forgetPassword}
						class="text-sm text-neutral-content/80 transition-colors hover:text-neutral-content"
					>
						Forgot password
					</a>
				</nav>
			</div>
		</div>

		<div class="divider my-10 before:bg-neutral-content/10 after:bg-neutral-content/10"></div>

		<div
			class="flex flex-col gap-2 text-sm text-neutral-content/50 sm:flex-row sm:items-center sm:justify-between"
		>
			<p>© {year} Employee Portal. All rights reserved.</p>
			<p class="text-neutral-content/40">Secure workforce management</p>
		</div>
	</div>
</footer>
