import { writable } from 'svelte/store';

function createSessionStore() {
	const sessionToken = writable('');
	const sessionExpiration = writable('');
	const rememberToken = writable('');

	let initialized = false;

	function init() {
		if (typeof window === 'undefined' || initialized) return;
		sessionToken.set(localStorage.getItem('session-token') || '');
		sessionExpiration.set(localStorage.getItem('session-expiration') || '');
		rememberToken.set(localStorage.getItem('remember-token') || '');
		sessionToken.subscribe(val => localStorage.setItem('session-token', val));
		sessionExpiration.subscribe(val => localStorage.setItem('session-expiration', val));
		rememberToken.subscribe(val => localStorage.setItem('remember-token', val));
		initialized = true;
	}

	const login = async (username: string, password: string) => {
		const res = await fetch('https://api.cert.tastyworks.com/sessions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				login: username,
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
		sessionExpiration.set(data.data['session-expiration']);
		rememberToken.set(data.data['remember-token']);
	};

	const logout = async () => {
		const token = localStorage.getItem('session-token');
		if (token) {
			await fetch('https://api.cert.tastyworks.com/sessions', {
				method: 'DELETE',
				headers: {
					Authorization: token,
					'Content-Type': 'application/json'
				}
			}).catch(() => {
			});
		}
		sessionToken.set('');
		sessionExpiration.set('');
		rememberToken.set('');
	};

	return {
		sessionToken,
		sessionExpiration,
		rememberToken,
		login,
		logout,
        init
	};
    
}

export const session = createSessionStore();
