<!-- src/components/chat/ChatBubble.vue -->
<template>
  <div :class="['flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row']">
    <!-- Avatar (only for other user) -->
    <div v-if="!isOwn" class="shrink-0">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-cb-accent-subtle text-xs font-bold text-cb-accent overflow-hidden">
        <img
          v-if="otherParty?.avatar"
          :src="otherParty.avatar"
          class="h-full w-full object-cover"
          alt=""
        />
        <span v-else>{{ otherPartyInitials }}</span>
      </div>
    </div>

    <!-- Message Content -->
    <div :class="['max-w-[70%]', isOwn ? 'items-end' : 'items-start']">
      <!-- Reply preview -->
      <div
        v-if="message.replyTo"
        class="mb-1 flex items-center gap-1.5 rounded-lg bg-cb-field/50 px-3 py-1.5 text-xs"
      >
        <i class="fa-solid fa-reply text-[9px] text-cb-muted-40"></i>
        <span class="truncate text-cb-muted">
          {{ getReplyPreview(message.replyTo) }}
        </span>
      </div>

      <!-- Message bubble -->
      <div
        :class="[
          'relative rounded-2xl px-4 py-2.5',
          isOwn
            ? 'bg-cb-accent text-cb-contrast rounded-br-md'
            : 'bg-cb-card text-cb-text rounded-bl-md border border-cb-divider'
        ]"
      >
        <p class="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {{ message.content }}
        </p>

        <!-- Meta info -->
        <div
          :class="[
            'mt-1 flex items-center justify-end gap-1 text-[10px]',
            isOwn ? 'text-cb-contrast/70' : 'text-cb-muted-40'
          ]"
        >
          <span>{{ formatMessageTime(message.createdAt) }}</span>
          
          <!-- Delivery status (own messages only) -->
          <span v-if="isOwn && message.deliveryStatus">
            <i
              v-if="message.deliveryStatus === 'sending'"
              class="fa-regular fa-clock"
            ></i>
            <i
              v-else-if="message.deliveryStatus === 'sent'"
              class="fa-solid fa-check"
            ></i>
            <i
              v-else-if="message.deliveryStatus === 'delivered'"
              class="fa-solid fa-check-double"
            ></i>
            <i
              v-else-if="message.deliveryStatus === 'read'"
              class="fa-solid fa-check-double text-cb-warning"
            ></i>
          </span>
        </div>
      </div>

      <!-- Reply button -->
      <button
        @click="$emit('reply', message)"
        class="mt-1 text-[10px] text-cb-muted-40 opacity-0 transition-opacity hover:text-cb-accent group-hover:opacity-100"
      >
        <i class="fa-solid fa-reply mr-1"></i>
        Reply
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  isOwn: { type: Boolean, default: false },
  otherParty: { type: Object, default: null }
})

defineEmits(['reply'])

const otherPartyInitials = computed(() => {
  if (!props.otherParty) return '?'
  const first = props.otherParty.firstName?.[0] || ''
  const last = props.otherParty.lastName?.[0] || ''
  return (first + last).toUpperCase() || '?'
})

function getReplyPreview(replyTo) {
  if (!replyTo) return 'Original message unavailable'
  const content = replyTo.content || ''
  return content.length > 40 ? content.slice(0, 40) + '...' : content
}

function formatMessageTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>