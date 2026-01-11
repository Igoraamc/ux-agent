import { writable, get } from 'svelte/store';
import type {
	TestConfig,
	RunMode,
	SSEStartEvent,
	SSEStepEvent,
	SSEApprovalRequiredEvent,
	SSECompleteEvent,
	AgentAction
} from '$lib/types';
import { agentService } from '$lib/services';

export type ActiveRunStatus = 'idle' | 'connecting' | 'running' | 'awaiting_approval' | 'completed' | 'failed';

export interface ActiveRunStep {
	step: number;
	phase: 'thinking' | 'acting' | 'result';
	thinking?: string | null;
	action?: AgentAction;
	result?: string;
	screenshot?: string;
}

export interface ActiveRunState {
	status: ActiveRunStatus;
	runId: string | null;
	url: string | null;
	flowDescription: string | null;
	expectedResult: string | null;
	mode: RunMode | null;
	steps: ActiveRunStep[];
	currentStep: number;
	pendingApproval: {
		step: number;
		action: AgentAction;
		screenshot: string;
	} | null;
	result: {
		success: boolean;
		summary: string;
		error?: string;
		totalSteps: number;
	} | null;
	error: string | null;
}

const initialState: ActiveRunState = {
	status: 'idle',
	runId: null,
	url: null,
	flowDescription: null,
	expectedResult: null,
	mode: null,
	steps: [],
	currentStep: 0,
	pendingApproval: null,
	result: null,
	error: null
};

function createActiveRunStore() {
	const { subscribe, set, update } = writable<ActiveRunState>(initialState);

	let abortController: AbortController | null = null;

	async function startRun(config: TestConfig) {
		// Cancel any existing run
		if (abortController) {
			abortController.abort();
		}

		abortController = new AbortController();

		update((state) => ({
			...state,
			status: 'connecting',
			runId: null,
			url: config.url,
			flowDescription: config.flowDescription,
			expectedResult: config.expectedResult,
			mode: config.mode || 'autonomous',
			steps: [],
			currentStep: 0,
			pendingApproval: null,
			result: null,
			error: null
		}));

		try {
			const response = await agentService.startRun(config);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Request failed with status ${response.status}`);
			}

			if (!response.body) {
				throw new Error('No response body');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let eventType = '';

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('event:')) {
						eventType = line.slice(6).trim();
						continue;
					}

					if (line.startsWith('data:')) {
						const dataStr = line.slice(5).trim();
						if (!dataStr) continue;

						try {
							const data = JSON.parse(dataStr);

							// Use event type if available, otherwise determine from data shape
							if (eventType === 'start' || ('runId' in data && 'url' in data)) {
								handleStartEvent(data as SSEStartEvent);
							} else if (eventType === 'step' || ('step' in data && 'phase' in data)) {
								handleStepEvent(data as SSEStepEvent);
							} else if (eventType === 'approval_required' || ('step' in data && 'action' in data && !('phase' in data))) {
								handleApprovalRequiredEvent(data as SSEApprovalRequiredEvent);
							} else if (eventType === 'complete' || ('success' in data && 'summary' in data)) {
								handleCompleteEvent(data as SSECompleteEvent);
							}
							eventType = '';
						} catch {
							// Ignore parse errors for malformed SSE data
						}
					}
				}
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return;
			}

			update((state) => ({
				...state,
				status: 'failed',
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			}));
		}
	}

	function handleStartEvent(data: SSEStartEvent) {
		update((state) => ({
			...state,
			status: 'running',
			runId: data.runId,
			url: data.url,
			flowDescription: data.flowDescription,
			expectedResult: data.expectedResult,
			mode: data.mode
		}));
	}

	function handleStepEvent(data: SSEStepEvent) {
		update((state) => {
			const existingStepIndex = state.steps.findIndex(
				(s) => s.step === data.step && s.phase === data.phase
			);

			const newStep: ActiveRunStep = {
				step: data.step,
				phase: data.phase,
				thinking: data.thinking,
				action: data.action,
				result: data.result,
				screenshot: data.screenshot
			};

			let newSteps: ActiveRunStep[];
			if (existingStepIndex >= 0) {
				newSteps = [...state.steps];
				newSteps[existingStepIndex] = newStep;
			} else {
				newSteps = [...state.steps, newStep];
			}

			return {
				...state,
				status: 'running',
				steps: newSteps,
				currentStep: data.step,
				pendingApproval: null
			};
		});
	}

	function handleApprovalRequiredEvent(data: SSEApprovalRequiredEvent) {
		update((state) => ({
			...state,
			status: 'awaiting_approval',
			pendingApproval: {
				step: data.step,
				action: data.action,
				screenshot: data.screenshot
			}
		}));
	}

	function handleCompleteEvent(data: SSECompleteEvent) {
		update((state) => ({
			...state,
			status: data.success ? 'completed' : 'failed',
			result: {
				success: data.success,
				summary: data.summary,
				error: data.error,
				totalSteps: data.totalSteps
			},
			pendingApproval: null
		}));
	}

	async function approve(approved: boolean) {
		const state = get({ subscribe });
		if (!state.runId || !state.pendingApproval) return;

		try {
			await agentService.approve(state.runId, approved);
			update((s) => ({
				...s,
				status: approved ? 'running' : 'failed',
				pendingApproval: null
			}));
		} catch (err) {
			update((s) => ({
				...s,
				status: 'failed',
				error: err instanceof Error ? err.message : 'Failed to send approval'
			}));
		}
	}

	function reset() {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		set(initialState);
	}

	function rerun() {
		const state = get({ subscribe });
		if (!state.url || !state.flowDescription || !state.expectedResult) {
			return;
		}

		startRun({
			url: state.url,
			flowDescription: state.flowDescription,
			expectedResult: state.expectedResult,
			mode: state.mode || 'autonomous'
		});
	}

	function getConfig(): TestConfig | null {
		const state = get({ subscribe });
		if (!state.url || !state.flowDescription || !state.expectedResult) {
			return null;
		}
		return {
			url: state.url,
			flowDescription: state.flowDescription,
			expectedResult: state.expectedResult,
			mode: state.mode || 'autonomous'
		};
	}

	return {
		subscribe,
		startRun,
		approve,
		reset,
		rerun,
		getConfig
	};
}

export const activeRun = createActiveRunStore();
