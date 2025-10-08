/**
 * Tests for Order Detail Page
 * Browser tests for order detail display with tabs
 */

import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { PageData } from './$types';
import OrderDetailPage from './+page.svelte';

// Helper to create properly typed mock PageData
function createMockPageData(overrides?: Partial<PageData>): PageData {
	const defaults: PageData = {
		order: {
			id: 'order-123',
			orderNumber: 1,
			tableNumber: 5,
			guestCount: 2,
			status: 'open' as const,
			orderType: 'dine_in' as const,
			venueId: 'venue-123',
			serverId: 'user-123',
			subtotal: 29.98,
			tax: 2.47,
			tip: 0,
			total: 32.45,
			items: [
				{
					id: 'item-1',
					orderId: 'order-123',
					menuItemId: 'menu-1',
					name: 'Burger',
					quantity: 2,
					price: 14.99,
					modifierTotal: 0,
					total: 29.98,
					notes: null,
					status: 'pending' as const,
					sentToKitchenAt: null,
					createdAt: new Date(),
					modifiers: [],
				},
			],
			server: {
				id: 'user-123',
				firstName: 'Test',
				lastName: 'User',
				email: 'test@test.com',
				venueId: 'venue-123',
				role: 'server' as const,
				keycloakId: 'keycloak-123',
				phone: null,
				pinCodeHash: null,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			venue: {
				id: 'venue-123',
				name: 'The Copper Pour',
				slug: 'copper-pour',
				email: 'test@test.com',
				phone: null,
				address: null,
				city: null,
				state: null,
				zipCode: null,
				country: 'US',
				timezone: 'America/Chicago',
				currency: 'USD',
				taxRate: 825,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			notes: null,
			discount: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			completedAt: null,
		},
		menuItems: [
			{
				id: 'menu-1',
				name: 'Burger',
				price: 14.99,
				categoryId: 'cat-1',
				venueId: 'venue-123',
				slug: 'burger',
				description: 'Classic burger',
				isAvailable: true,
				isActive: true,
				displayOrder: 1,
				calories: null,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: null,
				imageUrl: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 'menu-2',
				name: 'Wings',
				price: 12.99,
				categoryId: 'cat-2',
				venueId: 'venue-123',
				slug: 'wings',
				description: 'Crispy wings',
				isAvailable: true,
				isActive: true,
				displayOrder: 2,
				calories: null,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: null,
				imageUrl: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
		categories: [
			{
				id: 'cat-1',
				name: 'Entrees',
				slug: 'entrees',
				venueId: 'venue-123',
				displayOrder: 1,
				isActive: true,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 'cat-2',
				name: 'Appetizers',
				slug: 'appetizers',
				venueId: 'venue-123',
				displayOrder: 2,
				isActive: true,
				description: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
		user: {
			id: 'user-123',
			email: 'test@test.com',
			firstName: 'Test',
			lastName: 'User',
			venueId: 'venue-123',
			roles: ['server'],
		},
	};
	return { ...defaults, ...overrides } as PageData;
}

describe('Order Detail Page', () => {
	describe('Page Header', () => {
		it('should display order number and table number', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const heading = page.getByText(/Order #1 - Table 5/i);
			await expect.element(heading).toBeInTheDocument();
		});

		it('should display guest count and server name', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const guestInfo = page.getByText(/2 guests • Server: Test\s+User/i);
			await expect.element(guestInfo).toBeInTheDocument();
		});
	});

	describe('Tab Navigation', () => {
		it('should display three tabs: Details, Menu, Payment', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const detailsTab = page.getByRole('tab', { name: /Details/i });
			const menuTab = page.getByRole('tab', { name: /Menu/i });
			const paymentTab = page.getByRole('tab', { name: /Payment/i });

			await expect.element(detailsTab).toBeInTheDocument();
			await expect.element(menuTab).toBeInTheDocument();
			await expect.element(paymentTab).toBeInTheDocument();
		});

		it('should default to Details tab', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const detailsTab = page.getByRole('tab', { name: /Details/i });
			await expect.element(detailsTab).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('Details Tab', () => {
		it('should display order information', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const orderType = page.getByText(/Order Type:/i);
			const dineIn = page.getByText(/dine in/i);
			const status = page.getByText(/Status:/i);
			const statusOpen = page.getByText(/open/i);

			await expect.element(orderType).toBeInTheDocument();
			await expect.element(dineIn).toBeInTheDocument();
			await expect.element(status).toBeInTheDocument();
			await expect.element(statusOpen).toBeInTheDocument();
		});

		it('should display current order items', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const quantity = page.getByText(/Qty: 2/i);
			await expect.element(quantity).toBeInTheDocument();
		});
	});

	describe('Order Summary Sidebar', () => {
		it('should display order summary', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const summary = page.getByText(/Order Summary/i);
			await expect.element(summary).toBeInTheDocument();
		});

		it('should display subtotal, tax, and total', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const subtotal = page.getByText('Subtotal:', { exact: true });
			const tax = page.getByText('Tax:', { exact: true });
			const total = page.getByText('Total:', { exact: true });

			await expect.element(subtotal).toBeInTheDocument();
			await expect.element(tax).toBeInTheDocument();
			await expect.element(total).toBeInTheDocument();
		});
	});

	describe('Action Buttons', () => {
		it('should display Send to Kitchen button', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const button = page.getByRole('button', { name: /Send to Kitchen/i });
			await expect.element(button).toBeInTheDocument();
		});

		it('should display Close Order button', async () => {
			const mockData = createMockPageData();
			render(OrderDetailPage, { data: mockData });

			const button = page.getByRole('button', { name: /Close/i });
			await expect.element(button).toBeInTheDocument();
		});
	});

	describe('Empty States', () => {
		it('should show message when no items in order', async () => {
			const mockData = createMockPageData();
			if (mockData.order) {
				mockData.order.items = [];
			}
			render(OrderDetailPage, { data: mockData });

			const message = page.getByText(/No items added yet/i);
			await expect.element(message).toBeInTheDocument();
		});
	});
});
