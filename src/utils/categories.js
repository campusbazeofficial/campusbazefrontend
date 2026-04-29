export const CATEGORIES = [
  { value: '',                    label: 'All categories',    short: 'All',          icon: 'fa-solid fa-border-all' },
  { value: 'delivery_pickup',     label: 'Delivery & Pickup', short: 'Delivery',     icon: 'fa-solid fa-truck' },
  { value: 'grocery_shopping',    label: 'Grocery Shopping',  short: 'Grocery',      icon: 'fa-solid fa-basket-shopping' },
  { value: 'printing_binding',    label: 'Printing & Binding',short: 'Printing',     icon: 'fa-solid fa-print' },
  { value: 'food_runs',           label: 'Food Runs',         short: 'Food',         icon: 'fa-solid fa-utensils' },
  { value: 'cleaning_laundry',    label: 'Cleaning & Laundry',short: 'Cleaning',     icon: 'fa-solid fa-broom' },
  { value: 'moving_assistance',   label: 'Moving Assistance', short: 'Moving',       icon: 'fa-solid fa-boxes-packing' },
  { value: 'typing_form_filling', label: 'Typing / Forms',    short: 'Typing',       icon: 'fa-solid fa-keyboard' },
  { value: 'queue_standing',      label: 'Queue Standing',    short: 'Queue',        icon: 'fa-solid fa-people-line' },
  { value: 'pet_care',            label: 'Pet Care',          short: 'Pets',         icon: 'fa-solid fa-paw' },
  { value: 'other',               label: 'Other',             short: 'Other',        icon: 'fa-solid fa-ellipsis' },
]

export function getCategory(value) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]
}

export function getCategoryLabel(value) {
  return getCategory(value).label
}

export function getCategoryIcon(value) {
  return getCategory(value).icon
}

export function formatDeadline(iso) {
  if (!iso) return 'No deadline'
  const hours = (new Date(iso) - new Date()) / 3600_000
  if (hours < 0) return 'Expired'
  if (hours < 1) return `Due in ${Math.max(1, Math.round(hours * 60))}m`
  if (hours < 24) return `Due in ${Math.round(hours)}h`
  const days = Math.ceil(hours / 24)
  if (days === 1) return 'Due tomorrow'
  if (days < 7) return `Due in ${days} days`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatTimeAgo(iso) {
  if (!iso) return ''
  const mins = (new Date() - new Date(iso)) / 60_000
  if (mins < 1) return 'just now'
  if (mins < 60) return `${Math.round(mins)}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export function isUrgent(iso) {
  if (!iso) return false
  return (new Date(iso) - new Date()) / 3600_000 < 24
}

export function initials(first = '', last = '') {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || 'U'
}
