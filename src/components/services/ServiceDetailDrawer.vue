<!-- src/components/services/ServiceDetailDrawer.vue -->
<template>
  <div class="flex h-full flex-col bg-cb-base">
    <!-- Header -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-cb-divider px-4 py-3.5 sm:px-5 sm:py-4"
    >
      <div class="flex items-center gap-2.5">
        <template v-if="!loading && service">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold',
              statusClass,
            ]"
          >
            <span :class="['h-1.5 w-1.5 rounded-full', statusDot]"></span>
            {{ statusLabel }}
          </span>
        </template>
        <div
          v-else-if="loading"
          class="h-5 w-20 animate-pulse rounded-full bg-cb-field"
        ></div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
          title="Close"
        >
          <i class="fa-solid fa-times text-sm"></i>
        </button>
      </div>
    </header>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        <div class="space-y-3">
          <div class="h-5 w-24 animate-pulse rounded-full bg-cb-field"></div>
          <div class="h-7 w-3/4 animate-pulse rounded-xl bg-cb-field"></div>
          <div class="flex items-center gap-3 pt-1">
            <div
              class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-cb-field"
            ></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-4 w-1/2 animate-pulse rounded bg-cb-field"></div>
              <div class="h-3 w-1/3 animate-pulse rounded bg-cb-field"></div>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-full animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-5/6 animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-4/5 animate-pulse rounded bg-cb-field"></div>
        </div>
        <div class="space-y-3">
          <div class="h-4 w-28 animate-pulse rounded bg-cb-field"></div>
          <div
            v-for="i in 2"
            :key="i"
            class="h-24 animate-pulse rounded-xl bg-cb-field"
          ></div>
        </div>
      </div>
      <div class="shrink-0 border-t border-cb-divider p-4">
        <div class="h-12 animate-pulse rounded-xl bg-cb-field"></div>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="service">
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-5 p-4 sm:p-5">
          <!-- Title & seller -->
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent"
              >
                <i :class="[categoryIcon, 'text-[10px]']"></i>
                {{ categoryLabel }}
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-cb-field px-2 py-0.5 text-[10px] text-cb-muted"
              >
                <i class="fa-solid fa-shopping-cart text-[9px]"></i>
                {{ service.totalOrders ?? 0 }} orders
              </span>
            </div>
            <h2
              class="text-base font-bold leading-snug text-cb-text sm:text-lg"
            >
              {{ service.title }}
            </h2>

            <!-- Seller card -->
            <div
              class="mt-3 flex items-center gap-3 rounded-xl border border-cb-divider bg-cb-card p-3"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-sm font-bold text-cb-contrast"
              >
                <img
                  v-if="sellerAvatar"
                  :src="sellerAvatar"
                  class="h-full w-full object-cover"
                  :alt="sellerName"
                />
                <span v-else>{{ sellerInitials }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <p class="text-sm font-semibold text-cb-text">
                    {{ sellerName }}
                  </p>
                  <span
                    v-if="sellerBadge"
                    class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cb-accent"
                  >
                    <i class="fa-solid fa-circle-check"></i> Verified
                  </span>
                </div>
                <div
                  class="mt-0.5 flex items-center gap-1.5 text-xs text-cb-muted"
                >
                  <span class="flex items-center gap-0.5">
                    <i
                      v-for="s in 5"
                      :key="s"
                      :class="[
                        'fa-star text-[10px]',
                        s <= Math.round(sellerRating)
                          ? 'fa-solid text-cb-warning'
                          : 'fa-regular text-cb-muted-40',
                      ]"
                    ></i>
                  </span>
                  <span>{{ sellerRating?.toFixed(1) }}</span>
                  <span
                    v-if="seller?.isStudent"
                    class="inline-flex items-center gap-0.5 rounded-full border border-cb-divider px-1.5 py-0.5 text-[9px]"
                  >
                    <i class="fa-solid fa-graduation-cap text-[8px]"></i>
                    Student
                  </span>
                </div>
              </div>
              <!-- View Profile — inside card, flush right -->
              <button
                @click="goToProviderProfile"
                class="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
              >
                <i class="fa-solid fa-user text-[10px]"></i>
                View Profile
              </button>
            </div>
          </div>
          <!-- Description -->
          <section class="rounded-xl border border-cb-divider bg-cb-card p-4">
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-align-left"></i> Description
            </p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">
              {{ service.description }}
            </p>
          </section>

          <!-- Tiers -->
          <section>
            <p
              class="mb-3 flex items-center gap-1.5 text-xs font-bold text-cb-text"
            >
              <i class="fa-solid fa-layer-group text-cb-muted"></i>
              Pricing Tiers
            </p>
            <div class="space-y-2.5">
              <div
                v-for="tier in service.tiers"
                :key="tier.name"
                :class="[
                  'rounded-xl border-2 p-3.5 transition-all duration-150 sm:p-4',
                  canOrder && selectedTier === tier.name
                    ? 'border-cb-accent bg-cb-accent-subtle ring-2 ring-cb-accent/20 cursor-pointer'
                    : canOrder
                      ? 'border-cb-divider bg-cb-card hover:border-cb-accent/40 cursor-pointer'
                      : 'border-cb-divider bg-cb-card opacity-60 cursor-default',
                ]"
                @click="canOrder && (selectedTier = tier.name)"
                :role="canOrder ? 'button' : undefined"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <!-- Selected indicator -->
                      <div
                        :class="[
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                          selectedTier === tier.name
                            ? 'border-cb-accent bg-cb-accent'
                            : 'border-cb-divider',
                        ]"
                      >
                        <i
                          v-if="selectedTier === tier.name"
                          class="fa-solid fa-check text-[8px] text-cb-contrast"
                        ></i>
                      </div>
                      <h4 class="text-sm font-bold capitalize text-cb-text">
                        {{ tier.name }}
                      </h4>
                    </div>
                    <p class="mt-1.5 text-xs leading-relaxed text-cb-muted">
                      {{ tier.description }}
                    </p>
                    <div
                      class="mt-2 flex flex-wrap items-center gap-3 text-xs text-cb-muted"
                    >
                      <span class="inline-flex items-center gap-1">
                        <i class="fa-regular fa-clock text-[10px]"></i>
                        {{ tier.deliveryDays }} day{{
                          tier.deliveryDays > 1 ? "s" : ""
                        }}
                        delivery
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <i class="fa-solid fa-rotate-left text-[10px]"></i>
                        {{ tier.revisions }} revision{{
                          tier.revisions !== 1 ? "s" : ""
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-lg font-bold text-cb-text">
                      ₦{{ tier.price.toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Portfolio -->
          <section v-if="service.portfolioUrls?.length">
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-images"></i> Portfolio
            </p>
            <div class="flex flex-wrap gap-2">
              <a
                v-for="(url, i) in service.portfolioUrls"
                :key="i"
                :href="url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-card px-3 py-1.5 text-xs text-cb-text transition-colors hover:bg-cb-field hover:text-cb-accent"
              >
                <i
                  class="fa-solid fa-arrow-up-right-from-square text-[10px]"
                ></i>
                Portfolio {{ i + 1 }}
              </a>
            </div>
          </section>

          <!-- Tags -->
          <div v-if="service.tags?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in service.tags"
              :key="tag"
              class="rounded-full border border-cb-divider bg-cb-field px-2.5 py-1 text-xs text-cb-muted"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Stats row -->
          <div
            class="grid grid-cols-3 gap-2 rounded-xl border border-cb-divider bg-cb-card p-3 text-center"
          >
            <div>
              <p class="text-base font-bold text-cb-text">
                {{ service.totalOrders ?? 0 }}
              </p>
              <p class="text-[10px] text-cb-muted">Orders</p>
            </div>
            <div class="border-x border-cb-divider">
              <p class="text-base font-bold text-cb-text">
                {{ service.averageRating?.toFixed(1) || "—" }}
              </p>
              <p class="text-[10px] text-cb-muted">Rating</p>
            </div>
            <div>
              <p class="text-base font-bold text-cb-text">
                {{ service.totalReviews ?? 0 }}
              </p>
              <p class="text-[10px] text-cb-muted">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer: Order form -->
      <footer class="shrink-0 border-t border-cb-divider bg-cb-base p-4 space-y-3">

        <!-- 1. Deactivated -->
        <div
          v-if="service?.status === 'deactivated'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-3 text-sm font-semibold text-cb-warning"
        >
          <i class="fa-solid fa-ban"></i>
          This service has been deactivated and is no longer available
        </div>

        <!-- 2. Owner -->
        <div
          v-else-if="isOwner"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted"
        >
          <i class="fa-solid fa-user"></i>
          This is your service
        </div>

        <!-- 3. Buyer has a PENDING_PAYMENT order — show Pay Now -->
        <template v-else-if="activeOrderStatus === 'pending_payment'">
          <div class="flex items-start gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3">
            <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-cb-warning"></i>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-cb-warning">Payment Pending</p>
              <p class="mt-0.5 text-xs text-cb-warning/80">
                You placed an order. Complete payment to activate it.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="handlePayExistingOrder"
              :disabled="serviceStore.actionLoading"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
            >
              <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-credit-card"></i>
              {{ serviceStore.actionLoading ? "Processing…" : "Pay Now" }}
            </button>
            <button
              v-if="canChat"
              @click="emit('chat', activeOrderWithSeller)"
              class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 text-sm font-semibold text-cb-muted hover:bg-cb-field"
            >
              <i class="fa-regular fa-message"></i>
            </button>
          </div>
        </template>

        <!-- 4. Buyer has an IN_PROGRESS order -->
        <template v-else-if="activeOrderStatus === 'in_progress'">
          <div class="flex items-center gap-3 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
            <i class="fa-solid fa-hourglass-half shrink-0 text-cb-accent"></i>
            <div>
              <p class="text-sm font-semibold text-cb-accent">Order In Progress</p>
              <p class="mt-0.5 text-xs text-cb-accent/80">The seller is working on your order.</p>
            </div>
          </div>
          <button
            v-if="canChat"
            @click="emit('chat', activeOrderWithSeller)"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent hover:bg-cb-accent-subtle"
          >
            <i class="fa-regular fa-message"></i>
            Message {{ chatPartnerName }}
          </button>
        </template>

        <!-- 5. Buyer has a REVISION order -->
        <template v-else-if="activeOrderStatus === 'revision'">
          <div class="flex items-center gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3">
            <i class="fa-solid fa-rotate-left shrink-0 text-cb-warning"></i>
            <div>
              <p class="text-sm font-semibold text-cb-warning">Revision In Progress</p>
              <p class="mt-0.5 text-xs text-cb-warning/80">The seller is working on your revision request.</p>
            </div>
          </div>
          <button
            v-if="canChat"
            @click="emit('chat', activeOrderWithSeller)"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent hover:bg-cb-accent-subtle"
          >
            <i class="fa-regular fa-message"></i>
            Message {{ chatPartnerName }}
          </button>
        </template>

        <!-- 6. Buyer has a DELIVERED order — awaiting their action -->
        <template v-else-if="activeOrderStatus === 'delivered'">
          <div class="flex items-center gap-3 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
            <i class="fa-solid fa-truck-fast shrink-0 text-cb-accent"></i>
            <div>
              <p class="text-sm font-semibold text-cb-accent">Order Delivered</p>
              <p class="mt-0.5 text-xs text-cb-accent/80">Go to My Services to confirm or request a revision.</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="goToMyServices"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark"
            >
              <i class="fa-solid fa-briefcase text-[10px]"></i>
              Go to My Services
            </button>
            <button
              v-if="canChat"
              @click="emit('chat', activeOrderWithSeller)"
              class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 text-sm font-semibold text-cb-muted hover:bg-cb-field"
            >
              <i class="fa-regular fa-message"></i>
            </button>
          </div>
        </template>

        <!-- 7. No existing order — show new order form -->
        <template v-else-if="canOrder">
          <button
            v-if="canChat"
            @click="emit('chat', activeOrderWithSeller)"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent-subtle hover:shadow-sm"
          >
            <i class="fa-regular fa-message"></i>
            Message {{ chatPartnerName }}
          </button>

          <textarea
            v-model="requirements"
            rows="2"
            placeholder="Describe your requirements (optional)..."
            class="w-full resize-none rounded-xl border border-cb-divider bg-cb-card p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"
          ></textarea>

          <div class="flex items-center justify-between gap-3">
            <div v-if="selectedTierData" class="text-sm">
              <span class="text-cb-muted">Total: </span>
              <span class="font-bold text-cb-text">₦{{ selectedTierData.price?.toLocaleString() }}</span>
            </div>
            <div v-else class="text-xs text-cb-muted">Select a tier above to order</div>
            <button
              @click="handlePlaceOrder"
              :disabled="!selectedTier || serviceStore.actionLoading"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-bag-shopping"></i>
              {{ serviceStore.actionLoading ? "Placing…" : selectedTier ? "Place Order" : "Select Tier" }}
            </button>
          </div>
        </template>

        <!-- 8. Service not accepting orders -->
        <div
          v-else
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted"
        >
          <i class="fa-solid fa-clock"></i>
          This service is not currently accepting orders
        </div>
      </footer>
    </template>

    <!-- Error state -->
    <template v-else-if="!loading">
      <div
        class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-muted"></i>
        <p class="text-sm text-cb-muted">Could not load service details.</p>
        <button
          @click="$emit('close')"
          class="text-xs text-cb-accent hover:underline"
        >
          Close
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useServiceStore } from "@/stores/serviceStore";
import { useToast } from "@/composables/useToast";
import { getCategoryIcon, getCategoryLabel } from "@/utils/serviceCategories";

const router = useRouter();

const serviceStore = useServiceStore();
const toast = useToast();

const props = defineProps({
  service: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
  currentUserId: { type: String, default: null },
  // Active orders the current user has with this service's seller
  // Pass in from parent: buyingOrders filtered to this service's sellerId
  activeOrderWithSeller: { type: Object, default: null },
});

const emit = defineEmits(["close", "order", "chat"]);

const selectedTier = ref(null);
const requirements = ref("");

// Check if user can place a NEW order (not owner, service active, no existing active order)
const canOrder = computed(() => {
  return (
    !props.isOwner &&
    props.service?.status === "active" &&
    !props.activeOrderWithSeller
  );
});

// Reset selections when service changes
watch(
  () => props.service?._id,
  () => {
    selectedTier.value = null;
    requirements.value = "";
  },
);

// Auto-select cheapest tier for non-owners (only if service is active)
watch(
  () => props.service,
  (svc) => {
    if (svc?.tiers?.length && !props.isOwner && svc.status === "active") {
      const sorted = [...svc.tiers].sort((a, b) => a.price - b.price);
      selectedTier.value = sorted[0].name;
    } else {
      selectedTier.value = null;
    }
  },
  { immediate: true },
);

const selectedTierData = computed(
  () =>
    props.service?.tiers?.find((t) => t.name === selectedTier.value) || null,
);

// Category helpers
const categoryIcon = computed(
  () => getCategoryIcon(props.service?.category) || "fa-solid fa-tag",
);

const categoryLabel = computed(() => {
  const label = getCategoryLabel(props.service?.category) || "other";
  return label.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
});

// Seller info
const seller = computed(() => {
  if (typeof props.service?.sellerId === "object")
    return props.service.sellerId;
  return null;
});

const sellerName = computed(() => {
  if (seller.value)
    return (
      seller.value.displayName ||
      `${seller.value.firstName || ""} ${seller.value.lastName || ""}`.trim() ||
      "Seller"
    );
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
const sellerRating = computed(() => seller.value?.averageRating || 0);
const sellerBadge = computed(
  () => seller.value?.identityVerificationBadge || false,
);

// Chat — visible to buyer when they have an active order with this seller
const canChat = computed(() => {
  if (!props.service || props.isOwner || !props.currentUserId) return false;
  return !!props.activeOrderWithSeller;
});

const chatPartnerName = computed(() => sellerName.value);

// Status mapping
const STATUS_MAP = {
  active: {
    label: "Active",
    cls: "bg-cb-accent-subtle text-cb-accent",
    dot: "bg-cb-accent",
  },
  draft: {
    label: "Draft",
    cls: "bg-cb-field text-cb-muted",
    dot: "bg-cb-muted",
  },
  paused: {
    label: "Paused",
    cls: "bg-cb-warning-subtle text-cb-warning",
    dot: "bg-cb-warning",
  },
  deactivated: {
    label: "Deactivated",
    cls: "bg-cb-field text-cb-muted",
    dot: "bg-cb-muted",
  },
};

const statusLabel = computed(
  () => STATUS_MAP[props.service?.status]?.label || props.service?.status || "",
);
const statusClass = computed(
  () => STATUS_MAP[props.service?.status]?.cls || "bg-cb-field text-cb-muted",
);
const statusDot = computed(
  () => STATUS_MAP[props.service?.status]?.dot || "bg-cb-muted",
);

/**
 * STEP 3 — Place the order only.
 * CBC contact fee is deducted immediately on the backend.
 * Order is created with status: PENDING_PAYMENT.
 * The footer reactively switches to the pending_payment state,
 * where the user then clicks "Pay Now" to trigger Step 4 (Paystack).
 */
const handlePlaceOrder = async () => {
  if (!selectedTier.value) return;

  const tier = selectedTierData.value;
  if (!tier) {
    toast.error("Please select a valid tier");
    return;
  }

  try {
    await serviceStore.createOrder(props.service._id, {
      tierName: tier.name,
      requirements: requirements.value || "",
      callbackUrl: `${window.location.origin}/payment/service/callback`,
    });
    // The store adds the new order to buyingOrders → activeOrderWithSeller
    // updates reactively → footer switches to the pending_payment "Pay Now" state.
    toast.success("Order placed! Now complete your payment.");
  } catch {
    toast.error(serviceStore.error || "Failed to place order");
  }
};

// Status of the buyer's existing order with this seller (if any)
const activeOrderStatus = computed(() => props.activeOrderWithSeller?.status ?? null)

// Pay an existing pending_payment order directly from this drawer
const handlePayExistingOrder = async () => {
  const orderId = props.activeOrderWithSeller?._id
  if (!orderId) return
  try {
    const payRes = await serviceStore.payOrder(orderId)
    const authorizationUrl =
      payRes?.data?.payment?.authorizationUrl ??
      payRes?.data?.authorizationUrl ??
      payRes?.data?.authorization_url ??
      payRes?.data?.paymentUrl ??
      payRes?.data?.url
    if (authorizationUrl) {
      window.location.href = authorizationUrl
    } else {
      toast.success("Payment initiated. Check your orders page.")
    }
  } catch {
    toast.error(serviceStore.error || "Failed to initiate payment")
  }
}

function goToMyServices() {
  emit("close");
  router.push({ name: "MyServices" });
}

function goToProviderProfile() {
  const s = props.service?.sellerId;
  const slug = typeof s === "object" ? s?.slug : null;

  if (!slug) {
    toast.error("Cannot open seller profile");
    return;
  }

  emit("close");
 router.push({ name: "ServiceProviderProfile", params: { identifier: slug } });
}
</script>