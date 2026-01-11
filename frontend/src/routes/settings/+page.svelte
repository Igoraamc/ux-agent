<script lang="ts">
	import { AppHeader, ChevronRight, ExternalLink } from '$lib/components';
	import { navigation } from '$lib/stores/navigation';
</script>

<AppHeader title="Settings" onMenuClick={navigation.openDrawer} />

<main class="p-4">
	<!-- General Section -->
	<section class="mb-6">
		<h2 class="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
			General
		</h2>
		<div class="overflow-hidden rounded-lg border border-border">
			<button
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-background-secondary"
			>
				<div>
					<div class="font-medium">Default Mode</div>
					<div class="text-sm text-text-secondary">Autonomous</div>
				</div>
				<ChevronRight class="h-5 w-5 text-text-secondary" />
			</button>
			<div class="border-t border-border"></div>
			<button
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-background-secondary"
			>
				<div>
					<div class="font-medium">Theme</div>
					<div class="text-sm text-text-secondary">System</div>
				</div>
				<ChevronRight class="h-5 w-5 text-text-secondary" />
			</button>
		</div>
	</section>

	<!-- API Section -->
	<section class="mb-6">
		<h2 class="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
			API
		</h2>
		<div class="overflow-hidden rounded-lg border border-border">
			<button
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-background-secondary"
			>
				<div>
					<div class="font-medium">API Key</div>
					<div class="text-sm text-text-secondary">Not configured</div>
				</div>
				<ChevronRight class="h-5 w-5 text-text-secondary" />
			</button>
		</div>
	</section>

	<!-- Data Section -->
	<section class="mb-6">
		<h2 class="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
			Data
		</h2>
		<div class="overflow-hidden rounded-lg border border-border">
			<button
				class="flex w-full items-center justify-between px-4 py-3 text-left text-error hover:bg-background-secondary"
			>
				<div>
					<div class="font-medium">Clear History</div>
					<div class="text-sm opacity-70">Delete all runs</div>
				</div>
				<ChevronRight class="h-5 w-5" />
			</button>
		</div>
	</section>

	<!-- About Section -->
	<section>
		<h2 class="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
			About
		</h2>
		<div class="overflow-hidden rounded-lg border border-border">
			<div class="flex items-center justify-between px-4 py-3">
				<div class="font-medium">Version</div>
				<div class="text-text-secondary">0.1.0</div>
			</div>
			<div class="border-t border-border"></div>
			<a
				href="https://github.com"
				target="_blank"
				rel="noopener noreferrer"
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-background-secondary"
			>
				<div class="font-medium">GitHub</div>
				<ExternalLink class="h-5 w-5 text-text-secondary" />
			</a>
		</div>
	</section>
</main>
