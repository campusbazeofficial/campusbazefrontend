<template>
  <section class="bg-cb-card rounded-lg px-4 py-6  lg:px-8">
    <div class="mx-auto max-w-7xl ">
      <div
        class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="min-w-0 flex-1">
          <!-- Live badge -->
          <div
            class="mb-3 inline-flex items-center gap-2 rounded-full border border-cb-accent-muted bg-cb-accent-subtle px-3 py-1 text-xs font-semibold text-cb-accent"
          >
            <span
              class="h-1.5 w-1.5 animate-pulse rounded-full bg-cb-accent"
            ></span>
            Live marketplace
          </div>

          <div class="flex items-start gap-3">
            <!-- <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent">
              <i class="fa-solid fa-store text-base text-cb-contrast"></i>
            </div> -->
            <div class="min-w-0">
              <h1
                class="text-xl font-bold tracking-tight text-cb-text sm:text-2xl lg:text-3xl"
              >
                Errand Market
              </h1>
              <p
                class="mt-2 max-w-xl  leading-6  text-sm text-cb-muted"
              >
                Find errands near you, place competitive bids, and start
                earning. Every errand is escrow-protected for a safe, trusted
                experience.
              </p>
            </div>
          </div>

          <!-- Stats chips -->
          <div class="mt-5 flex flex-wrap gap-2 sm:gap-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-cb-accent-muted bg-cb-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-cb-accent"
            >
              <i class="fa-solid fa-chart-line text-[10px]"></i>
              <span>{{ totalCount }} open</span>
            </span>
            <span
              v-if="avgBudget"
              class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-base px-2.5 py-1 text-[11px] font-semibold text-cb-muted"
            >
              <i class="fa-solid fa-tag text-[10px]"></i>
              <span>₦{{ avgBudget.toLocaleString() }} avg</span>
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-base px-2.5 py-1 text-[11px] font-semibold text-cb-muted"
            >
              <i class="fa-solid fa-shield-halved text-[10px]"></i>
              <span>Escrow protected</span>
            </span>
            <span
              v-if="urgentCount > 0"
              class="inline-flex items-center gap-1.5 rounded-full border border-cb-warning/40 bg-cb-warning-subtle px-2.5 py-1 text-[11px] font-semibold text-cb-warning"
            >
              <i class="fa-solid fa-bolt text-[10px]"></i>
              <span>{{ urgentCount }} urgent</span>
            </span>
          </div>
        </div>

        <!-- CTAs -->
        <div class="flex shrink-0 items-start sm:items-center gap-2">
          <router-link
            :to="{ name: 'MyErrands' }"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-cb-divider bg-cb-base px-4 py-3 text-sm font-semibold text-cb-text transition-all hover:bg-cb-field"
          >
            <i class="fa-solid fa-list-check text-xs"></i>
            <span class="">My errands</span>
          </router-link>
          <router-link
            :to="{ name: 'PostErrand' }"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-cb-accent px-5 py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md sm:hover:shadow-lg sm:hover:shadow-cb-accent/30"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Post errand</span>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  totalCount: { type: Number, default: 0 },
  avgBudget: { type: Number, default: null },
  urgentCount: { type: Number, default: 0 },
});
</script>
