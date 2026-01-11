<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from './icons';

	interface Props {
		open: boolean;
		onClose: () => void;
		title: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { open, onClose, title, children, footer }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-50 bg-black/50 transition-opacity"
		onclick={onClose}
		aria-label="Close modal"
	></button>

	<!-- Modal -->
	<div
		class="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-hidden rounded-xl bg-background shadow-xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-border px-4 py-3">
			<h2 id="modal-title" class="text-lg font-semibold">{title}</h2>
			<button
				onclick={onClose}
				class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background-secondary"
				aria-label="Close"
			>
				<X />
			</button>
		</div>

		<!-- Content -->
		<div class="max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
			{@render children()}
		</div>

		<!-- Footer -->
		{#if footer}
			<div class="border-t border-border px-4 py-3">
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
