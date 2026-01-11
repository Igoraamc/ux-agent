<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeft, Menu } from './icons';

	interface Props {
		title: string;
		onMenuClick: () => void;
		showBack?: boolean;
		onBackClick?: () => void;
		actions?: Snippet;
	}

	let { title, onMenuClick, showBack = false, onBackClick, actions }: Props = $props();
</script>

<header
	class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background px-2"
>
	{#if showBack}
		<button
			onclick={onBackClick}
			class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-background-secondary"
			aria-label="Go back"
		>
			<ArrowLeft />
		</button>
	{:else}
		<button
			onclick={onMenuClick}
			class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-background-secondary"
			aria-label="Open menu"
		>
			<Menu />
		</button>
	{/if}

	<h1 class="flex-1 truncate text-lg font-semibold">{title}</h1>

	{#if actions}
		{@render actions()}
	{/if}
</header>
