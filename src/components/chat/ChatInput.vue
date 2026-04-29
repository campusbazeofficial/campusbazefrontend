<!-- src/components/chat/ChatInput.vue -->
<template>
  <div class="shrink-0 border-t border-cb-divider bg-cb-base p-4">
    <!-- Reply preview -->
    <div
      v-if="replyTo"
      class="mb-3 flex items-center justify-between rounded-lg bg-cb-field px-3 py-2"
    >
      <div class="flex items-center gap-2 min-w-0">
        <i class="fa-solid fa-reply text-xs text-cb-muted shrink-0"></i>
        <span class="text-xs text-cb-muted shrink-0">Replying to:</span>
        <span class="truncate text-xs font-medium text-cb-text">
          {{ getReplyPreview(replyTo) }}
        </span>
      </div>
      <button
        @click="$emit('cancel-reply')"
        class="shrink-0 ml-2 text-cb-muted-40 hover:text-cb-negative"
      >
        <i class="fa-solid fa-times text-xs"></i>
      </button>
    </div>

    <!-- Input area -->
    <div class="flex items-end gap-2">
      <div class="flex-1">
        <textarea
          v-model="localValue"
          @keydown.enter.exact.prevent="handleSend"
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="Type a message..."
          rows="1"
          :disabled="disabled"
          ref="textareaRef"
          class="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none disabled:opacity-50"
        ></textarea>
      </div>

      <button
        @click="handleSend"
        :disabled="!canSend || disabled"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-40"
      >
        <i
          :class="[
            'text-sm',
            sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'
          ]"
        ></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  replyTo: { type: Object, default: null },
  sending: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'send', 'cancel-reply'])

const localValue = ref(props.modelValue)
const textareaRef = ref(null)

const canSend = computed(() => {
  return localValue.value.trim().length > 0 && !props.sending
})

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

function handleSend() {
  if (!canSend.value) return
  emit('send')
}

function getReplyPreview(replyTo) {
  if (!replyTo) return ''
  const content = replyTo.content || ''
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}

function focus() {
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

defineExpose({ focus })
</script>