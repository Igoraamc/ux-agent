<script lang="ts">
	import { AppHeader, Button, Plus, Refresh } from '$lib/components';
	import { navigation } from '$lib/stores/navigation';
	import { newTestModal } from '$lib/stores/newTestModal';
	import { activeRun, type ActiveRunStep } from '$lib/stores/activeRun';

	const statusLabels = {
		idle: 'No Active Test',
		connecting: 'Connecting...',
		running: 'Running',
		awaiting_approval: 'Awaiting Approval',
		completed: 'Completed',
		failed: 'Failed'
	};

	function getActionDisplay(action: ActiveRunStep['action']) {
		if (!action) return '';
		switch (action.action) {
			case 'click':
				return `Click element #${action.args.element_index}`;
			case 'type':
				return `Type "${action.args.text}" into #${action.args.element_index}`;
			case 'scroll':
				return `Scroll ${action.args.direction}`;
			case 'wait':
				return `Wait ${action.args.seconds}s`;
			case 'done':
				return `Done: ${action.args.summary}`;
			case 'fail':
				return `Failed: ${action.args.reason}`;
			default:
				return JSON.stringify(action);
		}
	}

	function getLatestScreenshot(steps: ActiveRunStep[]): string | undefined {
		for (let i = steps.length - 1; i >= 0; i--) {
			if (steps[i].screenshot) {
				return steps[i].screenshot;
			}
		}
		return undefined;
	}
</script>

<AppHeader title="Active" onMenuClick={navigation.openDrawer} />

{#if $activeRun.status === 'idle'}
	<main
		class="flex flex-col items-center justify-center p-4"
		style="min-height: calc(100vh - 3.5rem);"
	>
		<div class="text-center">
			<div class="mb-4 text-6xl">🧪</div>
			<h2 class="mb-2 text-xl font-semibold">No active test</h2>
			<p class="mb-6 text-text-secondary">Start a new test to see live execution</p>
			<Button onclick={newTestModal.open}>
				{#snippet icon()}<Plus />{/snippet}
				New Test
			</Button>
		</div>
	</main>
{:else}
	<main class="flex flex-col gap-4 p-4" style="min-height: calc(100vh - 3.5rem);">
		<!-- Status Header -->
		<div class="rounded-lg border border-border bg-surface p-4">
			<div class="flex items-center justify-between">
				<div>
					<div class="flex items-center gap-2">
						<span
							class="inline-block h-2 w-2 rounded-full"
							class:bg-yellow-500={$activeRun.status === 'connecting' ||
								$activeRun.status === 'running'}
							class:bg-orange-500={$activeRun.status === 'awaiting_approval'}
							class:bg-green-500={$activeRun.status === 'completed'}
							class:bg-red-500={$activeRun.status === 'failed'}
							class:animate-pulse={$activeRun.status === 'connecting' ||
								$activeRun.status === 'running'}
						></span>
						<span class="font-medium">{statusLabels[$activeRun.status]}</span>
					</div>
					{#if $activeRun.url}
						<p class="mt-1 text-sm text-text-secondary">{$activeRun.url}</p>
					{/if}
				</div>
				{#if $activeRun.status === 'completed' || $activeRun.status === 'failed'}
					<div class="flex gap-2">
						<Button onclick={activeRun.rerun}>
							{#snippet icon()}<Refresh />{/snippet}
							Rerun
						</Button>
						<Button onclick={activeRun.reset}>
							{#snippet icon()}<Plus />{/snippet}
							New Test
						</Button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Approval Required -->
		{#if $activeRun.status === 'awaiting_approval' && $activeRun.pendingApproval}
			<div class="rounded-lg border-2 border-orange-500 bg-orange-500/10 p-4">
				<h3 class="mb-2 font-semibold text-orange-500">Approval Required</h3>
				<p class="mb-3 text-sm">
					Step {$activeRun.pendingApproval.step}: {getActionDisplay($activeRun.pendingApproval.action)}
				</p>
				{#if $activeRun.pendingApproval.screenshot}
					<img
						src="data:image/png;base64,{$activeRun.pendingApproval.screenshot}"
						alt="Current screenshot"
						class="mb-4 w-full rounded border border-border"
					/>
				{/if}
				<div class="flex gap-2">
					<Button onclick={() => activeRun.approve(true)}>Approve</Button>
					<Button onclick={() => activeRun.approve(false)}>Reject</Button>
				</div>
			</div>
		{/if}

		<!-- Result -->
		{#if $activeRun.result}
			<div
				class="rounded-lg border p-4 {$activeRun.result.success
					? 'border-green-500 bg-green-500/10'
					: 'border-red-500 bg-red-500/10'}"
			>
				<h3
					class="mb-2 font-semibold"
					class:text-green-500={$activeRun.result.success}
					class:text-red-500={!$activeRun.result.success}
				>
					{$activeRun.result.success ? 'Test Passed' : 'Test Failed'}
				</h3>
				<p class="text-sm">{$activeRun.result.summary}</p>
				{#if $activeRun.result.error}
					<p class="mt-2 text-sm text-red-500">{$activeRun.result.error}</p>
				{/if}
				<p class="mt-2 text-xs text-text-secondary">
					Total steps: {$activeRun.result.totalSteps}
				</p>
			</div>
		{/if}

		<!-- Screenshot Preview -->
		{#if getLatestScreenshot($activeRun.steps)}
			<div class="rounded-lg border border-border bg-surface p-4">
				<h3 class="mb-2 text-sm font-medium text-text-secondary">Current View</h3>
				<img
					src="data:image/png;base64,{getLatestScreenshot($activeRun.steps)}"
					alt="Current screenshot"
					class="w-full rounded border border-border"
				/>
			</div>
		{/if}

		<!-- Steps Log -->
		{#if $activeRun.steps.length > 0}
			<div class="rounded-lg border border-border bg-surface p-4">
				<h3 class="mb-3 text-sm font-medium text-text-secondary">Steps</h3>
				<div class="space-y-2">
					{#each $activeRun.steps as step}
						<div class="rounded border border-border bg-background p-3 text-sm">
							<div class="flex items-center gap-2">
								<span class="font-mono text-xs text-text-secondary">
									#{step.step}
								</span>
								<span
									class="rounded px-1.5 py-0.5 text-xs {step.phase === 'thinking'
										? 'bg-blue-500/20 text-blue-400'
										: step.phase === 'acting'
											? 'bg-yellow-500/20 text-yellow-400'
											: 'bg-green-500/20 text-green-400'}"
								>
									{step.phase}
								</span>
							</div>
							{#if step.thinking}
								<p class="mt-2 text-text-secondary">{step.thinking}</p>
							{/if}
							{#if step.action}
								<p class="mt-1 font-medium">{getActionDisplay(step.action)}</p>
							{/if}
							{#if step.result}
								<p class="mt-1 text-text-secondary">{step.result}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Error -->
		{#if $activeRun.error}
			<div class="rounded-lg border border-red-500 p-4" style="background-color: rgb(239 68 68 / 0.1);">
				<h3 class="mb-2 font-semibold text-red-500">Error</h3>
				<p class="text-sm">{$activeRun.error}</p>
			</div>
		{/if}
	</main>
{/if}
