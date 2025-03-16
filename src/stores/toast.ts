import { writable } from 'svelte/store';

type Toast = {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
};

export const toasts = writable<Toast[]>([]);

export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
	const id = Date.now();

	toasts.update((allToasts) => [...allToasts, { id, message, type }]);
		
	// Remove toast after 3 seconds
	setTimeout(() => {
		toasts.update((allToasts) => allToasts.filter((toast) => toast.id !== id));
	}, 3000);
}
