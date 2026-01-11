import { writable } from 'svelte/store';

function createNavigationStore() {
	const { subscribe, update } = writable({
		drawerOpen: false
	});

	return {
		subscribe,
		openDrawer: () => update((state) => ({ ...state, drawerOpen: true })),
		closeDrawer: () => update((state) => ({ ...state, drawerOpen: false })),
		toggleDrawer: () => update((state) => ({ ...state, drawerOpen: !state.drawerOpen }))
	};
}

export const navigation = createNavigationStore();
