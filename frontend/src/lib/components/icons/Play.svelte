<script lang="ts">
	interface Props {
		class?: string;
		fill?: boolean;
	}

	let { class: className = 'h-5 w-5', fill = false }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24">
	{#if fill}
		<path fill="currentColor" d="M5 3l14 9-14 9V3z" />
	{:else}
		<path
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M5 3l14 9-14 9V3z"
		/>
	{/if}
</svg>
