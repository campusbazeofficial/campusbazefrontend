<!-- src/components/chat/ChatMessages.vue -->
<template>
  <div ref="containerRef" class="flex-1 overflow-y-auto p-4" @scroll="handleScroll">
    <!-- Load more indicator -->
    <div v-if="hasMore && !loading" class="pb-4 text-center">
      <button
        @click="$emit('load-more')"
        class="text-xs text-cb-accent hover:underline"
      >
        Load older messages
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="flex items-center gap-2">
        <div class="h-2 w-2 animate-pulse rounded-full bg-cb-accent"></div>
        <div class="h-2 w-2 animate-pulse rounded-full bg-cb-accent animation-delay-200"></div>
        <div class="h-2 w-2 animate-pulse rounded-full bg-cb-accent animation-delay-400"></div>
      </div>
    </div>

    <div v-else-if="!messages.length" class="flex h-full flex-col items-center justify-center">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-cb-field">
        <i class="fa-regular fa-message text-3xl text-cb-muted-40"></i>
      </div>
      <p class="text-sm font-semibold text-cb-text">No messages yet</p>
      <p class="text-xs text-cb-muted">Send a message to start the conversation</p>
    </div>

    <div v-else class="space-y-4">
      <template v-for="(group, date) in groupedMessages" :key="date">
        <!-- Date divider -->
        <div class="flex items-center justify-center">
          <span class="rounded-full bg-cb-field px-3 py-1 text-[10px] font-medium text-cb-muted">
            {{ date }}
          </span>
        </div>

        <!-- Messages for this date -->
        <div class="space-y-2">
          <ChatBubble
            v-for="message in group"
            :key="message.id || message._id"
            :message="message"
            :is-own="message.senderId === currentUserId"
            :other-party="otherParty"
            @reply="$emit('reply', message)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import ChatBubble from './ChatBubble.vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  currentUserId: { type: String, default: null },
  otherParty: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false }
})

defineEmits(['load-more', 'reply'])

const containerRef = ref(null)
const isNearBottom = ref(true)

const groupedMessages = computed(() => {
  const groups = {}
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  props.messages.forEach((message) => {
    const date = new Date(message.createdAt)
    const dateString = date.toDateString()

    let groupKey
    if (dateString === today) groupKey = 'Today'
    else if (dateString === yesterday) groupKey = 'Yesterday'
    else {
      groupKey = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(message)
  })

  return groups
})

function handleScroll() {
  if (!containerRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  isNearBottom.value = scrollHeight - scrollTop - clientHeight < 100
  
  // Load more when near top
  if (scrollTop < 50 && props.hasMore && !props.loading) {
    props.$emit('load-more')
  }
}

function scrollToBottom() {
  if (!containerRef.value || !isNearBottom.value) return
  
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

// Auto-scroll on new messages
watch(() => props.messages.length, () => {
  scrollToBottom()
})

defineExpose({ scrollToBottom })
</script>

<style scoped>
.animation-delay-200 {
  animation-delay: 0.2s;
}
.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>