const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type RequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;
	const { body, ...rest } = options;

	const config: RequestInit = {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	};

	if (body !== undefined) {
		config.body = JSON.stringify(body);
	}

	const response = await fetch(url, config);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.error || `Request failed with status ${response.status}`);
	}

	return response.json();
}

export const api = {
	get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

	post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body }),

	put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body }),

	delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

	stream: (endpoint: string, body: unknown) => {
		const url = `${API_BASE_URL}${endpoint}`;
		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	}
};
