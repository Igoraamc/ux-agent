<script lang="ts">
	import { page } from '$app/stores';
	import { newTestModal } from '$lib/stores/newTestModal';
	import NavItem from './NavItem.svelte';
	import { Plus } from './icons';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	const navItems: Array<{
		href: string;
		icon: 'list' | 'play' | 'settings';
		label: string;
	}> = [
		{ href: '/runs', icon: 'list', label: 'Runs' },
		{ href: '/active', icon: 'play', label: 'Active' },
		{ href: '/settings', icon: 'settings', label: 'Settings' }
	];

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onClose();
		}
	}

	function handleNavClick() {
		onClose();
	}

	function handleNewTest() {
		onClose();
		newTestModal.open();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
{#if open}
	<button
		class="fixed inset-0 z-40 bg-black/50 transition-opacity"
		onclick={onClose}
		aria-label="Close menu"
	></button>
{/if}

<!-- Drawer -->
<aside
	class="fixed left-0 top-0 z-50 h-full w-64 transform bg-background shadow-xl transition-transform duration-200 ease-out {open
		? 'translate-x-0'
		: '-translate-x-full'}"
	aria-hidden={!open}
>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex h-14 items-center border-b border-border px-4">
			<span class="text-lg font-semibold">UX Agent</span>
		</div>

		<!-- New Test Button -->
		<div class="border-b border-border p-3">
			<button
				onclick={handleNewTest}
				class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
			>
				<Plus class="h-5 w-5" />
				New Test
			</button>
		</div>

		<!-- Nav Items -->
		<nav class="flex-1 py-2">
			{#each navItems as item}
				<NavItem
					href={item.href}
					icon={item.icon}
					label={item.label}
					active={$page.url.pathname.startsWith(item.href)}
					onclick={handleNavClick}
				/>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t border-border px-4 py-3 text-sm text-text-secondary">
			v0.1.0
		</div>
	</div>
</aside>
