<script lang="ts">
	import '../app.css';
	import { AppDrawer, Fab, NewTestModal, Plus } from '$lib/components';
	import { navigation } from '$lib/stores/navigation';
	import { newTestModal } from '$lib/stores/newTestModal';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>UX Agent</title>
	<meta name="description" content="AI-powered UX testing agent" />
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background">
	<AppDrawer open={$navigation.drawerOpen} onClose={navigation.closeDrawer} />

	{@render children()}

	<Fab onclick={newTestModal.open} label="New Test">
		<Plus class="h-6 w-6" />
	</Fab>

	<NewTestModal open={$newTestModal} onClose={newTestModal.close} />
</div>
