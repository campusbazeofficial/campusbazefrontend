<template>
  <article
    class="group cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cb-accent/30 hover:shadow-lg hover:shadow-black/10"
    @click="$emit('click', listing._id)"
  >
    <div class="flex flex-col gap-4">
      <!-- Top row -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle">
            <i :class="[categoryIcon, 'text-base text-cb-accent']"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="line-clamp-1 text-sm font-semibold capitalize leading-snug text-cb-text group-hover:text-cb-accent">
              {{ listing.title }}
            </h3>
            <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-cb-muted">
              {{ listing.description }}
            </p>
          </div>
        </div>
        <span :class="['shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass]">
          {{ statusLabel }}
        </span>
      </div>

      <!-- Meta pills -->
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-solid fa-tag text-[9px]"></i>
          {{ categoryLabel }}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-solid fa-layer-group text-[9px]"></i>
          {{ tierCount }} tier{{ tierCount !== 1 ? 's' : '' }}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-regular fa-star text-[9px]"></i>
          {{ listing.averageRating?.toFixed(1) || '0.0' }} ({{ listing.totalReviews || 0 }})
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-solid fa-shopping-cart text-[9px]"></i>
          {{ listing.totalOrders || 0 }} orders
        </span>
      </div>

      <!-- Seller Info -->
      <div
        class="flex items-center gap-2.5 cursor-pointer"
        @click.stop="$emit('view-seller', sellerSlug)"
      >
        <img
          :src="sellerAvatar"
          alt="Seller avatar"
          class="h-8 w-8 shrink-0 rounded-full object-cover border border-cb-divider"
        />
        <div class="flex min-w-0 flex-1 items-center gap-1.5 flex-wrap">
          <span class="text-xs font-medium text-cb-text">{{ sellerName }}</span>
          <i v-if="isVerified" class="fa-solid fa-badge-check text-[10px] text-cb-accent" title="Verified"></i>
          <span v-if="sellerTier" class="rounded bg-cb-accent-subtle px-1.5 py-0.5 text-[9px] font-semibold text-cb-accent">
            {{ sellerTier }}
          </span>
          <span class="flex items-center gap-1 text-[10px] text-cb-muted">
            <i class="fa-solid fa-star text-[9px]"></i>
            {{ sellerRating }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between gap-3 border-t border-cb-divider pt-3" @click.stop>
        <!-- Price + delivery -->
        <div class="flex flex-col gap-0.5">
          <span class="text-sm font-bold text-cb-text">From ₦{{ startingPrice?.toLocaleString() ?? 0 }}</span>
          <span class="inline-flex items-center gap-1 text-[11px] text-cb-muted">
            <i class="fa-regular fa-clock text-[9px]"></i>
            {{ deliveryTime }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="flex h-8 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
            @click="$emit('edit', listing._id)"
          >
            <i class="fa-solid fa-pen text-[10px]"></i>
            Edit
          </button>

          <button
            v-if="listing.status === 'draft'"
            :disabled="actionLoading"
            class="flex h-8 items-center gap-1.5 rounded-lg bg-cb-accent px-3 text-xs font-semibold text-cb-contrast disabled:opacity-60"
            @click="$emit('status-change', 'active')"
          >
            <i class="fa-solid fa-play text-[9px]"></i>
            Publish
          </button>

          <CustomDropdown v-if="listing.status !== 'draft'" :label="statusLabel" :minWidth="140">
            <div class="flex flex-col py-1">
              <button
                class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-cb-text hover:bg-cb-accent-subtle hover:text-cb-accent transition-colors"
                @click="$emit('status-change', 'active')"
              >
                <i class="fa-solid fa-circle text-[8px] text-green-500"></i>
                Active
              </button>
              <button
                class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-cb-text hover:bg-cb-warning-subtle hover:text-cb-warning transition-colors"
                @click="$emit('status-change', 'paused')"
              >
                <i class="fa-solid fa-circle text-[8px] text-yellow-500"></i>
                Paused
              </button>
            </div>
          </CustomDropdown>

          <template v-if="canDelete">
            <button
              :disabled="actionLoading"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-cb-negative/20 bg-cb-negative-subtle text-cb-negative disabled:opacity-60"
              @click="$emit('delete', listing._id)"
              title="Delete service"
            >
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </template>
          <template v-else>
            <div
              class="group/hint relative flex h-8 w-8 items-center justify-center rounded-lg border border-cb-divider bg-cb-field text-cb-muted-40 cursor-not-allowed"
              :title="deleteBlockedReason"
            >
              <i class="fa-solid fa-trash text-xs"></i>
              <div class="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden w-max max-w-[180px] rounded-lg border border-cb-divider bg-cb-card px-2.5 py-1.5 text-[10px] leading-tight text-cb-muted shadow-lg group-hover/hint:block">
                {{ deleteBlockedReason }}
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Deactivated notice -->
      <div
        v-if="listing.isDeactivated"
        class="flex items-center gap-2 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-2 text-xs text-cb-warning"
      >
        <i class="fa-solid fa-info-circle shrink-0"></i>
        <span>This service has been deactivated.</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { getCategoryIcon, getCategoryLabel } from "@/utils/serviceCategories";
import CustomDropdown from "@/components/reusables/DropDownComponent.vue";

const props = defineProps({
  listing: { type: Object, required: true },
  actionLoading: { type: Boolean, default: false },
});

defineEmits(["click", "edit", "delete", "status-change", "view-seller"]);

/* ── Seller ───────────────────────────────────────────── */
const seller = computed(() => props.listing.sellerId || {});

const sellerName = computed(
  () => seller.value.displayName || "Unknown seller",
);

const sellerAvatar = computed(() => {
  if (seller.value.avatar) return seller.value.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName.value)}`;
});

const sellerSlug    = computed(() => seller.value.slug);
const sellerTier    = computed(() => seller.value.subscriptionTier);
const isVerified    = computed(() => seller.value.identityVerificationBadge);
const sellerRating  = computed(() => seller.value.averageRating?.toFixed(1) || "0.0");

/* ── Delete guard ─────────────────────────────────────── */
const isActive     = computed(() => props.listing.status === 'active')
const hasOrders    = computed(() => (props.listing.totalOrders || 0) > 0)

/**
 * Delete is only allowed when the listing is a draft AND has no orders at all.
 * - Active listings must be paused first before they can be deleted.
 * - Listings with any orders (even completed) cannot be deleted because
 *   those orders reference this listing for history/dispute purposes.
 */
const canDelete = computed(() => !isActive.value && !hasOrders.value)

const deleteBlockedReason = computed(() => {
  if (isActive.value && hasOrders.value)
    return 'Pause the service and ensure all orders are completed first'
  if (isActive.value)
    return 'Pause the service before deleting'
  if (hasOrders.value)
    return 'Cannot delete — this listing has existing orders'
  return ''
})

/* ── Listing ──────────────────────────────────────────── */
const categoryIcon = computed(
  () => getCategoryIcon(props.listing?.category) || "fa-solid fa-tag",
);

const categoryLabel = computed(() => {
  const label = getCategoryLabel(props.listing?.category) || "other";
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
});

const tierCount = computed(() => props.listing.tiers?.length || 0);

const startingPrice = computed(() => {
  const tiers = props.listing.tiers || [];
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t) => t.price));
});

const deliveryTime = computed(() => {
  const tiers = props.listing.tiers || [];
  if (!tiers.length) return "Varies";
  const days = tiers.map((t) => t.deliveryDays);
  const min = Math.min(...days);
  const max = Math.max(...days);
  return min === max ? `${min} day${min > 1 ? "s" : ""}` : `${min}–${max} days`;
});

const STATUS_MAP = {
  active:      { label: "Active",      cls: "bg-cb-accent-subtle text-cb-accent" },
  paused:      { label: "Paused",      cls: "bg-cb-warning-subtle text-cb-warning" },
  draft:       { label: "Draft",       cls: "bg-cb-field text-cb-muted" },
  deactivated: { label: "Deactivated", cls: "bg-cb-field text-cb-muted" },
};

const statusLabel = computed(() => STATUS_MAP[props.listing.status]?.label);
const statusClass = computed(() => STATUS_MAP[props.listing.status]?.cls);
</script>