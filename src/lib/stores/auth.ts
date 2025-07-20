import { get, writable } from 'svelte/store';

const createSessionStore = () => {
	const sessionToken = writable('');
	const sessionExpiration = writable('');
	const rememberToken = writable('');

	let initialized = false;

	const init = () => {
		if (typeof window === 'undefined' || initialized) return;

		const expiration = localStorage.getItem('session-expiration') || '';

		if (expiration && new Date(expiration) < new Date()) {
			logout();
			return;
		}

		sessionToken.set(localStorage.getItem('session-token') || '');
		sessionExpiration.set(expiration);
		rememberToken.set(localStorage.getItem('remember-token') || '');
		initialized = true;
	};

	const login = async (loginUsername: string, password: string) => {
		const res = await fetch('https://api.cert.tastyworks.com/sessions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				login: loginUsername,
				password,
				'remember-me': true
			})
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err?.error?.message || 'Login failed');
		}

		const data = await res.json();
		sessionToken.set(data.data['session-token']);
		localStorage.setItem('session-token', data.data['session-token']);

		sessionExpiration.set(data.data['session-expiration']);
		localStorage.setItem('session-expiration', data.data['session-expiration']);

		rememberToken.set(data.data['remember-token']);
		localStorage.setItem('remember-token', data.data['remember-token']);
	};

	const logout = async () => {
		sessionToken.set('');
		localStorage.setItem('session-token', '');

		sessionExpiration.set('');
		localStorage.setItem('session-expiration', '');

		rememberToken.set('');
		localStorage.setItem('remember-token', '');

		const token = localStorage.getItem('session-token');
		if (token) {
			await fetch('https://api.cert.tastyworks.com/sessions', {
				method: 'DELETE',
				headers: {
					Authorization: token,
					'Content-Type': 'application/json'
				}
			}).catch(() => {});
		}
	};

	const fetchQuoteToken = async () => {
		const token = get(sessionToken);
		const res = await fetch('https://api.cert.tastyworks.com/api-quote-tokens', {
			headers: {
				Authorization: token
			}
		});
		if (!res.ok) throw new Error('Failed to get quote token');
		const json = await res.json();
		return json.data;
	};

	return {
		sessionToken,
		sessionExpiration,
		rememberToken,
		fetchQuoteToken,
		login,
		logout,
		init
	};
};

export const session = createSessionStore();
