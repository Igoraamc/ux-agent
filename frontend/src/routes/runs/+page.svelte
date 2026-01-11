<script lang="ts">
	import { AppHeader, Button, Plus } from '$lib/components';
	import { navigation } from '$lib/stores/navigation';
	import { newTestModal } from '$lib/stores/newTestModal';
</script>

<AppHeader title="Runs" onMenuClick={navigation.openDrawer} />

<main class="p-4">
	<!-- Empty state for now -->
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<div class="mb-4 text-6xl">🧪</div>
		<h2 class="mb-2 text-xl font-semibold">No tests yet</h2>
		<p class="mb-6 text-text-secondary">Run your first UX test to see results here</p>
		<Button onclick={newTestModal.open}>
			{#snippet icon()}<Plus />{/snippet}
			New Test
		</Button>
	</div>
</main>
