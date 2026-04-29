<template>
  <label class="checkbox-wrap">
    <input
      type="checkbox"
      class="checkbox-input"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="checkbox-box">
      <svg class="check-icon" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5L4.5 8.5L11 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <!-- Slot label (for rich content like links) or plain label prop -->
    <span class="checkbox-label">
      <slot name="label">{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({ modelValue: Boolean, label: String })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.checkbox-wrap {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--color-cb-divider);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.checkbox-input:checked + .checkbox-box {
  background-color: var(--color-cb-accent);
  border-color: var(--color-cb-accent);
  transform: scale(1.08);
}

.checkbox-wrap:hover .checkbox-box {
  border-color: var(--color-cb-accent);
}

.check-icon {
  width: 10px;
  height: 10px;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.checkbox-input:checked + .checkbox-box .check-icon {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label {
  font-size: 0.82rem;
  color: var(--color-cb-muted);
  line-height: 1.5;
}
</style>