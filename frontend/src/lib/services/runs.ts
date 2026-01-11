import type { Run, RunStep } from '$lib/types';
import { api } from './api';

export const runsService = {
	list: () => api.get<Run[]>('/runs'),

	get: (id: string) => api.get<Run>(`/runs/${id}`),

	getStep: (runId: string, stepNumber: number) =>
		api.get<RunStep>(`/runs/${runId}/steps/${stepNumber}`)
};
