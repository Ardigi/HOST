// UI Component exports
// Components will be added here as they are created

export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

// POS Wrapper Components
export { default as POSAppBar } from './POSAppBar.svelte';
export { default as POSButton } from './POSButton.svelte';
export { default as POSCard } from './POSCard.svelte';
export { default as POSDialog } from './POSDialog.svelte';
export { default as POSList } from './POSList.svelte';
export { default as POSNavigationBar } from './POSNavigationBar.svelte';
export { default as POSSelect } from './POSSelect.svelte';
export { default as POSTabs } from './POSTabs.svelte';
export { default as POSTextField } from './POSTextField.svelte';

// Component types
export type { SelectOption, ListItem } from './types';
