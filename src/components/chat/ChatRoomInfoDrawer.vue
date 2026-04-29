<!-- src/components/chat/ChatRoomInfoDrawer.vue -->
<template>
  <div class="fixed inset-0 z-[300] bg-cb-overlay/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="absolute bottom-0 right-0 top-0 w-full max-w-sm bg-cb-base shadow-2xl sm:bottom-4 sm:right-4 sm:top-4 sm:rounded-2xl">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
          <h3 class="text-sm font-bold text-cb-text">Conversation Info</h3>
          <button
            @click="$emit('close')"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted hover:bg-cb-field"
          >
            <i class="fa-solid fa-times text-sm"></i>
          </button>
        </header>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-5">
          <!-- Other User -->
          <section class="mb-6">
            <h4 class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
              Chatting with
            </h4>
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-cb-accent-subtle text-lg font-bold text-cb-accent overflow-hidden">
                <img
                  v-if="otherParty?.avatar"
                  :src="otherParty.avatar"
                  class="h-full w-full object-cover"
                  alt=""
                />
                <span v-else>{{ getInitials() }}</span>
              </div>
              <div>
                <p class="text-base font-bold text-cb-text">{{ getDisplayName() }}</p>
                <p class="text-xs text-cb-muted">{{ otherParty?.email }}</p>
              </div>
            </div>
          </section>

          <!-- Context -->
          <section v-if="contextInfo" class="mb-6">
            <h4 class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
              About this conversation
            </h4>
            <div class="rounded-xl bg-cb-card p-4">
              <div class="mb-2 flex items-center gap-2">
                <i :class="getContextIcon()" class="text-cb-accent"></i>
                <span class="text-xs font-medium text-cb-muted">
                  {{ contextInfo.type === 'errand' ? 'Errand' : 'Service' }}
                </span>
              </div>
              <p class="text-sm font-semibold text-cb-text">{{ contextInfo.title }}</p>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <footer class="border-t border-cb-divider p-4">
          <button
            @click="$emit('close')"
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room: { type: Object, default: null },
  otherParty: { type: Object, default: null },
  contextInfo: { type: Object, default: null }
})

defineEmits(['close'])

function getInitials() {
  if (!props.otherParty) return '?'
  const first = props.otherParty.firstName?.[0] || ''
  const last = props.otherParty.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
}

function getDisplayName() {
  if (!props.otherParty) return 'Unknown'
  return props.otherParty.displayName || 
    `${props.otherParty.firstName || ''} ${props.otherParty.lastName || ''}`.trim() || 
    'User'
}

function getContextIcon() {
  return props.contextInfo?.type === 'errand' 
    ? 'fa-solid fa-box' 
    : 'fa-solid fa-briefcase'
}
</script>