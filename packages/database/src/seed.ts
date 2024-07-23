import { createClient } from '@libsql/client';
import { createId } from '@paralleldrive/cuid2';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Database Seed Script
 * Creates demo data for development and testing
 */

const client = createClient({
	url: process.env.DATABASE_URL || 'file:./dev.db',
	authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

async function seed() {
	console.log('🌱 Seeding database...\n');

	try {
		// Clear existing data (in reverse order of dependencies)
		console.log('🗑️  Clearing existing data...');
		await db.delete(schema.orderItemModifiers);
		await db.delete(schema.orderItems);
		await db.delete(schema.orders);
		await db.delete(schema.payments);
		await db.delete(schema.menuItemModifierGroups);
		await db.delete(schema.menuModifiers);
		await db.delete(schema.menuModifierGroups);
		await db.delete(schema.menuItems);
		await db.delete(schema.menuCategories);
		await db.delete(schema.inventoryTransactions);
		await db.delete(schema.inventoryPurchaseOrderItems);
		await db.delete(schema.inventoryPurchaseOrders);
		await db.delete(schema.inventorySuppliers);
		await db.delete(schema.inventoryItems);
		await db.delete(schema.staffShifts);
		await db.delete(schema.tables);
		await db.delete(schema.users);
		await db.delete(schema.venues);
		console.log('✅ Cleared existing data\n');

		// 1. Create Demo Venue
		console.log('🏢 Creating venue...');
		const venueId = createId();
		await db.insert(schema.venues).values({
			id: venueId,
			name: 'The Copper Pour',
			slug: 'copper-pour',
			email: 'contact@copperpour.com',
			phone: '(555) 123-4567',
			address: '123 Main Street',
			city: 'Austin',
			state: 'TX',
			zipCode: '78701',
			country: 'US',
			timezone: 'America/Chicago',
			currency: 'USD',
			taxRate: 825, // 8.25%
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		console.log(`✅ Created venue: The Copper Pour (${venueId})\n`);

		// 2. Create Demo Users
		console.log('👥 Creating users...');
		const adminId = createId();
		const serverId = createId();
		const bartenderId = createId();

		await db.insert(schema.users).values([
			{
				id: adminId,
				venueId,
				keycloakId: 'admin-kc-001',
				email: 'admin@copperpour.com',
				firstName: 'Alice',
				lastName: 'Manager',
				phone: '(555) 111-0001',
				role: 'admin',
				pinCodeHash: 'hashed_1234', // PIN: 1234
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: serverId,
				venueId,
				keycloakId: 'server-kc-001',
				email: 'server@copperpour.com',
				firstName: 'Bob',
				lastName: 'Smith',
				phone: '(555) 111-0002',
				role: 'server',
				pinCodeHash: 'hashed_5678', // PIN: 5678
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: bartenderId,
				venueId,
				keycloakId: 'bartender-kc-001',
				email: 'bartender@copperpour.com',
				firstName: 'Charlie',
				lastName: 'Mixer',
				phone: '(555) 111-0003',
				role: 'bartender',
				pinCodeHash: 'hashed_9012', // PIN: 9012
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 3 users (Admin, Server, Bartender)\n');

		// 3. Create Menu Categories
		console.log('📁 Creating menu categories...');
		const appetizersId = createId();
		const entreesId = createId();
		const cocktailsId = createId();
		const beerWineId = createId();

		await db.insert(schema.menuCategories).values([
			{
				id: appetizersId,
				venueId,
				name: 'Appetizers',
				slug: 'appetizers',
				description: 'Start your meal right',
				displayOrder: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: entreesId,
				venueId,
				name: 'Entrees',
				slug: 'entrees',
				description: 'Main dishes',
				displayOrder: 2,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: cocktailsId,
				venueId,
				name: 'Cocktails',
				slug: 'cocktails',
				description: 'Handcrafted cocktails',
				displayOrder: 3,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: beerWineId,
				venueId,
				name: 'Beer & Wine',
				slug: 'beer-wine',
				description: 'Curated selection',
				displayOrder: 4,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 4 menu categories\n');

		// 4. Create Menu Items
		console.log('🍽️  Creating menu items...');
		await db.insert(schema.menuItems).values([
			// Appetizers
			{
				id: createId(),
				venueId,
				categoryId: appetizersId,
				name: 'Wings',
				slug: 'wings',
				description: 'Crispy chicken wings with your choice of sauce',
				price: 12.99,
				calories: 850,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: 15,
				displayOrder: 1,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				categoryId: appetizersId,
				name: 'Nachos',
				slug: 'nachos',
				description: 'Loaded nachos with cheese, jalapeños, and sour cream',
				price: 10.99,
				calories: 920,
				isVegetarian: true,
				isVegan: false,
				isGlutenFree: true,
				preparationTime: 10,
				displayOrder: 2,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			// Entrees
			{
				id: createId(),
				venueId,
				categoryId: entreesId,
				name: 'Burger',
				slug: 'burger',
				description: 'Classic burger with lettuce, tomato, and our special sauce',
				price: 14.99,
				calories: 650,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: 20,
				displayOrder: 1,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				categoryId: entreesId,
				name: 'Fish & Chips',
				slug: 'fish-chips',
				description: 'Beer-battered cod with crispy fries',
				price: 16.99,
				calories: 780,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: 25,
				displayOrder: 2,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			// Cocktails
			{
				id: createId(),
				venueId,
				categoryId: cocktailsId,
				name: 'Old Fashioned',
				slug: 'old-fashioned',
				description: 'Bourbon, bitters, sugar, orange peel',
				price: 12.0,
				calories: 150,
				isVegetarian: true,
				isVegan: true,
				isGlutenFree: true,
				preparationTime: 5,
				displayOrder: 1,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				categoryId: cocktailsId,
				name: 'Margarita',
				slug: 'margarita',
				description: 'Tequila, lime juice, triple sec, salt rim',
				price: 10.0,
				calories: 200,
				isVegetarian: true,
				isVegan: true,
				isGlutenFree: true,
				preparationTime: 5,
				displayOrder: 2,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			// Beer & Wine
			{
				id: createId(),
				venueId,
				categoryId: beerWineId,
				name: 'IPA Draft',
				slug: 'ipa-draft',
				description: 'Local craft IPA on tap',
				price: 7.0,
				calories: 200,
				isVegetarian: true,
				isVegan: true,
				isGlutenFree: false,
				preparationTime: 2,
				displayOrder: 1,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				categoryId: beerWineId,
				name: 'House Red',
				slug: 'house-red',
				description: 'Cabernet Sauvignon by the glass',
				price: 9.0,
				calories: 125,
				isVegetarian: true,
				isVegan: true,
				isGlutenFree: true,
				preparationTime: 2,
				displayOrder: 2,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 8 menu items\n');

		// 5. Create Modifier Groups & Modifiers
		console.log('🎛️  Creating modifiers...');
		const cookTempGroupId = createId();
		const sauceGroupId = createId();

		await db.insert(schema.menuModifierGroups).values([
			{
				id: cookTempGroupId,
				venueId,
				name: 'Cook Temperature',
				displayOrder: 1,
				selectionType: 'single',
				isRequired: true,
				minSelections: 1,
				maxSelections: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: sauceGroupId,
				venueId,
				name: 'Wing Sauce',
				displayOrder: 1,
				selectionType: 'single',
				isRequired: true,
				minSelections: 1,
				maxSelections: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		await db.insert(schema.menuModifiers).values([
			// Cook temps
			{
				id: createId(),
				groupId: cookTempGroupId,
				name: 'Rare',
				priceAdjustment: 0,
				displayOrder: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: cookTempGroupId,
				name: 'Medium Rare',
				priceAdjustment: 0,
				displayOrder: 2,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: cookTempGroupId,
				name: 'Medium',
				priceAdjustment: 0,
				displayOrder: 3,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: cookTempGroupId,
				name: 'Medium Well',
				priceAdjustment: 0,
				displayOrder: 4,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: cookTempGroupId,
				name: 'Well Done',
				priceAdjustment: 0,
				displayOrder: 5,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			// Wing sauces
			{
				id: createId(),
				groupId: sauceGroupId,
				name: 'Buffalo',
				priceAdjustment: 0,
				displayOrder: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: sauceGroupId,
				name: 'BBQ',
				priceAdjustment: 0,
				displayOrder: 2,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: sauceGroupId,
				name: 'Honey Garlic',
				priceAdjustment: 0.5,
				displayOrder: 3,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				groupId: sauceGroupId,
				name: 'Nashville Hot',
				priceAdjustment: 1.0,
				displayOrder: 4,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 2 modifier groups with 9 modifiers\n');

		// 6. Create Inventory Items
		console.log('📦 Creating inventory items...');
		await db.insert(schema.inventoryItems).values([
			{
				id: createId(),
				venueId,
				name: "Tito's Vodka 750ml",
				sku: 'VODKA-TITOS-750',
				category: 'liquor',
				subcategory: 'vodka',
				unitType: 'bottle',
				unitSize: 750,
				unitSizeUom: 'ml',
				unitsPerCase: 12,
				quantityOnHand: 24,
				parLevel: 18,
				reorderPoint: 12,
				reorderQuantity: 24,
				unitCost: 18.99,
				caseCost: 215.88,
				primaryVendor: 'RNDC',
				storageLocation: 'Back Bar',
				storageTemp: 'room',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				name: 'Buffalo Trace Bourbon 750ml',
				sku: 'BOURBON-BT-750',
				category: 'liquor',
				subcategory: 'bourbon',
				unitType: 'bottle',
				unitSize: 750,
				unitSizeUom: 'ml',
				unitsPerCase: 12,
				quantityOnHand: 18,
				parLevel: 12,
				reorderPoint: 8,
				reorderQuantity: 12,
				unitCost: 24.99,
				caseCost: 287.88,
				primaryVendor: 'Southern Glazers',
				storageLocation: 'Liquor Cabinet',
				storageTemp: 'room',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				name: 'Local IPA Keg',
				sku: 'BEER-IPA-KEG',
				category: 'beer',
				subcategory: 'ipa',
				unitType: 'keg',
				unitSize: 15.5,
				unitSizeUom: 'gal',
				unitsPerCase: 1,
				quantityOnHand: 3,
				parLevel: 2,
				reorderPoint: 1,
				reorderQuantity: 2,
				unitCost: 145.0,
				primaryVendor: 'Local Distributor',
				storageLocation: 'Walk-in Cooler',
				storageTemp: 'cooler',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 3 inventory items\n');

		// 7. Create Tables
		console.log('🪑 Creating tables...');
		await db.insert(schema.tables).values([
			{
				id: createId(),
				venueId,
				tableNumber: 1,
				sectionName: 'bar',
				capacity: 2,
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				tableNumber: 2,
				sectionName: 'bar',
				capacity: 4,
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				tableNumber: 10,
				sectionName: 'dining',
				capacity: 4,
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				tableNumber: 11,
				sectionName: 'dining',
				capacity: 6,
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: createId(),
				venueId,
				tableNumber: 20,
				sectionName: 'patio',
				capacity: 4,
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		console.log('✅ Created 5 tables\n');

		console.log('✨ Database seeded successfully!\n');
		console.log('📊 Summary:');
		console.log('  - 1 venue (The Copper Pour)');
		console.log('  - 3 users (Admin, Server, Bartender)');
		console.log('  - 4 menu categories');
		console.log('  - 8 menu items');
		console.log('  - 2 modifier groups with 9 modifiers');
		console.log('  - 3 inventory items');
		console.log('  - 5 tables (bar, dining, patio)');
		console.log('\n🎉 Ready to start development!\n');
	} catch (error) {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	}

	process.exit(0);
}

seed();
