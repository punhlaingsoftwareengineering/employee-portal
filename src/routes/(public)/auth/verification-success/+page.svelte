<script lang="ts">
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
</script>

<h1 class="text-2xl font-bold">Verification</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="alert alert-success">
			<span>Check your email to complete verification, then sign in.</span>
		</div>

		<div class="form-actions">
			<a href={AUTH_ROUTES.login} class="btn btn-primary">Go to sign in</a>
		</div>
	</div>
</div>
