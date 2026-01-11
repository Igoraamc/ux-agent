import { writable } from 'svelte/store';

function createNewTestModalStore() {
	const { subscribe, set } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false)
	};
}

export const newTestModal = createNewTestModalStore();
