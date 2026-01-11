<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { AppHeader, Button, Refresh } from '$lib/components';
	import { runsService } from '$lib/services';
	import { activeRun } from '$lib/stores/activeRun';
	import { navigation } from '$lib/stores/navigation';
	import type { Run } from '$lib/types';

	const runId = $derived($page.params.id);

	let run = $state<Run | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		loadRun();
	});

	async function loadRun() {
		if (!runId) {
			error = 'No run ID provided';
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			run = await runsService.get(runId);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load run';
		} finally {
			loading = false;
		}
	}

	async function handleRerun() {
		if (!run) return;
		activeRun.startRun({
			url: run.url,
			flowDescription: run.flowDescription,
			expectedResult: run.expectedResult,
			mode: run.mode
		});
		await goto('/active');
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed':
				return 'text-green-500';
			case 'failed':
				return 'text-red-500';
			case 'running':
				return 'text-yellow-500';
			default:
				return 'text-text-secondary';
		}
	}
</script>

<AppHeader
	title="Run Details"
	onMenuClick={navigation.openDrawer}
	showBack={true}
	onBackClick={() => goto('/runs')}
/>

<main class="p-4">
	{#if loading}
		<div class="flex items-center justify-center py-16">
			<p class="text-text-secondary">Loading...</p>
		</div>
	{:else if error}
		<div class="rounded-lg border border-red-500 p-4" style="background-color: rgb(239 68 68 / 0.1);">
			<h3 class="mb-2 font-semibold text-red-500">Error</h3>
			<p class="text-sm">{error}</p>
		</div>
	{:else if run}
		<div class="space-y-4">
			<!-- Header with rerun button -->
			<div class="flex items-start justify-between rounded-lg border border-border bg-surface p-4">
				<div>
					<div class="flex items-center gap-2">
						<span class="font-medium {getStatusColor(run.status)}">{run.status}</span>
						{#if run.success !== null}
							<span class="text-sm {run.success ? 'text-green-500' : 'text-red-500'}">
								({run.success ? 'Passed' : 'Failed'})
							</span>
						{/if}
					</div>
					<p class="mt-1 text-sm text-text-secondary">{run.url}</p>
					<p class="mt-1 text-xs text-text-secondary">
						{new Date(run.createdAt).toLocaleString()}
					</p>
				</div>
				<Button onclick={handleRerun}>
					{#snippet icon()}<Refresh />{/snippet}
					Rerun
				</Button>
			</div>

			<!-- Flow Description -->
			<div class="rounded-lg border border-border p-4">
				<h3 class="mb-2 text-sm font-medium text-text-secondary">Flow Description</h3>
				<p class="text-sm">{run.flowDescription}</p>
			</div>

			<!-- Expected Result -->
			<div class="rounded-lg border border-border p-4">
				<h3 class="mb-2 text-sm font-medium text-text-secondary">Expected Result</h3>
				<p class="text-sm">{run.expectedResult}</p>
			</div>

			<!-- Summary -->
			{#if run.summary}
				<div class="rounded-lg border border-border p-4">
					<h3 class="mb-2 text-sm font-medium text-text-secondary">Summary</h3>
					<p class="text-sm">{run.summary}</p>
				</div>
			{/if}

			<!-- Error -->
			{#if run.error}
				<div class="rounded-lg border border-red-500 p-4" style="background-color: rgb(239 68 68 / 0.1);">
					<h3 class="mb-2 text-sm font-medium text-red-500">Error</h3>
					<p class="text-sm">{run.error}</p>
				</div>
			{/if}

			<!-- Run ID -->
			<div class="rounded-lg border border-border p-4">
				<h3 class="mb-2 text-sm font-medium text-text-secondary">Run ID</h3>
				<p class="font-mono text-xs text-text-secondary">{run.id}</p>
			</div>
		</div>
	{/if}
</main>
