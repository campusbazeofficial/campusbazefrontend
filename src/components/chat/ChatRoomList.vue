<!-- src/components/chat/ChatRoomList.vue -->
<template>
  <div class="flex h-full flex-col">
    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="space-y-2 p-3">
        <div
          v-for="i in 5"
          :key="i"
          class="flex animate-pulse items-center gap-3 rounded-xl bg-cb-base p-3"
        >
          <div class="h-12 w-12 rounded-full bg-cb-field"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-24 rounded bg-cb-field"></div>
            <div class="h-3 w-32 rounded bg-cb-field"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!filteredRooms.length" class="flex flex-col items-center justify-center p-8">
        <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-field">
          <i class="fa-regular fa-message text-2xl text-cb-muted-40"></i>
        </div>
        <p class="text-sm font-semibold text-cb-text">No conversations yet</p>
        <p class="text-xs text-cb-muted">Start chatting with other users</p>
      </div>

      <div v-else class="divide-y divide-cb-divider">
        <button
          v-for="room in filteredRooms"
          :key="room.roomId"
          @click="$emit('select', room.roomId)"
          :class="[
            'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-cb-field/50',
            { 'bg-cb-accent-subtle/50': currentRoomId === room.roomId }
          ]"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-cb-accent-subtle text-sm font-bold text-cb-accent overflow-hidden">
              <img
                v-if="room.otherParty?.avatar"
                :src="room.otherParty.avatar"
                class="h-full w-full object-cover"
                alt=""
              />
              <span v-else>{{ getInitials(room.otherParty) }}</span>
            </div>
            <!-- Unread indicator -->
            <span
              v-if="room.unreadCount > 0"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast"
            >
              {{ room.unreadCount > 9 ? '9+' : room.unreadCount }}
            </span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center justify-between">
              <h3 class="truncate text-sm font-semibold text-cb-text">
                {{ getDisplayName(room.otherParty) }}
              </h3>
              <span class="shrink-0 text-[10px] text-cb-muted-40">
                {{ formatTime(room.updatedAt) }}
              </span>
            </div>
            
            <div class="mb-1 flex items-center gap-1">
              <i
                :class="getContextIcon(room.roomType)"
                class="text-[9px] text-cb-muted-40"
              ></i>
              <span class="truncate text-[10px] text-cb-muted">
                {{ room.contextTitle }}
              </span>
            </div>

            <p
              :class="[
                'truncate text-xs',
                room.unreadCount > 0 ? 'font-semibold text-cb-text' : 'text-cb-muted'
              ]"
            >
              {{ getLastMessagePreview(room.lastMessage) }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rooms: { type: Array, default: () => [] },
  currentRoomId: { type: String, default: null },
  loading: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' }
})

defineEmits(['select', 'refresh'])

const filteredRooms = computed(() => {
  if (!props.searchQuery) return props.rooms
  
  const query = props.searchQuery.toLowerCase()
  return props.rooms.filter(room => {
    const other = room.otherParty
    const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase()
    const context = room.contextTitle?.toLowerCase() || ''
    return name.includes(query) || context.includes(query)
  })
})

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

function getLastMessagePreview(message) {
  if (!message) return 'No messages yet'
  return message.content?.length > 30 
    ? message.content.slice(0, 30) + '...' 
    : message.content
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>