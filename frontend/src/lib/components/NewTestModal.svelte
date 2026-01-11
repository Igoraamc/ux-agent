<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Play } from '$lib/components';
	import { activeRun } from '$lib/stores/activeRun';
	import Modal from './Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let url = $state('');
	let flowDescription = $state('');
	let expectedResult = $state('');
	let mode = $state<'autonomous' | 'supervised' | 'manual'>('autonomous');
	let isSubmitting = $state(false);

	const isValid = $derived(url.trim() && flowDescription.trim() && expectedResult.trim());

	function resetForm() {
		url = '';
		flowDescription = '';
		expectedResult = '';
		mode = 'autonomous';
		isSubmitting = false;
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	async function handleSubmit() {
		if (!isValid || isSubmitting) return;

		isSubmitting = true;

		activeRun.startRun({
			url: url.trim(),
			flowDescription: flowDescription.trim(),
			expectedResult: expectedResult.trim(),
			mode
		});

		handleClose();
		await goto('/active');
	}
</script>

<Modal {open} onClose={handleClose} title="New Test">
	<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<!-- URL -->
		<div>
			<label for="modal-url" class="mb-1.5 block text-sm font-medium">URL</label>
			<input
				id="modal-url"
				type="url"
				bind:value={url}
				placeholder="https://example.com"
				class="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			/>
		</div>

		<!-- Flow Description -->
		<div>
			<label for="modal-flow" class="mb-1.5 block text-sm font-medium"
				>What should the agent test?</label
			>
			<textarea
				id="modal-flow"
				bind:value={flowDescription}
				rows={3}
				placeholder="Log in with test credentials, then navigate to the settings page..."
				class="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			></textarea>
			<p class="mt-1 text-xs text-text-secondary">{flowDescription.length} / 10,000</p>
		</div>

		<!-- Expected Result -->
		<div>
			<label for="modal-expected" class="mb-1.5 block text-sm font-medium">Expected result</label>
			<textarea
				id="modal-expected"
				bind:value={expectedResult}
				rows={2}
				placeholder="User sees the settings page with profile options visible"
				class="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			></textarea>
		</div>

		<!-- Mode Selection -->
		<fieldset>
			<legend class="mb-2 text-sm font-medium">Execution Mode</legend>
			<div class="grid grid-cols-3 gap-2">
				<label
					class="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-border p-3 text-center has-[:checked]:border-primary has-[:checked]:bg-primary/5"
				>
					<input type="radio" name="modal-mode" value="autonomous" bind:group={mode} class="sr-only" />
					<div class="text-sm font-medium">Autonomous</div>
					<div class="text-xs text-text-secondary">No pauses</div>
				</label>
				<label
					class="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-border p-3 text-center has-[:checked]:border-primary has-[:checked]:bg-primary/5"
				>
					<input type="radio" name="modal-mode" value="supervised" bind:group={mode} class="sr-only" />
					<div class="text-sm font-medium">Supervised</div>
					<div class="text-xs text-text-secondary">3s delay</div>
				</label>
				<label
					class="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-border p-3 text-center has-[:checked]:border-primary has-[:checked]:bg-primary/5"
				>
					<input type="radio" name="modal-mode" value="manual" bind:group={mode} class="sr-only" />
					<div class="text-sm font-medium">Manual</div>
					<div class="text-xs text-text-secondary">Approve each</div>
				</label>
			</div>
		</fieldset>
	</form>

	{#snippet footer()}
		<Button type="submit" disabled={!isValid || isSubmitting} fullWidth onclick={handleSubmit}>
			{#snippet icon()}<Play fill />{/snippet}
			{isSubmitting ? 'Starting...' : 'Start Test'}
		</Button>
	{/snippet}
</Modal>
