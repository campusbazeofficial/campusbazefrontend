<!-- src/components/reusables/ToastContainer.vue -->
<template>
  <Teleport to="body">
    <div class="toast-wrapper">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="typeClass(t.type)"
        >
          <!-- icon -->
          <div class="toast-icon" :class="iconBg(t.type)">
            <i :class="iconClass(t.type)" class="text-xs"></i>
          </div>

          <!-- message -->
          <p class="toast-message">{{ t.message }}</p>

          <!-- dismiss -->
          <button @click="dismiss(t.id)" class="toast-dismiss">
            <i class="fa-solid fa-times text-xs"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

function typeClass(type) {
  return {
    success: 'border-emerald-100',
    error:   'border-red-100',
    warning: 'border-amber-100',
    info:    'border-gray-100',
  }[type]
}

function iconBg(type) {
  return {
    success: 'bg-emerald-100',
    error:   'bg-red-100',
    warning: 'bg-amber-100',
    info:    'bg-gray-100',
  }[type]
}

function iconClass(type) {
  return {
    success: 'fa-solid fa-check text-emerald-600',
    error:   'fa-solid fa-times text-red-500',
    warning: 'fa-solid fa-exclamation text-amber-600',
    info:    'fa-solid fa-info text-gray-500',
  }[type]
}
</script>

<style scoped>
/* ── Wrapper ── */
.toast-wrapper {
  position: fixed;
  z-index: 500;
  pointer-events: none;

  /* mobile: top-center, narrow */
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  max-width: 260px;
}

@media (min-width: 1024px) {
  .toast-wrapper {
    /* desktop: bottom-right, wider */
    top: auto;
    bottom: 1.25rem;
    left: auto;
    right: 1.25rem;
    transform: none;
    width: auto;
    max-width: 360px;
  }
}

/* ── Toast item ── */
.toast-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  border: 1px solid;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.09);
  pointer-events: auto;
  width: 100%;
}

/* ── Icon ── */
.toast-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Message ── */
.toast-message {
  font-size: 0.8rem;
  font-weight: 500;
  color: #1f2937;
  flex: 1;
  line-height: 1.4;
  word-break: break-words;
  margin: 0;
}

@media (min-width: 1024px) {
  .toast-message {
    font-size: 0.875rem;
  }
}

/* ── Dismiss ── */
.toast-dismiss {
  color: #d1d5db;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  flex-shrink: 0;
  transition: color 0.15s;
}
.toast-dismiss:hover { color: #6b7280; }

/* ── Transitions ── */
.toast-enter-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.18s ease;
}

/* mobile slides down from top, desktop slides up from bottom */
.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

@media (min-width: 1024px) {
  .toast-enter-from {
    transform: translateY(10px) scale(0.96);
  }
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.toast-move {
  transition: transform 0.25s ease;
}
</style>