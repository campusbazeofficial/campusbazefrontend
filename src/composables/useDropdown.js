// src/composables/useDropdown.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useDropdown() {
  const isOpen = ref(false)
  const dropdownRef = ref(null)

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      isOpen.value = false
    }
  }

  const handleEscape = (event) => {
    if (event.key === 'Escape' && isOpen.value) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  })

  return {
    isOpen,
    ref: dropdownRef,
    toggle,
    open,
    close
  }
}