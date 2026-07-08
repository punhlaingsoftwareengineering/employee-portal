<script lang="ts">
	import {
		E_SIGNATURE_ASSETS,
		E_SIGNATURE_LEGACY,
		E_SIGNATURE_PNG_SIZE
	} from '$lib/constants/e-signature';
	import type { ESignatureFormData } from '$lib/schemas/e-signature';

	let {
		data,
		onEdit,
		captureElement = $bindable(null)
	}: {
		data: ESignatureFormData;
		onEdit?: () => void;
		captureElement?: HTMLDivElement | null;
	} = $props();

	const legacy = E_SIGNATURE_LEGACY;

	const nameSpacerHeight = $derived(
		data.name.trim().split(/\s+/).length > 3 && data.name.length > 25
			? legacy.nameSpacerShort
			: legacy.nameSpacer
	);
</script>

<div class="flex flex-col gap-3 sm:flex-row sm:items-start">
	<div
		bind:this={captureElement}
		id="photo"
		class="e-signature-photo"
		style:width="{E_SIGNATURE_PNG_SIZE.width}px"
	>
		<table
			class="e-signature-banner"
			width={E_SIGNATURE_PNG_SIZE.width}
			style:height="{E_SIGNATURE_PNG_SIZE.height}px"
			cellpadding="0"
			cellspacing="0"
			bgcolor="#FFFFFF"
			style:background-image="url('{E_SIGNATURE_ASSETS.background}')"
		>
			<tbody>
				<tr>
					<td colspan="2" height={legacy.logoSpacerHeight} valign="top"></td>
					<td width="1%" rowspan="2" valign="middle"></td>
					<td width="55%" rowspan="2" valign="top" class="e-signature-text-col">
						<table width="100%" border="0" cellpadding="0" cellspacing="0">
							<tbody>
								<tr>
									<td colspan="2" height={nameSpacerHeight}></td>
								</tr>
								<tr>
									<td colspan="2" width="93%">
										<span class="estyle1">{data.name}</span>
									</td>
								</tr>
								<tr>
									<td colspan="2"><span class="estyle2">{data.designation}</span></td>
								</tr>
								<tr>
									<td colspan="2">
										<span class="estyle3">{data.department}</span>
									</td>
								</tr>
								<tr>
									<td colspan="2" height={legacy.contactsSpacer}></td>
								</tr>
								<tr class="e-signature-contact-row">
									<td>
										<img
											src={E_SIGNATURE_ASSETS.icons.mail}
											alt=""
											width={legacy.iconSize}
											height={legacy.iconSize}
										/>
									</td>
									<td><span class="estyle4">{data.email}</span></td>
								</tr>
								{#if data.phone.trim()}
									<tr class="e-signature-contact-row">
										<td>
											<img
												src={E_SIGNATURE_ASSETS.icons.phone}
												alt=""
												width={legacy.iconSize}
												height={legacy.iconSize}
											/>
										</td>
										<td><span class="estyle5">{data.phone}</span></td>
									</tr>
								{:else}
									<tr>
										<td height="0"></td>
										<td height="0"></td>
									</tr>
								{/if}
								<tr class="e-signature-contact-row">
									<td>
										<img
											src={E_SIGNATURE_ASSETS.icons.location}
											alt=""
											width={legacy.iconSize}
											height={legacy.iconSize}
										/>
									</td>
									<td><span class="estyle6">{data.location}</span></td>
								</tr>
								<tr class="e-signature-contact-row">
									<td>
										<img
											src={E_SIGNATURE_ASSETS.icons.web}
											alt=""
											width={legacy.iconSize}
											height={legacy.iconSize}
										/>
									</td>
									<td><span class="estyle7">{data.web}</span></td>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	{#if onEdit}
		<button type="button" class="btn btn-primary btn-sm shrink-0" onclick={onEdit}>Edit</button>
	{/if}
</div>

<p class="text-sm text-base-content/60">EMP No. {data.employeeNo}</p>

<style>
	.e-signature-photo {
		padding: 0;
		border: 1px solid #ffffff;
		box-sizing: border-box;
		line-height: normal;
	}

	.e-signature-banner {
		border-collapse: collapse;
		border-spacing: 0;
		table-layout: fixed;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	.e-signature-text-col {
		padding: 0;
		vertical-align: top;
	}

	.e-signature-contact-row {
		height: 30px;
	}

	/* Legacy estyle1–7 (approximated from index.php + photo3.png; style.css unavailable) */
	.estyle1 {
		font-family: Tahoma, Arial, Helvetica, sans-serif;
		font-size: 28px;
		font-weight: bold;
		color: #ffffff;
	}

	.estyle2 {
		font-family: Tahoma, Arial, Helvetica, sans-serif;
		font-size: 11px;
		font-weight: bold;
		color: #f37021;
	}

	.estyle3 {
		font-family: Tahoma, Arial, Helvetica, sans-serif;
		font-size: 11px;
		font-weight: normal;
		color: #ffffff;
	}

	.estyle4,
	.estyle5,
	.estyle6,
	.estyle7 {
		font-family: Tahoma, Arial, Helvetica, sans-serif;
		font-size: 11px;
		font-weight: normal;
		color: #ffffff;
	}

	.e-signature-banner td {
		padding: 0;
		margin: 0;
	}

	.e-signature-banner img {
		display: block;
		border: 0;
	}
</style>
