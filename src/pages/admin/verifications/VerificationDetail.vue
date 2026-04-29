<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()">
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-cb-text">Verification Review</h1>
          <p class="text-sm text-cb-muted">Review and decide on this submission</p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4 py-6">

      <template v-if="adminStore.selectedVerificationLoading">
        <div v-for="i in 3" :key="i" class="animate-pulse rounded-2xl bg-cb-card" :style="`height:${[160,300,80][i-1]}px`" />
      </template>

      <template v-else-if="verification">

        <!-- Status banner -->
        <div class="flex items-center gap-3 rounded-2xl border px-5 py-4" :class="bannerClass">
          <i :class="[bannerIcon, 'text-xl']" />
          <div>
            <p class="font-bold capitalize">{{ verification.status }}</p>
            <p v-if="verification.adminNote" class="text-sm opacity-80">{{ verification.adminNote }}</p>
          </div>
          <span v-if="verification.aiFlaggedForReview" class="ml-auto rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700">
            <i class="fa-solid fa-robot mr-1" />AI Flagged
          </span>
        </div>

        <!-- User info -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Submitted By</h3>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">
              {{ initials }}
            </div>
            <div>
              <p class="font-semibold text-cb-text">{{ verification.userId?.firstName }} {{ verification.userId?.lastName }}</p>
              <p class="text-sm text-cb-muted">{{ verification.userId?.email }}</p>
            </div>
            <span class="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="roleClass">
              {{ verification.userId?.role }}
            </span>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div class="rounded-xl bg-cb-field px-4 py-3">
              <p class="text-xs text-cb-muted">Document Type</p>
              <p class="font-semibold text-cb-text">{{ docTypeLabel(verification.docType) }}</p>
            </div>
            <div class="rounded-xl bg-cb-field px-4 py-3">
              <p class="text-xs text-cb-muted">Submitted</p>
              <p class="font-semibold text-cb-text">{{ fmtDate(verification.submittedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Document preview -->
        <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card">
          <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-cb-muted">Submitted Document</h3>
            <div class="flex items-center gap-2">
              <span v-if="verification.documentUrl"
                class="inline-flex items-center gap-1.5 rounded-full bg-cb-field px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cb-muted">
                <i :class="isPdf ? 'fa-solid fa-file-pdf text-red-400' : 'fa-solid fa-image text-cb-accent'" />
                {{ isPdf ? 'PDF' : 'Image' }}
              </span>
              <!-- Always show open-in-tab link for PDFs as reliable fallback -->
              <a v-if="isPdf && verification.documentUrl"
                :href="verification.documentUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent/10 px-2.5 py-1 text-[10px] font-bold text-cb-accent hover:bg-cb-accent/20 transition-colors">
                <i class="fa-solid fa-arrow-up-right-from-square" />
                Open PDF
              </a>
            </div>
          </div>

          <div class="p-4">
            <!-- Loading -->
            <div v-if="adminStore.documentLoading" class="flex flex-col items-center gap-3 py-16 text-center">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-cb-divider border-t-cb-accent" />
              <p class="text-sm text-cb-muted">Loading document…</p>
            </div>

            <template v-else-if="adminStore.documentObjectUrl">
              <!-- PDF — use <object> which handles authenticated URLs better than iframe -->
              <div v-if="isPdf" class="overflow-hidden rounded-xl bg-cb-field">
                <object
                  :data="adminStore.documentObjectUrl"
                  type="application/pdf"
                  class="w-full rounded-xl border-0"
                  style="height: 600px; min-height: 400px;"
                >
                  <!-- Shown if the browser can't embed the PDF inline -->
                  <div class="flex flex-col items-center gap-3 py-16 text-center">
                    <i class="fa-solid fa-file-pdf text-3xl text-red-400/60" />
                    <p class="text-sm font-semibold text-cb-text">PDF cannot be displayed inline</p>
                    <a :href="adminStore.documentObjectUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white">
                      <i class="fa-solid fa-arrow-up-right-from-square" /> Open PDF
                    </a>
                  </div>
                </object>
              </div>

              <!-- Image -->
              <div v-else class="overflow-hidden rounded-xl bg-cb-field">
                <img
                  :src="adminStore.documentObjectUrl"
                  alt="Verification document"
                  class="mx-auto block w-full object-contain"
                  style="max-height: 600px;"
                  @error="docLoadError = true"
                />
              </div>

              <!-- Image load error -->
              <div v-if="docLoadError" class="flex flex-col items-center gap-3 py-14 text-center">
                <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative/50" />
                <p class="text-sm font-semibold text-cb-text">Image failed to load</p>
                <button class="mt-1 inline-flex items-center gap-2 rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white" @click="load">
                  <i class="fa-solid fa-rotate-right" /> Reload
                </button>
              </div>
            </template>

            <!-- No URL available -->
            <div v-else class="flex flex-col items-center gap-2 py-10 text-center">
              <i class="fa-solid fa-image-slash text-3xl text-cb-muted/40" />
              <p class="text-sm text-cb-muted">Document not available</p>
            </div>
          </div>
        </div>

        <!-- Actions (only for pending) -->
        <div v-if="verification.status === 'pending'" class="flex gap-3">
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative/8 py-3.5 text-sm font-bold text-cb-negative transition-all hover:bg-cb-negative/15 active:scale-[0.98]"
            @click="openReview('rejected')">
            <i class="fa-solid fa-xmark" />Reject
          </button>
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-positive py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            @click="openReview('verified')">
            <i class="fa-solid fa-check" />Approve
          </button>
        </div>

        <div v-else class="flex items-center gap-2 rounded-xl bg-cb-field px-4 py-3 text-sm text-cb-muted">
          <i class="fa-solid fa-circle-info" />
          This verification has already been {{ verification.status === 'verified' ? 'approved' : 'rejected' }}.
        </div>

      </template>

      <div v-else class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative" />
        <button class="rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white" @click="load">Retry</button>
      </div>
    </div>

    <!-- Review Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showReviewModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showReviewModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1" :class="reviewAction === 'verified' ? 'bg-cb-positive' : 'bg-cb-negative'" />
            <div class="p-6">
              <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                :class="reviewAction === 'verified' ? 'bg-cb-positive/10' : 'bg-cb-negative/10'">
                <i class="text-lg" :class="reviewAction === 'verified' ? 'fa-solid fa-shield-check text-cb-positive' : 'fa-solid fa-shield-xmark text-cb-negative'" />
              </div>
              <h2 class="mb-1 text-lg font-bold text-cb-text">
                {{ reviewAction === 'verified' ? 'Approve Verification?' : 'Reject Verification?' }}
              </h2>
              <p class="text-sm text-cb-muted">
                {{ reviewAction === 'verified' ? 'The user will receive a verified badge and access to verified-only features.' : 'The user will be notified that their document was rejected.' }}
              </p>
              <div class="mt-4">
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cb-muted">Admin Note</label>
                <textarea v-model="adminNote"
                  :placeholder="reviewAction === 'verified' ? 'e.g. Document is clear and valid' : 'e.g. Document is blurry or expired'"
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/50 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
                  rows="3" />
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted"
                  @click="showReviewModal = false">Cancel</button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                  :class="reviewAction === 'verified' ? 'bg-cb-positive' : 'bg-cb-negative'"
                  :disabled="adminStore.verificationActionLoading"
                  @click="submitReview">
                  <svg v-if="adminStore.verificationActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ reviewAction === 'verified' ? 'Approve' : 'Reject' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const route      = useRoute();
const adminStore = useAdminStore();
const toast      = useToast();

const showReviewModal = ref(false);
const reviewAction    = ref("verified");
const adminNote       = ref("");
const docLoadError    = ref(false);

const verification = computed(() => adminStore.selectedVerification);

// Detect document type from URL
const isPdf = computed(() => {
  const url = verification.value?.documentUrl?.toLowerCase() || "";
  return url.includes(".pdf");
});

const initials = computed(() => {
  const u = verification.value?.userId;
  return `${u?.firstName?.[0] ?? ""}${u?.lastName?.[0] ?? ""}`.toUpperCase();
});

const roleClass = computed(() => ({
  student:      "bg-blue-500/10 text-blue-500",
  professional: "bg-purple-500/10 text-purple-500",
  corporate:    "bg-amber-500/10 text-amber-600",
}[verification.value?.userId?.role] ?? "bg-cb-field text-cb-muted"));

const bannerClass = computed(() => ({
  pending:  "border-amber-500/30 bg-amber-500/8 text-amber-700",
  verified: "border-cb-positive/30 bg-cb-positive/8 text-cb-positive",
  rejected: "border-cb-negative/30 bg-cb-negative/8 text-cb-negative",
}[verification.value?.status] ?? "border-cb-divider bg-cb-field text-cb-muted"));

const bannerIcon = computed(() => ({
  pending:  "fa-solid fa-clock text-amber-500",
  verified: "fa-solid fa-shield-check text-cb-positive",
  rejected: "fa-solid fa-shield-xmark text-cb-negative",
}[verification.value?.status] ?? "fa-solid fa-id-card"));

const docTypeLabel = (t) => ({
  national_id:     "National ID",
  passport:        "Passport",
  drivers_license: "Driver's License",
  nin:             "NIN",
  cac:             "CAC Certificate",
}[t] ?? t);

const fmtDate = (d) => d
  ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
  : "—";

function openReview(action) {
  reviewAction.value    = action;
  adminNote.value       = "";
  showReviewModal.value = true;
}

async function submitReview() {
  try {
    await adminStore.reviewVerification(verification.value._id, {
      status: reviewAction.value,
      adminNote: adminNote.value,
    });
    toast.success(reviewAction.value === "verified" ? "Verification approved" : "Verification rejected");
    showReviewModal.value = false;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Action failed");
  }
}

async function load() {
  docLoadError.value = false;
  await adminStore.fetchVerification(route.params.id);
  await loadDocument();
}

async function loadDocument() {
  docLoadError.value = false;
  try {
    await adminStore.fetchVerificationDocument(route.params.id);
  } catch {
    docLoadError.value = true;
  }
}

onMounted(load);
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.22s ease; }
.overlay-enter-from, .overlay-leave-to       { opacity: 0; }
</style>