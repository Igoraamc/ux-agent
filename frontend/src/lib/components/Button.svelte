<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		fullWidth?: boolean;
		children: Snippet;
		icon?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		children,
		icon,
		class: className = '',
		...rest
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg disabled:cursor-not-allowed disabled:opacity-50';

	const variantStyles = {
		primary: 'bg-primary text-white hover:bg-primary-dark',
		secondary: 'bg-background-secondary text-text hover:bg-border',
		ghost: 'text-text hover:bg-background-secondary',
		danger: 'bg-error text-white hover:bg-error/90'
	};

	const sizeStyles = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2.5 text-sm',
		lg: 'px-4 py-3 text-base'
	};
</script>

<button
	class="{baseStyles} {variantStyles[variant]} {sizeStyles[size]} {fullWidth
		? 'w-full'
		: ''} {className}"
	{...rest}
>
	{#if icon}
		{@render icon()}
	{/if}
	{@render children()}
</button>
