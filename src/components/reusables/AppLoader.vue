<template>
  <div
    class="flex flex-col items-center justify-center gap-6"
    :class="wrapClass"
  >
    <div class="loader-wrap">
      <div class="wave">
        <span
          v-for="i in 5"
          :key="i"
          class="wave-bar"
          :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
        />
      </div>
    </div>
    <p v-if="label" class="loader-label">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: "" },
  wrapClass: { type: String, default: "py-16" },
});
</script>

<style scoped>
.loader-wrap {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-label {
  font-size: 15px;
  color: var(--color-accent);
  font-family: "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0.02em;
  opacity: 0.85;
  margin: 0;
  transition: color 0.3s ease;
}

/* ── Wave container ─────────────────────────────────────────── */
.wave {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Each bar starts as a dot and grows into a tall bar ──────── */
.wave-bar {
  display: block;
  width: 16px;
  background: var(--color-accent);
  border-radius: 999px;
  animation: waveMorph 1.1s ease-in-out infinite;
  transition: background 0.3s ease;
}

@keyframes waveMorph {
  0% {
    height: 16px;
    opacity: 0.5;
    transform: translateY(0);
  }
  40% {
    height: 60px;
    opacity: 1;
    transform: translateY(-10px);
  }
  70% {
    height: 60px;
    opacity: 1;
    transform: translateY(-10px);
  }
  100% {
    height: 16px;
    opacity: 0.5;
    transform: translateY(0);
  }
}
</style>