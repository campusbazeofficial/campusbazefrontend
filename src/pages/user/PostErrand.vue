<template>
  <div class="flex min-h-screen bg-cb-card rounded-md  text-cb-text selection:bg-cb-accent/30">
    <aside class="sticky top-0 hidden h-screen w-56 flex-col border-r border-cb-divider bg-cb-base p-5 lg:flex">
      <div class="mb-8">
        <h1 class="text-base font-bold tracking-tight text-cb-text">Post Errand</h1>
        <p class="mt-0.5 text-[10px] text-cb-muted uppercase tracking-widest font-bold">Runner Network</p>
      </div>

      <nav class="flex-1 space-y-4">
        <div v-for="(step, index) in steps" :key="step.id" class="flex items-center gap-3">
          <div :class="['flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500', 
            currentStep > index + 1 ? 'border-cb-accent bg-cb-accent text-cb-contrast' : 
            currentStep === index + 1 ? 'border-cb-accent text-cb-accent' : 'border-cb-divider text-cb-muted']">
            <i v-if="currentStep > index + 1" class="fa-solid fa-check text-[8px]"></i>
            <span v-else class="text-[9px] font-bold">{{ index + 1 }}</span>
          </div>
          <p :class="['text-[10px] font-bold uppercase tracking-tight', currentStep === index + 1 ? 'text-cb-text' : 'text-cb-muted']">
            {{ step.name }}
          </p>
        </div>
      </nav>

      <div class="mt-auto pt-6 border-t border-cb-divider space-y-3">
        <!-- Balance + fee card -->
        <div class="rounded-xl bg-cb-field/40 p-4 border border-cb-divider/50">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[9px] font-bold uppercase text-cb-muted">Balance</span>
            <span :class="['text-xs font-bold', cbcBalance > 0 ? 'text-cb-positive' : 'text-cb-negative']">
              {{ cbcBalance.toLocaleString() }} CBC
            </span>
          </div>
          <div class="flex justify-between text-[9px] pt-2 border-t border-cb-divider/30">
            <span class="text-cb-muted">CBC Contact Fee</span>
            <span :class="['font-bold', cbcBlocked || cbcWarning ? 'text-cb-negative' : 'text-cb-accent']">{{ errandPostingCost || '—' }} CBC</span>
          </div>
          <div v-if="cbcBlocked" class="mt-2 text-[9px] font-semibold text-cb-negative">
            ✕ No CBC — top up to post
          </div>
          <div v-else-if="cbcWarning" class="mt-2 text-[9px] font-semibold text-amber-500">
            ⚠ Need {{ cbcShortfall }} more CBC
          </div>
        </div>
        <!-- How charges work -->
        <div class="rounded-xl bg-cb-field/40 p-3 border border-cb-divider/50 space-y-1.5">
          <p class="text-[9px] font-bold uppercase text-cb-muted">How charges work</p>
          <p class="text-[9px] text-cb-muted leading-relaxed"><span class="font-semibold text-cb-accent">CBC fee</span> — paid by you upfront from your wallet when you post.</p>
          <p class="text-[9px] text-cb-muted leading-relaxed"><span class="font-semibold text-cb-text">Commission</span> — deducted from the runner's NGN earnings when the job completes. You don't pay this.</p>
        </div>
      </div>
    </aside>

    <main class="flex-1 px-4 pb-8 pt-0 sm:px-12 lg:py-10">
      <!-- ── Mobile sticky header: balance bar + step indicator (hidden on lg) ── -->
      <div class="sticky -top-6 z-20 -mx-4 mb-6 border-b border-cb-divider bg-cb-card/95 backdrop-blur-sm sm:-mx-12 lg:hidden">
        <!-- Balance / fee row -->
        <div class="flex items-center gap-3 px-4 py-3 sm:px-12">
          <div class="flex flex-1 flex-col border-r border-cb-divider pr-3">
            <span class="text-[8px] font-bold uppercase tracking-widest text-cb-muted">Balance</span>
            <span :class="['text-xs font-bold', cbcBalance > 0 ? 'text-cb-positive' : 'text-cb-negative']">
              {{ cbcBalance.toLocaleString() }} CBC
            </span>
          </div>
          <div class="flex flex-1 flex-col border-r border-cb-divider pr-3">
            <span class="text-[8px] font-bold uppercase tracking-widest text-cb-muted">CBC Fee (upfront)</span>
            <span :class="['text-xs font-bold', cbcBlocked || cbcWarning ? 'text-cb-negative' : 'text-cb-accent']">{{ errandPostingCost || '—' }} CBC</span>
          </div>
          <div class="flex flex-1 flex-col">
            <span class="text-[8px] font-bold uppercase tracking-widest text-cb-muted">Status</span>
            <span v-if="cbcBlocked" class="text-[9px] font-bold text-cb-negative">No CBC balance</span>
            <span v-else-if="cbcWarning" class="text-[9px] font-bold text-amber-500">Need {{ cbcShortfall }} more</span>
            <span v-else class="text-[9px] italic leading-tight text-cb-muted">Sufficient balance</span>
          </div>
        </div>
        <!-- Step indicator row -->
        <div class="flex items-center justify-between border-t border-cb-divider/50 px-4 py-3 sm:px-12">
          <div v-for="(step, index) in steps" :key="step.id" class="flex flex-1 items-center">
            <div class="flex flex-col items-center gap-1">
              <div :class="['flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500',
                currentStep > index + 1 ? 'border-cb-accent bg-cb-accent text-cb-contrast' :
                currentStep === index + 1 ? 'border-cb-accent text-cb-accent' : 'border-cb-divider text-cb-muted']">
                <i v-if="currentStep > index + 1" class="fa-solid fa-check text-[8px]"></i>
                <span v-else class="text-[9px] font-bold">{{ index + 1 }}</span>
              </div>
              <span :class="['text-[9px] font-bold uppercase tracking-tight', currentStep === index + 1 ? 'text-cb-text' : 'text-cb-muted']">{{ step.name }}</span>
            </div>
            <div v-if="index < steps.length - 1" :class="['mb-4 h-px flex-1 mx-2 transition-colors duration-500', currentStep > index + 1 ? 'bg-cb-accent' : 'bg-cb-divider']"></div>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-lg">

        <!-- ── CBC blocked banner ── -->
        <div v-if="cbcBlocked" class="mb-5 flex items-start gap-3 rounded-2xl border border-cb-negative/40 bg-cb-negative/8 px-4 py-4">
          <i class="fa-solid fa-circle-xmark mt-0.5 shrink-0 text-cb-negative"></i>
          <div class="min-w-0">
            <p class="text-sm font-bold text-cb-negative">You have no CBC balance</p>
            <p class="mt-0.5 text-xs text-cb-muted leading-relaxed">Posting an errand requires a CBC contact fee. Top up your wallet to continue — no CBC, no posting.</p>
            <router-link to="/user/wallet" class="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-cb-negative px-3 py-1.5 text-[10px] font-bold text-white hover:opacity-85 transition-opacity">
              <i class="fa-solid fa-coins text-[9px]"></i>
              Top Up Wallet
            </router-link>
          </div>
        </div>

        <!-- ── CBC low-balance warning ── -->
        <div v-else-if="cbcWarning" class="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/8 px-4 py-4">
          <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-amber-500"></i>
          <div class="min-w-0">
            <p class="text-sm font-bold text-amber-600">Insufficient CBC for this errand</p>
            <p class="mt-0.5 text-xs text-cb-muted leading-relaxed">You need <strong>{{ errandPostingCost }} CBC</strong> to post but only have <strong>{{ cbcBalance }} CBC</strong>. You need <strong>{{ cbcShortfall }} more CBC</strong>.</p>
            <router-link to="/user/wallet" class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] font-bold text-amber-600 hover:bg-amber-400/20 transition-colors">
              <i class="fa-solid fa-coins text-[9px]"></i>
              Top Up Wallet
            </router-link>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Blocked overlay -->
          <div :class="cbcBlocked ? 'pointer-events-none select-none opacity-40' : ''">
          <div class="relative min-h-[400px]">
            <Transition name="step-slide" mode="out-in">
              <div :key="currentStep">
                
                <section v-if="currentStep === 1" class="space-y-6">
                  <header>
                    <h2 class="text-xl font-bold text-cb-text">Task Brief</h2>
                    <p class="text-xs text-cb-muted mt-1">What do you need help with?</p>
                  </header>
                  <div class="space-y-4">
                    <div class="group">
                      <label class="block text-[10px] font-bold uppercase text-cb-muted mb-1.5 ml-1">Title <span class="text-cb-negative">*</span></label>
                     <div class="bg-cb-field rounded-md">
                       <input v-model.trim="form.title" type="text" placeholder="e.g. Grocery Delivery" :class="['w-full rounded-xl border text-cb-text placeholder:text-cb-muted bg-cb-base px-4 py-3 text-sm font-medium outline-none focus:border-cb-accent transition-all', errors.title ? 'border-cb-negative/60 bg-cb-negative-subtle' : 'border-cb-divider']" @input="errors.value && (errors.value.title = '')" />
                     </div>
                     <p v-if="errors.value?.title" class="mt-1 flex items-center gap-1 text-[10px] font-semibold text-cb-negative">
                       <i class="fa-solid fa-circle-exclamation text-[9px]"></i>{{ errors.value.title }}
                     </p>
                    </div>
                    <div class="group">
                      <label class="block text-[10px] font-bold uppercase text-cb-muted mb-1.5 ml-1">Instructions <span class="text-cb-negative">*</span></label>
                      <textarea v-model.trim="form.description" rows="4" placeholder="Be specific about what you need done, location details, and any special requirements..." :class="['w-full rounded-xl border text-cb-text placeholder:text-cb-muted bg-cb-base px-4 py-3 text-sm font-medium outline-none focus:border-cb-accent transition-all resize-none', errors.value?.description ? 'border-cb-negative/60 bg-cb-negative-subtle' : 'border-cb-divider']" @input="errors.value && (errors.value.description = '')" />
                      <p v-if="errors.value?.description" class="mt-1 flex items-center gap-1 text-[10px] font-semibold text-cb-negative">
                        <i class="fa-solid fa-circle-exclamation text-[9px]"></i>{{ errors.value.description }}
                      </p>
                    </div>
                  </div>
                </section>

                <section v-else-if="currentStep === 2" class="space-y-6">
                  <header>
                    <h2 class="text-xl font-bold text-cb-text">Category</h2>
                    <p class="text-xs text-cb-muted mt-1">What type of errand is this?</p>
                  </header>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button v-for="cat in categories" :key="cat.value" type="button" @click="form.category = cat.value; errors.value && (errors.value.category = '')" :class="['flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all', form.category === cat.value ? 'border-cb-accent bg-cb-accent-subtle shadow-sm' : 'border-cb-divider bg-cb-base hover:border-cb-accent/40']">
                      <i :class="['fa-solid text-sm', cat.icon, form.category === cat.value ? 'text-cb-accent' : 'text-cb-muted']"></i>
                      <span class="text-[9px] font-bold uppercase tracking-tight">{{ cat.label }}</span>
                    </button>
                  </div>
                  <p v-if="errors.value?.category" class="flex items-center gap-1 text-[10px] font-semibold text-cb-negative">
                    <i class="fa-solid fa-circle-exclamation text-[9px]"></i>{{ errors.value.category }}
                  </p>
                </section>

                <section v-else-if="currentStep === 3" class="space-y-6 text-center">
                  <header>
                    <h2 class="text-xl font-bold text-cb-text">Reward</h2>
                    <p class="text-xs text-cb-muted mt-1">Set your price or allow bidding</p>
                  </header>

                  <div class="inline-flex flex-col items-center space-y-6 w-full">
                    <div class="flex bg-cb-field p-1 rounded-xl border border-cb-divider">
                      <button 
                        v-for="type in ['fixed', 'negotiable']" 
                        :key="type"
                        type="button"
                        @click="form.budgetType = type"
                        :class="['px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all', form.budgetType === type ? 'bg-cb-accent text-cb-contrast shadow-md' : 'text-cb-muted hover:text-cb-text']"
                      >
                        {{ type }}
                      </button>
                    </div>

                    <div :class="['inline-flex flex-col items-center rounded-3xl border p-8 w-full max-w-[280px] transition-colors', errors.value?.budget ? 'border-cb-negative/60 bg-cb-negative-subtle' : 'border-cb-divider bg-cb-base']">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold text-cb-muted">₦</span>
                      <input v-model.number="form.budget" type="number" class="w-32 bg-transparent text-center text-4xl font-bold outline-none" placeholder="0" @input="errors.value && (errors.value.budget = '')" />
                      </div>
                      <p class="mt-3 text-[9px] font-bold uppercase tracking-widest text-cb-muted">
                        {{ form.budgetType === 'fixed' ? 'Final Reward' : 'Starting Price' }} ₦500 Min
                      </p>
                    </div>
                    <p v-if="errors.value?.budget" class="flex items-center gap-1 text-[10px] font-semibold text-cb-negative">
                      <i class="fa-solid fa-circle-exclamation text-[9px]"></i>{{ errors.value.budget }}
                    </p>
                  </div>

                  <!-- Fee & commission breakdown -->
                  <div class="rounded-2xl border border-cb-divider bg-cb-base divide-y divide-cb-divider/60">
                    <div class="px-4 py-3">
                      <p class="text-[10px] font-bold uppercase tracking-widest text-cb-muted mb-2">How charges apply to this errand</p>
                    </div>
                    <div class="flex items-start gap-3 px-4 py-3">
                      <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-accent-subtle text-[10px] font-bold text-cb-accent">₡</span>
                      <div>
                        <p class="text-xs font-semibold text-cb-text">CBC Contact Fee — <span :class="errandPostingCost > 0 ? 'text-cb-accent' : 'text-cb-muted'">{{ errandPostingCost || '—' }} CBC</span></p>
                        <p class="mt-0.5 text-[10px] text-cb-muted leading-relaxed">Paid by <strong>you</strong> upfront from your CBC wallet when you post this errand. Scales with budget{{ cbcDiscount > 0 ? ` (${cbcDiscount}% plan discount applied)` : '' }}{{ isStudentVerified ? ', student rate active' : '' }}.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 px-4 py-3">
                      <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-field text-[10px] font-bold text-cb-muted">%</span>
                      <div>
                        <p class="text-xs font-semibold text-cb-text">Commission — deducted from runner's earnings</p>
                        <p class="mt-0.5 text-[10px] text-cb-muted leading-relaxed">After the job completes, the runner's agreed payment is reduced by their plan's commission rate. <strong>You do not pay commission</strong> — it comes from the runner's payout.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 px-4 py-3">
                      <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-field text-[10px] font-bold text-cb-muted">🔒</span>
                      <div>
                        <p class="text-xs font-semibold text-cb-text">Escrow — your payment is protected</p>
                        <p class="mt-0.5 text-[10px] text-cb-muted leading-relaxed">Your NGN reward is held in escrow via Paystack when you accept a bid. It's only released to the runner after you confirm the job is done.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section v-else-if="currentStep === 4" class="space-y-6">
                  <header>
                    <h2 class="text-xl font-bold text-cb-text">Logistics</h2>
                    <p class="text-xs text-cb-muted mt-1">Operating Hours: 8:00 AM — 8:00 PM</p>
                  </header>

                  <div class="space-y-5">
                    <div class="group">
                      <label class="block text-[10px] font-bold uppercase text-cb-muted mb-1.5 ml-1">Address</label>
                    <div class="bg-cb-field rounded-md">
                      <input v-model.trim="form.address" type="text" placeholder="Full address" class="w-full rounded-xl border border-cb-divider text-cb-text placeholder:text-cb-muted bg-cb-base px-4 py-3 text-sm font-medium outline-none focus:border-cb-accent transition-all" />
                    </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-[10px] font-bold uppercase text-cb-muted mb-1.5 ml-1">Date (DD/MM/YYYY)</label>
                      <div class="bg-cb-field rounded-md ">
                          <input v-model="form.rawDate" type="text" maxlength="10" placeholder="DD/MM/YYYY" @input="formatDateInput" class="w-full rounded-xl border border-cb-divider bg-cb-base text-cb-text placeholder:text-cb-muted px-4 py-3 text-sm font-mono outline-none focus:border-cb-accent transition-all" />
                      </div>
                      </div>

                      <div>
                        <label class="block text-[10px] font-bold uppercase text-cb-muted mb-1.5 ml-1">Time (12h)</label>
                        <div class="flex items-center gap-2">
                        <div class="bg-cb-field rounded-md">
                            <input v-model="form.rawTime" type="text" maxlength="5" placeholder="08:00" @input="formatTime12hInput" class="flex-1 rounded-xl border border-cb-divider bg-cb-base px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted font-mono outline-none focus:border-cb-accent transition-all text-center" />
                        </div>
                          <div class="flex h-[46px] rounded-xl bg-cb-field p-1 border border-cb-divider">
                            <button v-for="period in ['AM', 'PM']" :key="period" type="button" @click="form.period = period" :class="['px-3 rounded-lg text-[10px] font-bold transition-all', form.period === period ? 'bg-cb-accent text-cb-contrast shadow-sm' : 'text-cb-muted hover:text-cb-text']">
                              {{ period }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p v-if="errors.logistics" class="text-[10px] font-bold text-cb-negative text-center animate-pulse">
                      {{ errors.logistics }}
                    </p>
                  </div>
                </section>
              </div>
            </Transition>
          </div>

          </div><!-- /blocked overlay -->
          <footer class="mt-12 flex items-center justify-between border-t border-cb-divider pt-8">
            <button type="button" @click="prevStep" :class="['text-[10px] font-bold uppercase tracking-widest text-cb-muted transition-all', currentStep === 1 ? 'opacity-0 pointer-events-none' : 'hover:text-cb-text']">Back</button>
            <div class="flex gap-3">
              <button v-if="currentStep < 4" type="button" @click="nextStep" :disabled="cbcBlocked" class="rounded-md bg-cb-accent px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-cb-contrast shadow-lg shadow-cb-accent/20 active:scale-95 disabled:opacity-30">Continue</button>
              <button v-else type="submit" :disabled="!canSubmit || errandStore.actionLoading" class="rounded-md bg-cb-accent px-10 py-3 text-[10px] font-bold uppercase tracking-widest text-cb-contrast shadow-lg shadow-cb-accent/20 active:scale-95 disabled:opacity-40">
                {{ errandStore.actionLoading ? "..." : "Post Errand" }}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useErrandStore } from "@/stores/errandStore";
import { useWalletStore } from "@/stores/walletStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";
import { toPlanViewModel } from "@/utils/planViewModel";
import { getUserType } from "@/utils/planAccess";
import { getFinalCbcFee } from "@/utils/cbcFeeUtils";

const router = useRouter();
const errandStore = useErrandStore();
const walletStore = useWalletStore();
const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
const { success, error, warning } = useToast();

const currentStep = ref(1);
const errors = ref({});

const steps = [
  { id: 1, name: "Brief" },
  { id: 2, name: "Type" },
  { id: 3, name: "Budget" },
  { id: 4, name: "Details" },
];

const categories = [
  { value: "delivery_pickup", label: "Delivery", icon: "fa-truck" },
  { value: "grocery_shopping", label: "Groceries", icon: "fa-basket-shopping" },
  { value: "printing_binding", label: "Printing", icon: "fa-print" },
  { value: "food_runs", label: "Food", icon: "fa-utensils" },
  { value: "cleaning_laundry", label: "Laundry", icon: "fa-broom" },
  { value: "moving_assistance", label: "Moving", icon: "fa-truck-ramp-box" },
  { value: "typing_form_filling", label: "Office", icon: "fa-keyboard" },
  { value: "queue_standing", label: "Queue", icon: "fa-people-line" },
  { value: "pet_care", label: "Pets", icon: "fa-paw" },
  { value: "other", label: "Other", icon: "fa-ellipsis" },
];

const form = ref({
  title: "",
  description: "",
  category: "",
  budget: 500,
  budgetType: "fixed",
  address: "",
  rawDate: "",
  rawTime: "",
  period: "AM",
});

// ── Formatters & Masking ───────────────────────────────────────────

const formatDateInput = (e) => {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length > 2) v = v.substring(0, 2) + "/" + v.substring(2);
  if (v.length > 5) v = v.substring(0, 5) + "/" + v.substring(5, 9);
  form.value.rawDate = v;
};

const formatTime12hInput = (e) => {
  let v = e.target.value.replace(/\D/g, "");
  // Masking: First digit can only be 0 or 1
  if (v.length >= 1 && parseInt(v[0]) > 1) v = "";
  // Masking: If first is 1, second can only be 0, 1, or 2
  if (v.length >= 2 && v[0] === "1" && parseInt(v[1]) > 2) v = v[0];
  
  if (v.length > 2) v = v.substring(0, 2) + ":" + v.substring(2, 4);
  form.value.rawTime = v;
};

// ── Validation Logic ───────────────────────────────────────────────

const validateLogistics = () => {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/;

  if (!form.value.address) return "Address required.";
  if (!dateRegex.test(form.value.rawDate)) return "Invalid date format.";
  if (!timeRegex.test(form.value.rawTime)) return "Invalid time format.";

  // Convert to 24h for check
  let [hours, minutes] = form.value.rawTime.split(":").map(Number);
  if (form.value.period === "PM" && hours !== 12) hours += 12;
  if (form.value.period === "AM" && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes;
  const minLimit = 8 * 60;  // 8:00 AM
  const maxLimit = 20 * 60; // 8:00 PM
  
  if (totalMinutes < minLimit || totalMinutes > maxLimit) {
    return "Errands must be scheduled between 8:00 AM and 8:00 PM.";
  }

  const [d, m, y] = form.value.rawDate.split("/");
  const selectedDate = new Date(y, m - 1, d, hours, minutes);
  if (selectedDate <= new Date()) {
    return "Deadline must be in the future.";
  }

  return null;
};

// ── Financial Logic ───────────────────────────────────────────────

const currentPlanView = computed(() => {
  const plan = subscriptionStore.subscription?.plan ||
               subscriptionStore.plans.find(p => p.tier === subscriptionStore.currentTier);
  return plan ? toPlanViewModel(plan, getUserType(userStore.user)) : null;
});

// isStudentVerified: user type "student" qualifies for reduced CBC fees
const isStudentVerified = computed(() => getUserType(userStore.user) === "student");

// Plan's CBC discount (e.g. 15 = 15% off the table fee)
const cbcDiscount = computed(() => currentPlanView.value?.activeCbcDiscount ?? 0);

// Commission rate (shown for info only — this is the RUNNER's cost, not poster's)
const commissionRate = computed(() => currentPlanView.value?.activeCommission ?? 10);

// CBC contact fee: table lookup on budget, then plan discount applied
// This is what the POSTER pays upfront — unrelated to commission.
const errandPostingCost = computed(() => {
  const budget = form.value.budget || 0;
  if (budget <= 0) return 0;
  return getFinalCbcFee(budget, isStudentVerified.value, cbcDiscount.value);
});

// CBC balance status
const cbcBalance   = computed(() => walletStore.cbcBalance ?? 0);
const cbcBlocked   = computed(() => cbcBalance.value <= 0);
const cbcShortfall = computed(() => Math.max(0, errandPostingCost.value - cbcBalance.value));
const cbcWarning   = computed(() => !cbcBlocked.value && cbcShortfall.value > 0);

// ── Inline validation helpers ─────────────────────────────────────
function validateStep1() {
  let ok = true;
  if (!form.value.title || form.value.title.length < 3) {
    errors.value.title = "Title is required (min 3 characters).";
    ok = false;
  } else { errors.value.title = ""; }

  if (!form.value.description || form.value.description.length < 10) {
    errors.value.description = "Please describe the task (min 10 characters).";
    ok = false;
  } else { errors.value.description = ""; }
  return ok;
}
function validateStep2() {
  if (!form.value.category) {
    errors.value.category = "Please select a category.";
    return false;
  }
  errors.value.category = "";
  return true;
}
function validateStep3() {
  if (!form.value.budget || form.value.budget < 500) {
    errors.value.budget = "Minimum reward is ₦500.";
    return false;
  }
  errors.value.budget = "";
  return true;
}

// ── Workflow Actions ───────────────────────────────────────────────

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) return;
  if (currentStep.value === 2 && !validateStep2()) return;
  if (currentStep.value === 3 && !validateStep3()) return;
  currentStep.value++;
};

const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const canSubmit = computed(() => {
  return !cbcBlocked.value &&
         !cbcWarning.value &&
         form.value.title &&
         form.value.category &&
         form.value.budget >= 500 &&
         !validateLogistics();
});

const handleSubmit = async () => {
  const logError = validateLogistics();
  if (logError) {
    errors.value.logistics = logError;
    return;
  }

  try {
    let [hours, minutes] = form.value.rawTime.split(":").map(Number);
    if (form.value.period === "PM" && hours !== 12) hours += 12;
    if (form.value.period === "AM" && hours === 12) hours = 0;

    const [d, m, y] = form.value.rawDate.split("/");
    const deadline = new Date(y, m - 1, d, hours, minutes).toISOString();
    
    await errandStore.createErrand({ 
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      budget: form.value.budget,
      budgetType: form.value.budgetType,
      address: form.value.address,
      deadline 
    });
    
    success("Errand Posted!");
    router.push({ name: "MyErrands" });
  } catch (err) {
    error("Post failed. Check network or inputs.");
  }
};

onMounted(() => {
  walletStore.fetchBalance();
  subscriptionStore.initialize();
});
</script>

<style scoped>
.step-slide-enter-active, .step-slide-leave-active { transition: all 0.35s ease; }
.step-slide-enter-from { opacity: 0; transform: translateX(20px); }
.step-slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>