<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div
        v-if="visible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium min-w-60 max-w-[90vw]"
        :class="toastClass"
        role="alert"
      >
        <!-- Icon -->
        <i class="shrink-0 text-base" :class="iconClass" />

        <!-- Message -->
        <span class="flex-1 leading-snug">{{ message }}</span>

        <!-- Close -->
        <button
          @click="hide"
          class="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-current/10 hover:bg-current/20"
        >
          <i class="fa-solid fa-xmark text-xs" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";

const visible = ref(false);
const message = ref("");
const type = ref("info"); // "success" | "error" | "info" | "warning"

let _timer = null;

const toastClass = computed(() => ({
  "bg-blue-600 text-white": type.value === "info",
  "bg-green-600 text-white": type.value === "success",
  "bg-red-600 text-white": type.value === "error",
  "bg-amber-500 text-white": type.value === "warning",
}));

const iconClass = computed(() => ({
  "fa-solid fa-circle-info": type.value === "info",
  "fa-solid fa-circle-check": type.value === "success",
  "fa-solid fa-circle-xmark": type.value === "error",
  "fa-solid fa-triangle-exclamation": type.value === "warning",
}));

function show(msg, toastType = "info", duration = 4000) {
  message.value = msg;
  type.value = toastType;
  visible.value = true;
  clearTimeout(_timer);
  _timer = setTimeout(hide, duration);
}

function hide() {
  visible.value = false;
  clearTimeout(_timer);
}

defineExpose({ show, hide });
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>