<template>
  <div
    class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cb-base shadow-2xl sm:max-w-md sm:rounded-2xl"
  >
    <!-- Handle -->
    <div class="flex justify-center pb-1 pt-3 sm:hidden">
      <div class="h-1 w-10 rounded-full bg-cb-divider"></div>
    </div>

    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-cb-divider px-6 py-4"
    >
      <div>
        <h3 class="flex items-center gap-2 text-base font-bold text-cb-text">
          <i class="fa-solid fa-gavel text-cb-accent"></i>
          Place your bid
        </h3>
        <p class="mt-0.5 text-xs text-cb-muted">
          Stand out with a clear, fair proposal.
        </p>
      </div>

      <button
        @click="$emit('close')"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted hover:bg-cb-field hover:text-cb-text"
      >
        <i class="fa-solid fa-times text-sm"></i>
      </button>
    </div>

    <!-- Errand context -->
    <div
      v-if="errand"
      class="mx-6 mt-4 rounded-xl border border-cb-divider bg-cb-card p-3.5"
    >
      <p class="mb-1 line-clamp-1 text-sm font-bold text-cb-text">
        {{ errand.title }}
      </p>

      <div class="flex items-center gap-3 text-xs text-cb-muted">
        <span class="flex items-center gap-1">
          <i class="fa-solid fa-user text-[10px]"></i>
          {{ errand.posterId?.displayName || "Poster" }}
        </span>

        <span class="flex items-center gap-1">
          <i class="fa-regular fa-clock text-[10px]"></i>
          {{ formatDeadline(errand.deadline) }}
        </span>
      </div>

      <div class="mt-2 flex items-center gap-2">
        <span class="text-sm font-extrabold text-cb-text">
          ₦{{ errand.budget?.toLocaleString() }}
        </span>

        <span
          :class="[
            'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
            errand.budgetType === 'fixed'
              ? 'bg-cb-warning-subtle text-cb-warning'
              : 'bg-cb-accent-subtle text-cb-accent',
          ]"
        >
          {{ errand.budgetType === "fixed" ? "Fixed" : "Negotiable" }}
        </span>
      </div>
    </div>

    <!-- NO-LOCATION GATE — shown when runner has no location on profile -->
    <template v-if="!userHasLocation">
      <div class="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-warning-subtle">
          <i class="fa-solid fa-location-dot text-2xl text-cb-warning"></i>
        </div>
        <div>
          <h4 class="text-base font-bold text-cb-text">Location required to bid</h4>
          <p class="mt-1.5 max-w-xs text-sm text-cb-muted leading-relaxed">
            Runners can only bid on errands within their own state.
            Please set your location on your profile before placing a bid.
          </p>
        </div>
        <router-link
          to="/user/profile"
          class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-6 py-3 text-sm font-bold text-cb-contrast transition-opacity hover:opacity-85"
          @click="$emit('close')"
        >
          <i class="fa-solid fa-user-pen text-xs"></i>
          Update my profile
        </router-link>
      </div>
      <div class="border-t border-cb-divider bg-cb-card/30 px-6 py-4">
        <button
          @click="$emit('close')"
          class="w-full rounded-xl border border-cb-divider bg-cb-card px-4 py-3 text-sm font-semibold text-cb-text hover:bg-cb-field"
        >
          Close
        </button>
      </div>
    </template>

    <!-- FORM (only shown when user has location) -->
    <template v-else>
    <div
      v-if="hasUserBid && existingBid"
      class="mx-6 mt-4 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle p-4"
    >
      <div class="mb-2 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation text-cb-warning"></i>
        <p class="text-sm font-bold text-cb-warning">
          You already have an active bid
        </p>
      </div>
      <div class="space-y-1 rounded-lg bg-cb-warning/10 px-3 py-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-cb-warning/80">Your bid amount</span>
          <span class="font-bold text-cb-warning"
            >₦{{ existingBid.amount?.toLocaleString() }}</span
          >
        </div>
        <div
          v-if="existingBid.message"
          class="text-xs text-cb-warning/80 italic"
        >
          "{{ existingBid.message }}"
        </div>
        <div class="flex items-center gap-1 text-[10px] text-cb-warning/70">
          <i class="fa-solid fa-clock text-[9px]"></i>
          Status:
          <span class="font-semibold capitalize">{{ existingBid.status }}</span>
        </div>
      </div>
      <p class="mt-2 text-xs text-cb-warning/80">
        You can only have one active bid per errand. Withdraw your current bid
        from
        <span class="font-semibold">My Errands → My Bids</span> to place a new
        one.
      </p>
    </div>

    <!-- FORM (disabled if bid exists) -->
    <div class="flex-1 overflow-y-auto">
      <div class="space-y-4 px-6 pb-6 pt-4">
        <!-- Amount -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-cb-text">
            Your bid amount <span class="text-cb-negative">*</span>
          </label>

          <div class="relative">
            <span
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-cb-muted"
            >
              ₦
            </span>

            <input
              v-model.number="form.amount"
              type="number"
              min="1"
              :disabled="hasUserBid"
              :placeholder="errand?.budget ?? '0'"
              :class="[
                'w-full rounded-xl border-2 bg-cb-card py-3 pl-8 pr-4 text-sm font-semibold text-cb-text outline-none',
                hasUserBid
                  ? 'opacity-60 cursor-not-allowed'
                  : errors.amount
                    ? 'border-cb-negative/50 bg-cb-negative-subtle'
                    : 'border-cb-divider focus:border-cb-accent',
              ]"
              @input="errors.amount = ''"
            />
          </div>

          <p v-if="errors.amount" class="mt-1 text-xs text-cb-negative">
            {{ errors.amount }}
          </p>
        </div>

        <!-- Message -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-cb-text">
            Your message <span class="text-cb-negative">*</span>
          </label>

          <textarea
            v-model="form.message"
            rows="3"
            maxlength="500"
            :disabled="hasUserBid"
            placeholder="Tell the poster why you're the best person for this errand..."
            :class="[
              'w-full resize-none rounded-xl border-2 bg-cb-card px-3.5 py-3 text-sm text-cb-text outline-none',
              hasUserBid
                ? 'opacity-60 cursor-not-allowed'
                : errors.message
                  ? 'border-cb-negative/50 bg-cb-negative-subtle'
                  : 'border-cb-divider focus:border-cb-accent',
            ]"
            @input="errors.message = ''"
          />
        </div>

        <!-- Templates -->
        <div v-if="!hasUserBid">
          <p
            class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
          >
            Quick templates
          </p>

          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="t in templates"
              :key="t"
              type="button"
              @click="selectTemplate(t)"
              :class="[
                'rounded-md border px-2.5 py-1 text-xs transition',
                selectedTemplate === t
                  ? 'border-cb-accent bg-cb-accent text-cb-contrast'
                  : 'border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent hover:text-cb-accent',
              ]"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="flex items-start gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle p-3"
        >
          <i class="fa-solid fa-circle-exclamation mt-0.5 text-cb-negative"></i>
          <p class="text-xs text-cb-negative">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex gap-3 border-t border-cb-divider bg-cb-card/30 px-6 py-4">
      <button
        @click="$emit('close')"
        class="flex-1 rounded-xl border border-cb-divider bg-cb-card px-4 py-3 text-sm font-semibold text-cb-text hover:bg-cb-field"
      >
        Cancel
      </button>

      <button
        v-if="!hasUserBid"
        @click="handleSubmit"
        :disabled="loading"
        class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent px-4 py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
      >
        <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
        <i v-else class="fa-solid fa-gavel text-xs"></i>
        Submit bid
      </button>

      <div
        v-else
        class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle px-4 py-3 text-sm font-semibold text-cb-warning"
      >
        <i class="fa-solid fa-triangle-exclamation text-xs"></i>
        Bid already placed
      </div>
    </div>
    </template><!-- /v-else userHasLocation -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import { formatDeadline } from "@/utils/categories";

const props = defineProps({
  errand: Object,
  loading: Boolean,
  error: String,
  hasUserBid: Boolean,
  existingBid: Object,
  userHasLocation: { type: Boolean, default: true },
});

const emit = defineEmits(["submit", "close"]);
const selectedTemplate = ref(null);
const form = ref({
  amount: props.existingBid?.amount ?? props.errand?.budget ?? "",
  message: props.existingBid?.message ?? "",
});

const errors = ref({ amount: "", message: "" });

const templates = [
  "Experienced professional ready to deliver high-quality results",
  "Available immediately to start and complete your project quickly",
  "Located nearby and able to provide prompt on-site or remote support",
  "Detail-oriented approach ensuring clean, accurate, and reliable output",
  "Fast turnaround time without compromising on quality standards",
  "Strong track record of delivering similar successful projects",
  "Flexible availability to match your project timeline and urgency",
  "Committed to clear communication and consistent project updates",
  "Skilled in handling complex requirements with efficient execution",
  "Focused on client satisfaction and long-term professional value",
];

function selectTemplate(t) {
  if (selectedTemplate.value === t) {
    selectedTemplate.value = null
    form.value.message = ''
    return
  }

  selectedTemplate.value = t
  form.value.message = `${t}.`
}
function handleSubmit() {
  errors.value = { amount: "", message: "" };

  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount = "Enter a valid bid amount";
    return;
  }

  if (!form.value.message.trim() || form.value.message.length < 10) {
    errors.value.message = "Message must be at least 10 characters";
    return;
  }

  emit("submit", {
    amount: form.value.amount,
    message: form.value.message,
  });
}
</script>