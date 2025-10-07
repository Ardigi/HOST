<script lang="ts">
/**
 * POS-optimized App Bar component
 * Material Design 3 Top App Bar with POS-specific touch targets
 *
 * Touch target requirements:
 * - AppBar height: 56px (comfortable for tablets)
 * - Navigation button: 48px minimum (WCAG 2.1 AA)
 * - User menu button: 48px minimum
 *
 * @component
 */

interface User {
	name: string;
	email: string;
}

interface Props {
	/**
	 * Title text for the app bar
	 */
	title: string;

	/**
	 * User information for display in app bar
	 */
	user?: User;

	/**
	 * Navigation button click handler (menu/back button)
	 */
	onNavigationClick?: () => void;

	/**
	 * Logout button click handler
	 */
	onLogout?: () => void;

	/**
	 * Custom aria-label for the app bar
	 */
	ariaLabel?: string;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

let {
	title,
	user,
	onNavigationClick,
	onLogout,
	ariaLabel,
	class: className = '',
}: Props = $props();

// State for user menu
let showUserMenu = $state(false);

function handleNavigationClick() {
	if (onNavigationClick) {
		onNavigationClick();
	}
}

function toggleUserMenu() {
	showUserMenu = !showUserMenu;
}

function handleLogout() {
	showUserMenu = false;
	if (onLogout) {
		onLogout();
	}
}
</script>

<header
	aria-label={ariaLabel}
	class="pos-appbar {className}"
>
	<div class="pos-appbar-content">
		<!-- Navigation Icon Button -->
		<button
			type="button"
			class="pos-appbar-nav-button"
			onclick={handleNavigationClick}
			aria-label="Open navigation menu"
		>
			<span class="material-symbols-outlined">menu</span>
		</button>

		<!-- Title -->
		<h1 class="pos-appbar-title">{title}</h1>

		<!-- Spacer -->
		<div class="pos-appbar-spacer"></div>

		<!-- User Menu -->
		{#if user}
			<div class="pos-appbar-user-menu">
				<button
					type="button"
					class="pos-appbar-user-button"
					onclick={toggleUserMenu}
					aria-label="User menu: {user.name}"
					aria-expanded={showUserMenu}
				>
					<span class="pos-appbar-user-name">{user.name}</span>
					<span class="material-symbols-outlined">account_circle</span>
				</button>

				<!-- User Menu Dropdown -->
				{#if showUserMenu}
					<div class="pos-appbar-user-dropdown">
						<div class="pos-appbar-user-info">
							<div class="pos-appbar-user-name-full">{user.name}</div>
							<div class="pos-appbar-user-email">{user.email}</div>
						</div>
						<button
							type="button"
							class="pos-appbar-logout-button"
							onclick={handleLogout}
						>
							<span class="material-symbols-outlined">logout</span>
							<span>Logout</span>
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</header>

<style>
	/* Base POS app bar styling */
	.pos-appbar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 56px;
		height: 56px;
		padding: 0 0.5rem;
		background-color: var(--md-sys-color-surface, #fef7ff);
		color: var(--md-sys-color-on-surface, #1d1b20);
		box-shadow: var(--md-sys-elevation-2, 0 1px 3px rgba(0, 0, 0, 0.12));
	}

	.pos-appbar-content {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 0.5rem;
	}

	/* Navigation button */
	.pos-appbar-nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 48px;
		min-height: 48px;
		padding: 0.5rem;
		border: none;
		background: transparent;
		color: var(--md-sys-color-on-surface, #1d1b20);
		cursor: pointer;
		border-radius: 50%;
		transition: background-color var(--host-transition-fast, 200ms) ease;
	}

	.pos-appbar-nav-button:hover {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	.pos-appbar-nav-button:focus-visible {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: 2px;
	}

	.pos-appbar-nav-button:active {
		background-color: var(--md-sys-color-secondary-container, #e8def8);
	}

	/* Title */
	.pos-appbar-title {
		font-size: 1.375rem;
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: 0.00625em;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Spacer */
	.pos-appbar-spacer {
		flex: 1;
	}

	/* User menu */
	.pos-appbar-user-menu {
		position: relative;
	}

	.pos-appbar-user-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 48px;
		min-height: 48px;
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		color: var(--md-sys-color-on-surface, #1d1b20);
		cursor: pointer;
		border-radius: 24px;
		transition: background-color var(--host-transition-fast, 200ms) ease;
		font-size: 1rem;
	}

	.pos-appbar-user-button:hover {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	.pos-appbar-user-button:focus-visible {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: 2px;
	}

	.pos-appbar-user-name {
		font-weight: 500;
	}

	/* User dropdown menu */
	.pos-appbar-user-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		min-width: 250px;
		background-color: var(--md-sys-color-surface-container, #f3edf7);
		border-radius: 0.5rem;
		box-shadow: var(--md-sys-elevation-2, 0 2px 6px rgba(0, 0, 0, 0.15));
		padding: 0.5rem;
		z-index: 100;
	}

	.pos-appbar-user-info {
		padding: 1rem;
		border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
	}

	.pos-appbar-user-name-full {
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface, #1d1b20);
		margin-bottom: 0.25rem;
	}

	.pos-appbar-user-email {
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}

	.pos-appbar-logout-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 48px;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		color: var(--md-sys-color-on-surface, #1d1b20);
		cursor: pointer;
		border-radius: 0.25rem;
		transition: background-color var(--host-transition-fast, 200ms) ease;
		font-size: 1rem;
		text-align: left;
	}

	.pos-appbar-logout-button:hover {
		background-color: var(--md-sys-color-surface-variant, #e7e0ec);
	}

	.pos-appbar-logout-button:focus-visible {
		outline: 2px solid var(--md-sys-color-primary, #6750a4);
		outline-offset: -2px;
	}

	/* Material Symbols icons */
	.material-symbols-outlined {
		font-size: 24px;
		user-select: none;
	}
</style>
