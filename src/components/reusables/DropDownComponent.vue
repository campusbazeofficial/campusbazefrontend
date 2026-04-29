<template>
  <div class="relative inline-block" ref="rootRef">
    <!-- Trigger button -->
    <button
      type="button"
      ref="triggerRef"
      class="inline-flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 border-1.5 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all duration-200 outline-none select-none hover:border-cb-accent hover:text-cb-accent hover:bg-cb-accent-subtle focus-visible:outline-2 focus-visible:outline-cb-accent focus-visible:outline-offset-2"
      :class="[
        bgClass,
        textClass,
        borderClass,
        { '!border-cb-accent !text-cb-accent !bg-cb-accent-subtle': isOpen }
      ]"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click.stop="toggle"
      @keydown.escape.prevent="close"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      @keydown.down.prevent="openAndFocusFirst"
    >
      <span class="flex-1 text-left">{{ label }}</span>
      <i
        class="fa-solid fa-chevron-down text-[0.65rem] flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      ></i>
    </button>

    <!-- Teleport to body -->
    <Teleport to="body">
      <Transition name="dd-fade">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="fixed z-[9999] bg-cb-card border border-cb-divider rounded-xl shadow-2xl overflow-hidden outline-none"
          :style="menuStyle"
          role="menu"
          @keydown.escape.prevent="close"
          @keydown.tab="close"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  closeOnScroll: { type: Boolean, default: true },
  closeOnClickOutside: { type: Boolean, default: true },
  minWidth: { type: Number, default: 200 },

  // 🎨 NEW STYLE PROPS
  bgClass: { type: String, default: 'bg-cb-base' },
  textClass: { type: String, default: 'text-cb-muted' },
  borderClass: { type: String, default: 'border-cb-divider' },
})

const emit = defineEmits(['open', 'close'])

const isOpen = ref(false)
const rootRef = ref(null)
const triggerRef = ref(null)
const menuRef = ref(null)

const menuStyle = reactive({
  top: '0px',
  left: '0px',
  minWidth: '0px',
  maxHeight: '320px'
})

function reposition() {
  if (!triggerRef.value || !menuRef.value) return

  const tRect = triggerRef.value.getBoundingClientRect()
  const mHeight = Math.min(menuRef.value.offsetHeight || 300, 320)
  const mWidth = Math.max(menuRef.value.offsetWidth || 0, props.minWidth, tRect.width)
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 6

  let top = tRect.bottom + gap
  if (top + mHeight > vh - 8) {
    top = tRect.top - mHeight - gap
  }
  top = Math.max(8, top)

  let left = tRect.right - mWidth
  if (left < 8) left = tRect.left
  if (left + mWidth > vw - 8) left = vw - mWidth - 8

  menuStyle.top = `${top}px`
  menuStyle.left = `${left}px`
  menuStyle.minWidth = `${mWidth}px`
  menuStyle.maxHeight = '320px'
}

async function open() {
  if (isOpen.value) return
  isOpen.value = true
  emit('open')

  await nextTick()
  reposition()

  const first = menuRef.value?.querySelector('button:not([disabled]), a:not([disabled])')
  first?.focus()
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
  triggerRef.value?.focus()
}

function toggle() {
  isOpen.value ? close() : open()
}

function openAndFocusFirst() {
  open()
}

function onDocClick(e) {
  if (!props.closeOnClickOutside) return
  const inRoot = rootRef.value?.contains(e.target)
  const inMenu = menuRef.value?.contains(e.target)
  if (!inRoot && !inMenu) close()
}

function onScroll() {
  if (!isOpen.value) return
  if (props.closeOnScroll) close()
  else reposition()
}

function onResize() {
  if (isOpen.value) reposition()
}

onMounted(() => {
  document.addEventListener('click', onDocClick, true)
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick, true)
  window.removeEventListener('scroll', onScroll, { capture: true })
  window.removeEventListener('resize', onResize)
})

defineExpose({ open, close, toggle, isOpen })
</script>

<style>
.dd-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dd-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dd-fade-enter-from,
.dd-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>