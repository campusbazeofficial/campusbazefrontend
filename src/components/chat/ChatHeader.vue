<!-- src/components/chat/ChatHeader.vue -->
<template>
  <header class="flex shrink-0 items-center justify-between border-b border-cb-divider bg-cb-base px-4 py-3">
    <div class="flex items-center gap-3">
      <!-- Back button (mobile) -->
      <button
        v-if="room"
        @click="$emit('back')"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field lg:hidden"
      >
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>

      <!-- Room Info -->
      <div v-if="room && otherParty" class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="relative">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cb-accent-subtle text-sm font-bold text-cb-accent overflow-hidden">
            <img
              v-if="otherParty.avatar"
              :src="otherParty.avatar"
              class="h-full w-full object-cover"
              :alt="otherParty.firstName"
            />
            <span v-else>{{ getInitials(otherParty) }}</span>
          </div>
          <!-- Online indicator (socket integration) -->
          <span
            v-if="isOnline"
            class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-cb-base bg-green-500"
          ></span>
        </div>

        <!-- User Info -->
        <div class="min-w-0">
          <h2 class="truncate text-sm font-semibold text-cb-text">
            {{ getDisplayName(otherParty) }}
          </h2>
          <div class="flex items-center gap-1.5">
            <span
              v-if="contextInfo"
              class="inline-flex items-center gap-1 text-[10px] text-cb-muted"
            >
              <i :class="getContextIcon(contextInfo.type)" class="text-[9px]"></i>
              <span class="truncate max-w-[150px]">{{ contextInfo.title }}</span>
            </span>
            <span
              v-if="isTyping"
              class="text-[10px] text-cb-accent"
            >
              typing...
            </span>
          </div>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-else-if="isLoading" class="flex items-center gap-3">
        <div class="h-10 w-10 animate-pulse rounded-full bg-cb-field"></div>
        <div class="space-y-1.5">
          <div class="h-4 w-24 animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-16 animate-pulse rounded bg-cb-field"></div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <!-- Search (only in room list view) -->
      <div v-if="!room" class="relative">
        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-cb-muted-40"></i>
        <input
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          type="text"
          placeholder="Search conversations..."
          class="w-64 rounded-lg border border-cb-divider bg-cb-field py-2 pl-9 pr-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"
        />
      </div>

      <!-- Info button -->
      <button
        v-if="room"
        @click="$emit('info')"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field"
      >
        <i class="fa-solid fa-circle-info text-sm"></i>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room: { type: Object, default: null },
  otherParty: { type: Object, default: null },
  contextInfo: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  search: { type: String, default: '' }
})

defineEmits(['update:search', 'back', 'info'])

// Placeholder - integrate with socket for real online status
const isOnline = computed(() => false)
const isTyping = computed(() => false)

function getInitials(user) {
  if (!user) return '?'
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

function getDisplayName(user) {
  if (!user) return 'Unknown'
  return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
}

function getContextIcon(type) {
  return type === 'errand' ? 'fa-solid fa-box' : 'fa-solid fa-briefcase'
}
</script>