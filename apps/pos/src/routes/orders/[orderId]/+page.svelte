<script lang="ts">
	import { POSButton, POSCard, POSTabs } from '@host/ui';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Reactive calculations
	const subtotal = $derived(
		data.order?.items?.reduce((sum, item) => sum + item.total, 0) || 0
	);
	const taxRate = 0.0825; // 8.25% from seed data
	const tax = $derived(Number((subtotal * taxRate).toFixed(2)));
	const total = $derived(Number((subtotal + tax).toFixed(2)));

	// Active tab state
	let activeTab = $state('details');

	// Category filter state
	let selectedCategoryId = $state<string | null>(null);

	// Filtered menu items based on category
	const filteredMenuItems = $derived(
		selectedCategoryId
			? data.menuItems.filter(item => item.categoryId === selectedCategoryId)
			: data.menuItems
	);

	// Format currency
	function formatCurrency(amount: number): string {
		return `$${amount.toFixed(2)}`;
	}

	// Format order type
	function formatOrderType(type: string): string {
		return type.replace('_', ' ');
	}
</script>

<!-- Page Header -->
<div class="border-b border-gray-200 bg-white p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">
				Order #{data.order?.orderNumber || 'N/A'} - Table {data.order?.tableNumber || 'N/A'}
			</h1>
			<p class="mt-1 text-sm text-gray-600">
				{data.order?.guestCount || 0} guests • Server: {data.order?.server?.firstName || 'N/A'}
				{data.order?.server?.lastName || ''}
			</p>
		</div>
		<div class="flex gap-2">
			<POSButton variant="filled" size="comfortable" label="Send to Kitchen" />
			<POSButton variant="outlined" size="comfortable" label="Close" />
		</div>
	</div>
</div>

<!-- Main Content Area -->
<div class="flex h-[calc(100vh-8rem)] gap-4 p-4">
	<!-- Left Section: Tabs Content (2/3 width) -->
	<div class="flex-1">
		<POSTabs
			tabs={[
				{ id: 'details', label: 'Details' },
				{ id: 'menu', label: 'Menu' },
				{ id: 'payment', label: 'Payment' },
			]}
			activeId={activeTab}
			onTabChange={(tabId: string) => (activeTab = tabId)}
		/>

		<!-- Tab Panels -->
		<!-- Details Tab -->
		{#if activeTab === 'details'}
					<div role="tabpanel" class="space-y-4 p-4">
						<POSCard variant="outlined">
							<div class="p-4">
								<h2 class="mb-4 text-lg font-semibold text-gray-900">Order Information</h2>
								<dl class="space-y-2">
									<div class="flex justify-between">
										<dt class="text-sm text-gray-600">Order Type:</dt>
										<dd class="text-sm font-medium text-gray-900">
											{formatOrderType(data.order?.orderType || '')}
										</dd>
									</div>
									<div class="flex justify-between">
										<dt class="text-sm text-gray-600">Status:</dt>
										<dd class="text-sm font-medium text-gray-900">
											{data.order?.status || 'N/A'}
										</dd>
									</div>
								</dl>
							</div>
						</POSCard>

						<POSCard variant="outlined">
							<div class="p-4">
								<h2 class="mb-4 text-lg font-semibold text-gray-900">Current Items</h2>
								{#if data.order?.items && data.order.items.length > 0}
									<ul class="space-y-2">
										{#each data.order.items as item (item.id)}
											<li class="flex justify-between border-b border-gray-100 pb-2">
												<div>
													<p class="font-medium text-gray-900">{item.name}</p>
													<p class="text-sm text-gray-600">Qty: {item.quantity}</p>
												</div>
												<p class="font-medium text-gray-900">{formatCurrency(item.total)}</p>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="text-center text-sm text-gray-500">
										No items added yet. Switch to the Menu tab to add items.
									</p>
								{/if}
							</div>
						</POSCard>
					</div>
				{/if}

				<!-- Menu Tab -->
				{#if activeTab === 'menu'}
					<div role="tabpanel" class="space-y-4 p-4">
						<!-- Category Filters -->
						<div class="flex gap-2 overflow-x-auto pb-2">
							<POSButton
								variant={selectedCategoryId === null ? 'filled' : 'outlined'}
								size="comfortable"
								label="All"
								onclick={() => (selectedCategoryId = null)}
							/>
							{#each data.categories as category (category.id)}
								<POSButton
									variant={selectedCategoryId === category.id ? 'filled' : 'outlined'}
									size="comfortable"
									label={category.name}
									onclick={() => (selectedCategoryId = category.id)}
								/>
							{/each}
						</div>

						<!-- Menu Items Grid -->
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
							{#each filteredMenuItems as menuItem (menuItem.id)}
								<POSCard variant="outlined">
									<button type="button" class="w-full p-4 text-left hover:bg-gray-50">
										<h3 class="font-medium text-gray-900">{menuItem.name}</h3>
										{#if menuItem.description}
											<p class="mt-1 text-sm text-gray-600">{menuItem.description}</p>
										{/if}
										<p class="mt-2 font-semibold text-blue-600">
											{formatCurrency(menuItem.price)}
										</p>
									</button>
								</POSCard>
							{/each}
						</div>

						{#if filteredMenuItems.length === 0}
							<p class="text-center text-sm text-gray-500">
								No menu items available in this category.
							</p>
						{/if}
					</div>
				{/if}

				<!-- Payment Tab -->
				{#if activeTab === 'payment'}
					<div role="tabpanel" class="p-4">
						<POSCard variant="outlined">
							<div class="p-4">
								<h2 class="mb-4 text-lg font-semibold text-gray-900">Payment</h2>
								<p class="text-sm text-gray-500">Payment options coming soon...</p>
							</div>
						</POSCard>
					</div>
		{/if}
	</div>

	<!-- Right Section: Order Summary Sidebar (1/3 width) -->
	<div class="w-80">
		<POSCard variant="elevated">
			<div class="p-4">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

				<!-- Order Items -->
				<div class="mb-4 max-h-64 space-y-2 overflow-y-auto">
					{#if data.order?.items && data.order.items.length > 0}
						{#each data.order.items as item (item.id)}
							<div class="flex justify-between text-sm">
								<span class="text-gray-900">{item.quantity}x {item.name}</span>
								<span class="font-medium text-gray-900">{formatCurrency(item.total)}</span>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-gray-500">No items</p>
					{/if}
				</div>

				<!-- Totals -->
				<div class="space-y-2 border-t border-gray-200 pt-4">
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Subtotal:</span>
						<span class="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-600">Tax:</span>
						<span class="font-medium text-gray-900">{formatCurrency(tax)}</span>
					</div>
					<div class="flex justify-between border-t border-gray-200 pt-2 text-base">
						<span class="font-semibold text-gray-900">Total:</span>
						<span class="font-semibold text-gray-900">{formatCurrency(total)}</span>
					</div>
				</div>
			</div>
		</POSCard>
	</div>
</div>
