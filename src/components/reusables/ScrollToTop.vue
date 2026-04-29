<template>
  <button
    v-show="isVisible"
    @click="scrollToTop"
    class="scroll-to-top"
    aria-label="Scroll to top"
  >
    <i class="fa-solid fa-chevron-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);

const checkScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
  // Initial check in case page loads with scroll position
  checkScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  box-shadow: 0 10px 15px -3px var(--color-accent-40);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-to-top:hover {
  background-color: var(--color-cb-accent-muted);
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px var(--color-cb-accent-40);
}

.scroll-to-top:active {
  transform: translateY(0);
  box-shadow: 0 10px 15px -3px var(--color-cb-accent-40);
}

@media (max-width: 640px) {
  .scroll-to-top {
    width: 2rem;
    height: 2rem;
    bottom: 1rem;
    right: 1rem;
    font-size: 1rem;
  }
}
</style>