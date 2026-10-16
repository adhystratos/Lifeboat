import type { AccountType, AssetType, LiabilityType } from './repo';

/** Asset groups in their fixed chart slot order; cash and accounts take slot 0. */
export const ASSET_TYPES: { value: AssetType; label: string; slot: number }[] = [
  { value: 'property', label: 'Property', slot: 1 },
  { value: 'investment', label: 'Investments', slot: 2 },
  { value: 'gold', label: 'Gold', slot: 3 },
  { value: 'vehicle', label: 'Vehicles', slot: 4 },
  { value: 'receivable', label: 'Money owed to you', slot: 5 },
  { value: 'other', label: 'Other', slot: 6 },
];

export const LIABILITY_TYPES: { value: LiabilityType; label: string }[] = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'loan', label: 'Loan' },
  { value: 'card', label: 'Credit card' },
  { value: 'personal', label: 'Personal debt' },
];

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit card' },
];

export const accountTypeLabel = (type: AccountType) => ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;
