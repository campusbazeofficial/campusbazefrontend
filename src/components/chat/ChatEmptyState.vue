<!-- src/components/chat/ChatEmptyState.vue -->
<template>
  <div class="flex h-full flex-col items-center justify-center p-8">
    <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-cb-accent-subtle">
      <i class="fa-regular fa-message text-4xl text-cb-accent"></i>
    </div>
    
    <h2 class="mb-2 text-lg font-bold text-cb-text">Your Messages</h2>
    <p class="mb-6 max-w-sm text-center text-sm text-cb-muted">
      Select a conversation from the list or start a new chat from an errand or service listing.
    </p>
    
    <button
      @click="$emit('navigate')"
      class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md"
    >
      <i class="fa-solid fa-box"></i>
      Browse Errands
    </button>
  </div>
</template>

<script setup>
defineEmits(['navigate'])
</script>