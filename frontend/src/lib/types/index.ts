export type RunMode = 'autonomous' | 'supervised' | 'manual';

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export type StepPhase = 'thinking' | 'acting' | 'result';

export interface TestConfig {
	url: string;
	flowDescription: string;
	expectedResult: string;
	mode?: RunMode;
}

export interface ClickAction {
	action: 'click';
	args: {
		element_index: number;
		reason: string;
	};
}

export interface TypeAction {
	action: 'type';
	args: {
		element_index: number;
		text: string;
		reason: string;
	};
}

export interface ScrollAction {
	action: 'scroll';
	args: {
		direction: 'up' | 'down' | 'top';
		reason: string;
	};
}

export interface WaitAction {
	action: 'wait';
	args: {
		seconds: number;
		reason: string;
	};
}

export interface DoneAction {
	action: 'done';
	args: {
		summary: string;
		expected_result_achieved: boolean;
	};
}

export interface FailAction {
	action: 'fail';
	args: {
		reason: string;
		blocker: string;
	};
}

export type AgentAction =
	| ClickAction
	| TypeAction
	| ScrollAction
	| WaitAction
	| DoneAction
	| FailAction;

export interface RunStep {
	id: number;
	runId: string;
	stepNumber: number;
	phase: StepPhase;
	thinking: string | null;
	action: string | null;
	result: string | null;
	screenshot: string | null;
	durationMs: number;
	createdAt: string;
}

export interface Run {
	id: string;
	url: string;
	flowDescription: string;
	expectedResult: string;
	mode: RunMode;
	status: RunStatus;
	success: boolean | null;
	summary: string | null;
	error: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	steps?: RunStep[];
}

export interface SSEStartEvent {
	runId: string;
	url: string;
	flowDescription: string;
	expectedResult: string;
	mode: RunMode;
}

export interface SSEStepEvent {
	step: number;
	phase: StepPhase;
	action?: AgentAction;
	thinking?: string | null;
	result?: string;
	screenshot?: string;
}

export interface SSEApprovalRequiredEvent {
	step: number;
	action: AgentAction;
	screenshot: string;
}

export interface SSECompleteEvent {
	success: boolean;
	summary: string;
	error?: string;
	totalSteps: number;
}

export interface PendingApproval {
	pending: boolean;
	step?: number;
	action?: AgentAction;
}

export interface ApprovalResponse {
	success: boolean;
	step: number;
	approved: boolean;
}
