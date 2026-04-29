<!-- src/components/services/ServiceCard.vue -->
<template>
  <article
    :class="[
      'group relative cursor-pointer rounded-2xl border border-cb-divider bg-cb-card transition-all duration-200',
      'hover:-translate-y-0.5 hover:border-cb-accent/30 hover:shadow-lg hover:shadow-black/10',
      viewMode === 'list'
        ? 'flex flex-col gap-0 p-4 sm:flex-row sm:items-stretch sm:gap-4 sm:p-5'
        : 'flex flex-col p-4 sm:p-5',
    ]"
    @click="$emit('click')"
  >
    <!-- ─── Content ──────────────────────────────────────────────────────── -->
    <div class="flex min-w-0 flex-1 flex-col">

      <!-- Top row: category pill  |  badges (rating · orders · status) -->
      <!-- Keeping status badge inline here prevents it from floating over text -->
      <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">

        <!-- Category -->
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-[10px] font-semibold text-cb-accent"
        >
          <i :class="[categoryIcon, 'text-[9px]']"></i>
          {{ categoryLabel }}
        </span>

        <!-- Right-side cluster: rating · orders · status badge -->
        <div class="flex items-center gap-1.5">
          <!-- Rating -->
          <span
            v-if="rating > 0"
            class="inline-flex items-center gap-1 rounded-full bg-cb-warning-subtle px-2 py-0.5 text-[10px] font-semibold text-cb-warning"
          >
            <i class="fa-solid fa-star text-[9px]"></i>
            {{ rating.toFixed(1) }}
          </span>

          <!-- Orders -->
          <span
            class="inline-flex items-center gap-1 rounded-full bg-cb-field px-2 py-0.5 text-[10px] text-cb-muted"
          >
            <i class="fa-solid fa-shopping-cart text-[9px]"></i>
            {{ service.totalOrders ?? 0 }}
          </span>

          <!-- Status badges — inline, no absolute positioning -->
          <!-- Own service -->
          <span
            v-if="isOwnService"
            class="inline-flex items-center gap-1 rounded-full bg-cb-accent/10 px-2 py-0.5 text-[9px] font-semibold text-cb-accent"
          >
            <i class="fa-solid fa-user text-[8px]"></i> Yours
          </span>

          <!-- Active order statuses (buyers only) -->
          <template v-else-if="activeOrder">
            <span
              v-if="activeOrder.status === 'pending_payment'"
              class="inline-flex items-center gap-1 rounded-full bg-cb-warning-subtle px-2 py-0.5 text-[9px] font-semibold text-cb-warning"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cb-warning"></span>
              Pay Pending
            </span>
            <span
              v-else-if="['in_progress', 'revision'].includes(activeOrder.status)"
              class="inline-flex items-center gap-1 rounded-full bg-cb-accent-subtle px-2 py-0.5 text-[9px] font-semibold text-cb-accent"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cb-accent"></span>
              In Progress
            </span>
            <span
              v-else-if="activeOrder.status === 'delivered'"
              class="inline-flex items-center gap-1 rounded-full bg-cb-accent-subtle px-2 py-0.5 text-[9px] font-semibold text-cb-accent"
            >
              <i class="fa-solid fa-truck-fast text-[8px]"></i> Delivered
            </span>
          </template>

          <!-- Deactivated -->
          <span
            v-else-if="service.status === 'deactivated'"
            class="inline-flex items-center gap-1 rounded-full bg-cb-muted/10 px-2 py-0.5 text-[9px] font-semibold text-cb-muted"
          >
            <i class="fa-solid fa-ban text-[8px]"></i> Deactivated
          </span>
        </div>
      </div>

      <!-- Title -->
      <h3
        :class="[
          'mt-2.5 font-semibold capitalize leading-snug text-cb-text transition-colors group-hover:text-cb-accent text-sm',
          viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2',
        ]"
      >
        {{ service.title }}
      </h3>

      <!-- Description -->
      <p
        :class="[
          'mt-1 text-xs leading-relaxed text-cb-muted',
          viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2',
        ]"
      >
        {{ description }}
      </p>

      <!-- Seller row -->
      <div class="mt-3 flex items-center gap-2">
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast"
        >
          <img
            v-if="sellerAvatar"
            :src="sellerAvatar"
            class="h-full w-full object-cover"
            :alt="sellerName"
          />
          <span v-else>{{ sellerInitials }}</span>
        </div>
        <span class="min-w-0 truncate text-xs text-cb-muted">{{ sellerName }}</span>
        <span
          v-if="sellerBadge"
          class="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-cb-accent"
        >
          <i class="fa-solid fa-circle-check text-[9px]"></i>
        </span>
      </div>

      <!-- Tags — visible in grid mode always; hidden on xs in list mode -->
      <div
        v-if="service.tags?.length"
        :class="[
          'mt-2.5 flex flex-wrap gap-1',
          viewMode === 'list' ? 'hidden sm:flex' : '',
        ]"
      >
        <span
          v-for="tag in service.tags.slice(0, 3)"
          :key="tag"
          class="rounded-full border border-cb-divider bg-cb-field px-2 py-0.5 text-[10px] text-cb-muted"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- ─── Price + CTA ──────────────────────────────────────────────────── -->
    <!--
      Grid mode  : horizontal strip pinned to the bottom of the card
      List mode  : on xs stacks below content; on sm+ becomes a right-side column
                   with a fixed width so it never squishes the main content
    -->
    <div
      :class="[
        'shrink-0',
        viewMode === 'list'
          ? [
              'mt-3 flex items-center justify-between gap-3',
              'border-t border-cb-divider pt-3',
              'sm:mt-0 sm:w-40 sm:flex-col sm:items-end sm:justify-center',
              'sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0',
            ]
          : 'mt-4 flex items-center justify-between gap-3 border-t border-cb-divider pt-3.5',
      ]"
    >
      <!-- Price + delivery -->
      <div :class="viewMode === 'list' ? 'sm:text-right' : ''">
        <p class="text-sm font-bold text-cb-text">
          From ₦{{ startingPrice?.toLocaleString() ?? '—' }}
        </p>
        <span class="mt-0.5 inline-flex items-center gap-1 text-[10px] text-cb-muted">
          <i class="fa-regular fa-clock text-[9px]"></i>
          {{ deliveryTime }}
        </span>
      </div>

      <!-- CTA button — flex-shrink-0 prevents it from being squished on narrow cards -->
      <button
        @click.stop="$emit('view', service)"
        :disabled="isOwnService || service.status === 'deactivated'"
        :class="[
          'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
          ctaClass,
        ]"
      >
        <i :class="ctaIcon" class="text-[10px]"></i>
        {{ ctaLabel }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from 'vue-router'
import { getCategoryIcon, getCategoryLabel } from "@/utils/serviceCategories";


const router = useRouter()
const props = defineProps({
  service: { type: Object, required: true },
  viewMode: { type: String, default: "grid" },
  isOwnService: { type: Boolean, default: false },
  // Active buying order the current user has with this service's seller
  activeOrder: { type: Object, default: null },
});

defineEmits(["click", "view"]);

// ── CTA button appearance based on order state ────────────────
const ctaClass = computed(() => {
  if (isDisabled.value)           return 'cursor-default bg-cb-field text-cb-muted'
  if (!props.activeOrder)         return 'bg-cb-accent text-cb-contrast hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/25 active:scale-[0.97]'

  const s = props.activeOrder.status
  if (s === 'pending_payment')    return 'bg-cb-warning text-white hover:bg-cb-warning/90 hover:shadow-md hover:shadow-cb-warning/25 active:scale-[0.97]'
  if (s === 'delivered')          return 'bg-cb-accent text-cb-contrast hover:bg-cb-accent-dark hover:shadow-md active:scale-[0.97]'
  // in_progress / revision
  return 'bg-cb-field text-cb-muted cursor-pointer hover:bg-cb-field'
})

const ctaIcon = computed(() => {
  if (props.isOwnService)                                        return 'fa-solid fa-user'
  if (props.service.status === 'deactivated')                   return 'fa-solid fa-ban'
  if (!props.activeOrder)                                       return 'fa-solid fa-bag-shopping'

  const s = props.activeOrder.status
  if (s === 'pending_payment')   return 'fa-solid fa-credit-card'
  if (s === 'delivered')         return 'fa-solid fa-check'
  return 'fa-solid fa-hourglass-half'
})

const ctaLabel = computed(() => {
  if (props.isOwnService)                                        return 'Yours'
  if (props.service.status === 'deactivated')                   return 'Unavailable'
  if (!props.activeOrder)                                       return 'View'

  const s = props.activeOrder.status
  if (s === 'pending_payment')   return 'Pay Now'
  if (s === 'in_progress')       return 'In Progress'
  if (s === 'revision')          return 'Revision'
  if (s === 'delivered')         return 'Review'
  return 'View'
})

const isDisabled = computed(() =>
  props.isOwnService || props.service.status === 'deactivated',
)

const categoryIcon = computed(
  () => getCategoryIcon(props.service.category) || "fa-solid fa-tag",
);

const categoryLabel = computed(() => {
  const label = getCategoryLabel(props.service.category) || "other";
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
});
const rating = computed(() => {
  return props.service.averageRating ?? seller.value?.averageRating ?? 0;
});
const seller = computed(() => {
  if (props.service.seller) return props.service.seller;
  if (typeof props.service.sellerId === "object") return props.service.sellerId;
  return null;
});
const description = computed(() => {
  return (
    props.service.description ||
    props.service.tiers?.[0]?.description ||
    ""
  );
});
const sellerName = computed(() => {
  if (seller.value) {
    return (
      seller.value.displayName ||
      `${seller.value.firstName || ""} ${seller.value.lastName || ""}`.trim() ||
      "Seller"
    );
  }
  return "Seller";
});

const sellerInitials = computed(() => {
  if (seller.value) {
    const f = seller.value.firstName?.[0] || "";
    const l = seller.value.lastName?.[0] || "";
    return (f + l).toUpperCase() || "S";
  }
  return "S";
});

const sellerAvatar = computed(() => seller.value?.avatar || null);
const sellerBadge = computed(
  () => seller.value?.identityVerificationBadge || false,
);

const startingPrice = computed(() => {
  const tiers = props.service.tiers || [];
  if (!tiers.length) return null;
  return Math.min(...tiers.map((t) => t.price));
});

const deliveryTime = computed(() => {
  const tiers = props.service.tiers || [];
  if (!tiers.length) return "Varies";
  const days = tiers.map((t) => t.deliveryDays);
  const min = Math.min(...days);
  const max = Math.max(...days);
  return min === max ? `${min} day${min > 1 ? "s" : ""}` : `${min}–${max} days`;
});

function goToProviderProfile() {
  const s = props.service?.sellerId;
  const slug = typeof s === 'object' ? s?.slug : null;
  if (!slug) return;
 router.push({ name: 'ServiceProviderProfile', params: { identifier: slug } });
}
</script>