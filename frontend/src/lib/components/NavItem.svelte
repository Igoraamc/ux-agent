<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import { List, Play, Settings } from './icons';

	interface Props {
		href: string;
		icon: 'list' | 'play' | 'settings';
		label: string;
		active?: boolean;
		badge?: Snippet;
		onclick?: () => void;
	}

	let { href, icon, label, active = false, badge, onclick }: Props = $props();

	const icons: Record<Props['icon'], Component<{ class?: string }>> = {
		list: List,
		play: Play,
		settings: Settings
	};

	const IconComponent = $derived(icons[icon]);
</script>

<a
	{href}
	class="flex items-center gap-3 px-4 py-3 text-sm transition-colors {active
		? 'bg-primary/10 text-primary font-medium'
		: 'text-text hover:bg-background-secondary'}"
	{onclick}
>
	<IconComponent class="h-5 w-5 flex-shrink-0" />
	<span class="flex-1">{label}</span>
	{#if badge}
		{@render badge()}
	{/if}
</a>
