<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick: () => void;
		label: string;
		children: Snippet;
	}

	let { onclick, label, children }: Props = $props();
</script>

<button
	{onclick}
	class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-dark active:scale-95"
	aria-label={label}
>
	{@render children()}
</button>
