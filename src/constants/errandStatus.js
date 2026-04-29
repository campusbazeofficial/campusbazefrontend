// src/constants/errandStatus.js

export const ERRAND_STATUS = {
  POSTED: 'posted',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
}

export const BID_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

// ─── Status Display Configuration ────────────────────────────────
export const STATUS_CONFIG = {
  [ERRAND_STATUS.POSTED]: {
    label: 'Open',
    bg: 'bg-cb-accent-subtle',
    text: 'text-cb-accent',
    dot: 'bg-cb-accent',
    icon: 'fa-solid fa-clock',
  },
  [ERRAND_STATUS.ACCEPTED]: {
    label: 'Accepted',
    bg: 'bg-cb-accent-subtle',
    text: 'text-cb-accent',
    dot: 'bg-cb-accent',
    icon: 'fa-solid fa-check-circle',
  },
  [ERRAND_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    bg: 'bg-cb-accent-subtle',
    text: 'text-cb-accent',
    dot: 'bg-cb-accent',
    icon: 'fa-solid fa-play-circle',
  },
  [ERRAND_STATUS.COMPLETED]: {
    label: 'Awaiting Confirmation',
    bg: 'bg-cb-warning-subtle',
    text: 'text-cb-warning',
    dot: 'bg-cb-warning',
    icon: 'fa-solid fa-hourglass-half',
  },
  [ERRAND_STATUS.CONFIRMED]: {
    label: 'Completed',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
    dot: 'bg-cb-muted',
    icon: 'fa-solid fa-circle-check',
  },
  [ERRAND_STATUS.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
    dot: 'bg-cb-muted',
    icon: 'fa-solid fa-ban',
  },
  [ERRAND_STATUS.DISPUTED]: {
    label: 'Disputed',
    bg: 'bg-cb-negative-subtle',
    text: 'text-cb-negative',
    dot: 'bg-cb-negative',
    icon: 'fa-solid fa-scale-balanced',
  },
}

export const BID_STATUS_CONFIG = {
  [BID_STATUS.PENDING]: {
    label: 'Pending',
    bg: 'bg-cb-warning-subtle',
    text: 'text-cb-warning',
  },
  [BID_STATUS.ACCEPTED]: {
    label: 'Accepted',
    bg: 'bg-cb-accent-subtle',
    text: 'text-cb-accent',
  },
  [BID_STATUS.REJECTED]: {
    label: 'Rejected',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
  },
  [BID_STATUS.WITHDRAWN]: {
    label: 'Withdrawn',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
  },
}

// ─── Allowed Actions by Status and Role ─────────────────────────
export const ALLOWED_ACTIONS = {
  poster: {
    [ERRAND_STATUS.POSTED]: ['cancel', 'view_bids'],
    [ERRAND_STATUS.ACCEPTED]: ['view_details', 'dispute'],
    [ERRAND_STATUS.IN_PROGRESS]: ['view_details', 'dispute'],
    [ERRAND_STATUS.COMPLETED]: ['confirm', 'dispute'],
    [ERRAND_STATUS.CONFIRMED]: ['view_details'],
    [ERRAND_STATUS.CANCELLED]: ['view_details'],
    [ERRAND_STATUS.DISPUTED]: ['view_details'],
  },
  runner: {
    [ERRAND_STATUS.POSTED]: ['bid', 'withdraw_bid'],
    [ERRAND_STATUS.ACCEPTED]: ['start', 'dispute'],
    [ERRAND_STATUS.IN_PROGRESS]: ['complete', 'dispute'],
    [ERRAND_STATUS.COMPLETED]: ['view_details', 'dispute'],
    [ERRAND_STATUS.CONFIRMED]: ['view_details'],
    [ERRAND_STATUS.CANCELLED]: ['view_details'],
    [ERRAND_STATUS.DISPUTED]: ['view_details'],
  },
}

// ─── Helper Functions ──────────────────────────────────────────
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || {
    label: status?.replace(/_/g, ' ') || 'Unknown',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
    dot: 'bg-cb-muted',
    icon: 'fa-solid fa-question',
  }
}

export function getBidStatusConfig(status) {
  return BID_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-cb-field',
    text: 'text-cb-muted',
  }
}

export function canPerformAction(role, status, action) {
  const allowed = ALLOWED_ACTIONS[role]?.[status] || []
  return allowed.includes(action)
}

export function getNextStatus(currentStatus, action) {
  const transitions = {
    [ERRAND_STATUS.POSTED]: {
      accept_bid: ERRAND_STATUS.ACCEPTED,
      cancel: ERRAND_STATUS.CANCELLED,
    },
    [ERRAND_STATUS.ACCEPTED]: {
      start: ERRAND_STATUS.IN_PROGRESS,
      dispute: ERRAND_STATUS.DISPUTED,
    },
    [ERRAND_STATUS.IN_PROGRESS]: {
      complete: ERRAND_STATUS.COMPLETED,
      dispute: ERRAND_STATUS.DISPUTED,
    },
    [ERRAND_STATUS.COMPLETED]: {
      confirm: ERRAND_STATUS.CONFIRMED,
      dispute: ERRAND_STATUS.DISPUTED,
    },
  }
  return transitions[currentStatus]?.[action] || null
}