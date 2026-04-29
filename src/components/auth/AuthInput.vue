<!-- Reusable underline input for auth forms -->
<template>
  <div class="input-wrap">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-row">
      <input
        :type="inputType"
        :placeholder="placeholder"
        :value="modelValue"
        :autocomplete="autocomplete"
        class="auth-input"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="input-suffix"
        @click="showPassword = !showPassword"
        tabindex="-1"
      >
        <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
      </button>
      <!-- Icon slot -->
      <span v-else-if="icon" class="input-suffix">
        <i :class="icon"></i>
      </span>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  icon: String,
  error: String,
  autocomplete: String,
})
defineEmits(['update:modelValue'])

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type
})
</script>

<style scoped>
.input-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-cb-accent-dark);
  letter-spacing: 0.02em;
}

.input-row {
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid var(--color-cb-divider);
  transition: border-color 0.2s ease;
}

.input-row:focus-within {
  border-bottom-color: var(--color-cb-accent);
}

.auth-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.65rem 0;
  font-size: 0.9rem;
  color: var(--color-cb-text);
  font-family: var(--font-sans);
}

/* Override browser autofill background — the box-shadow trick paints over it */
.auth-input:-webkit-autofill,
.auth-input:-webkit-autofill:hover,
.auth-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--color-cb-card) inset !important;
  -webkit-text-fill-color: var(--color-cb-text) !important;
  caret-color: var(--color-cb-text);
  transition: background-color 9999s ease-in-out 0s;
}

.auth-input::placeholder {
  color: var(--color-cb-muted);
}

.input-suffix {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-cb-muted);
  padding: 0 2px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.input-error {
  font-size: 0.75rem;
  color: var(--color-cb-negative);
  margin: 0;
}
</style>