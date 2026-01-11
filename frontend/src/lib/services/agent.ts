import type { TestConfig, PendingApproval, ApprovalResponse } from '$lib/types';
import { api } from './api';

export const agentService = {
	startRun: (config: TestConfig) => api.stream('/run', config),

	approve: (runId: string, approved: boolean) =>
		api.post<ApprovalResponse>(`/run/${runId}/approve`, { approved }),

	getPending: (runId: string) => api.get<PendingApproval>(`/run/${runId}/pending`)
};
