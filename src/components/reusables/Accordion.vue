<template>
  <div class="space-y-4 md:space-y-6">
    <div
      v-for="(item, index) in items"
      :key="getItemKey(item, index)"
      class="rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out flex gap-4 md:gap-8 px-4 py-8 md:px-6 border-[1.5px]"
      :class="[
        {
          'bg-color-card border-color-divider': openAccordionId !== getItemKey(item, index),
          'bg-color-card border-color-accent': openAccordionId === getItemKey(item, index),
        },
      ]"
    >
      <div v-if="$slots.left" class="flex items-start min-h-full w-12 md:w-24">
        <slot name="left" :item="item" :index="index" />
      </div>

      <div class="flex-1 overflow-hidden">
        <div class="flex flex-col h-full gap-2 md:gap-4">
          <div
            class="flex items-start justify-between cursor-pointer"
            @click="toggleAccordion(item, index)"
          >
            <slot
              name="header"
              :item="item"
              :index="index"
              :isOpen="openAccordionId === getItemKey(item, index)"
            />
          </div>

          <div
            v-if="
              $slots.subheader &&
              (!isMobileMode || openAccordionId === getItemKey(item, index))
            "
            class="flex flex-wrap gap-2 md:gap-3 w-full max-w-2xl"
          >
            <slot
              name="subheader"
              :item="item"
              :index="index"
              :isOpen="openAccordionId === getItemKey(item, index)"
            />
          </div>

          <Transition
            name="accordion-content-transition"
            @enter="onEnter"
            @leave="onLeave"
          >
            <div v-show="openAccordionId === getItemKey(item, index)">
              <slot name="content" :item="item" :index="index" />
            </div>
          </Transition>
        </div>
      </div>

      <div class="flex items-start min-h-full w-12 md:w-24 justify-end">
        <button
          class="accordion-btn"
          @click="toggleAccordion(item, index)"
          :aria-expanded="openAccordionId === getItemKey(item, index)"
        >
          <slot
            name="icon"
            :isOpen="openAccordionId === getItemKey(item, index)"
          >
            <i
              :class="
                openAccordionId === getItemKey(item, index)
                  ? 'fa-solid fa-minus'
                  : 'fa-solid fa-plus'
              "
              class="text-xs md:text-sm"
            ></i>
          </slot>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  getItemKey: {
    type: Function,
    default: (item, index) => item?.id ?? index,
  },
  // Added for controlling subheader visibility in a generic accordion
  isMobileMode: {
    type: Boolean,
    default: false,
  },
});

const openAccordionId = ref(null);

const toggleAccordion = (item, index) => {
  const key = props.getItemKey(item, index);
  openAccordionId.value = openAccordionId.value === key ? null : key;
};

// --- JavaScript Hooks for Height Transition ---
const onEnter = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  el.offsetHeight;
  el.style.height = `${height}px`;
  el.style.overflow = "hidden";
};

const onLeave = (el) => {
  el.style.height = `${el.scrollHeight}px`;
  el.offsetHeight;
  el.style.height = "0px";
  el.style.overflow = "hidden";
};
</script>

<style scoped>
.bg-color-card {
  background-color: var(--color-card);
}

.border-color-divider {
  border-color: var(--color-divider);
}

.border-color-accent {
  border-color: var(--color-accent);
}

.accordion-btn {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
  border-radius: 50%;
  background-color: var(--color-background);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 768px) {
  .accordion-btn {
    width: 2rem;
    height: 2rem;
  }
}

.accordion-btn:hover {
  background-color: var(--color-accent-10);
  box-shadow: 0 0 0 3px var(--color-accent-10);
}

.accordion-btn:active {
  transform: scale(0.95);
}

/* Main container transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Accordion Content Height Transition */
.accordion-content-transition-enter-active,
.accordion-content-transition-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-content-transition-enter-from,
.accordion-content-transition-leave-to {
  height: 0;
}
</style>