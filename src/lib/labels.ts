import type { AccountType, AssetType, LiabilityType } from './repo';

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'property', label: 'Property' },
  { value: 'investment', label: 'Investments' },
  { value: 'gold', label: 'Gold' },
  { value: 'vehicle', label: 'Vehicles' },
  { value: 'receivable', label: 'Money owed to you' },
  { value: 'other', label: 'Other' },
];

/** Net worth chart groups in their fixed palette slots; cash and accounts take slot 0. */
export const ASSET_GROUPS: { key: string; label: string; slot: number | 'other'; types: AssetType[] }[] = [
  { key: 'gold', label: 'Gold', slot: 1, types: ['gold'] },
  { key: 'property', label: 'Property', slot: 2, types: ['property'] },
  { key: 'investment', label: 'Investments', slot: 3, types: ['investment'] },
  { key: 'other', label: 'Vehicles, money owed to you, other', slot: 'other', types: ['vehicle', 'receivable', 'other'] },
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
