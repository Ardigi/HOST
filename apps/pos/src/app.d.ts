// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}

		interface Locals {
			user?: {
				id: string;
				email: string;
				firstName: string;
				lastName: string;
				venueId: string;
				roles: string[];
			} | null;
			session?: {
				id: string;
				expiresAt: Date;
			};
		}

		interface PageData {
			user?: App.Locals['user'];
		}

		// interface PageState {}

		interface Platform {
			env?: {
				DATABASE_URL?: string;
				KEYCLOAK_URL?: string;
				KEYCLOAK_REALM?: string;
				KEYCLOAK_CLIENT_ID?: string;
				REDIS_URL?: string;
			};
		}
	}
}

export {};
