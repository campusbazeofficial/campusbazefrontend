<template>
<ConfirmModal
  title="Start Errand"
  :message="`Are you ready to begin working on '${errand?.title}'? Once started, the poster will be notified.`"
  confirm-text="Start errand"
  variant="success"
  :loading="loading"
  @confirm="handleConfirm"
  @cancel="$emit('close')"
>
  <!-- Escrow notice slot -->
  <!-- <template #extra>
    <div class="mt-3 flex items-start gap-2.5 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle p-3">
      <i class="fa-solid fa-shield-halved mt-0.5 shrink-0 text-sm text-cb-accent"></i>
      <p class="text-xs text-cb-accent">
        The poster must have confirmed their escrow payment before you can start. If you're seeing an error, please ask the poster to complete their payment first.
      </p>
    </div>
  </template> -->
</ConfirmModal>
</template>

<script setup>
import ConfirmModal from '@/components/reusables/ConfirmModal.vue'

defineProps({
  errand: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'close'])

function handleConfirm() {
  emit('confirm')
}
</script>