<template>
  <div class="bg-cb-card rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">
    
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-sm font-bold text-cb-text flex items-center gap-2">
        <i class="fa-solid fa-shield-halved text-cb-accent"></i>
        Identity Verification
      </h2>
      <span 
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
        :class="{
          'bg-cb-positive-subtle text-cb-positive': vStore.isVerified,
          'bg-cb-warning-subtle text-cb-warning': vStore.isPending,
          'bg-cb-negative-subtle text-cb-negative': vStore.isRejected,
          'bg-cb-field text-cb-muted': vStore.isUnverified
        }"
      >
        <i :class="statusIcon"></i>
        {{ statusLabel }}
      </span>
    </div>

    <div v-if="vStore.isVerified" class="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-cb-positive-subtle border border-cb-positive">
      <div>
        <p class="text-sm font-bold text-cb-text mb-0.5">Identity Verified</p>
        <p class="text-xs text-cb-muted leading-relaxed">Your identity has been confirmed. Your profile now carries a verification badge.</p>
      </div>
    </div>

    <div class="flex flex-col gap-3 p-3 sm:p-4 bg-cb-base border border-cb-divider rounded-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-bold text-cb-text">
          <i class="fa-solid fa-phone text-cb-accent"></i>
          <span>Phone Verification</span>
        </div>
        <span 
          class="inline-flex items-center gap-1.5 sm:px-3 py-1 rounded-full text-xs font-bold"
          :class="vStore.status?.phoneVerified ? 'md:bg-cb-positive-subtle text-cb-positive' : 'sm:bg-cb-field text-cb-muted'"
        >
          <i :class="vStore.status?.phoneVerified ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-question'"></i>
          {{ vStore.status?.phoneVerified ? 'Verified' : 'Unverified' }}
        </span>
      </div>

      <template v-if="!vStore.status?.phoneVerified">
        <template v-if="!vStore.phoneOtpSent">
          <div class="flex flex-col sm:flex-row gap-2 w-full">
            <input
              v-model="phoneInput"
              class="flex-1 bg-cb-base border-1.5 border-cb-divider rounded-lg px-3 py-2.5 text-sm text-cb-text placeholder:text-cb-muted focus:border-cb-accent outline-none transition-colors"
              placeholder="+2348012345678"
              type="tel"
            />
            <button
              class="flex-shrink-0 px-4 py-2.5 rounded-lg bg-cb-accent text-white text-xs font-semibold whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              :disabled="vStore.loading || !phoneInput"
              @click="handleSendOtp"
            >
              <span v-if="vStore.loading"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
              <span v-else>Send OTP</span>
            </button>
          </div>
          <p v-if="phoneError" class="text-xs text-cb-negative">{{ phoneError }}</p>
        </template>

        <template v-else>
          <p class="text-xs text-cb-muted flex items-center gap-1.5">
            <i class="fa-solid fa-envelope-open-text text-cb-accent"></i>
            OTP sent to <strong class="text-cb-text">{{ phoneInput }}</strong>.
          </p>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="otpInput"
              class="flex-1 bg-cb-base border-1.5 border-cb-divider rounded-lg px-3 py-2.5 text-sm text-cb-text tracking-widest font-bold placeholder:font-normal placeholder:tracking-normal focus:border-cb-accent outline-none transition-colors"
              placeholder="Enter OTP"
              maxlength="6"
            />
            <button
              class="flex-shrink-0 px-4 py-2.5 rounded-lg bg-cb-accent text-white text-xs font-semibold whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              :disabled="vStore.submitting || !otpInput"
              @click="handleVerifyOtp"
            >
              <span v-if="vStore.submitting"><i class="fa-solid fa-circle-notch fa-spin"></i></span>
              <span v-else>Verify</span>
            </button>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <button
              class="text-xs font-semibold text-cb-accent disabled:text-cb-muted disabled:cursor-not-allowed hover:underline"
              :disabled="displayCooldown > 0 || vStore.loading"
              @click="handleSendOtp"
            >
              <span v-if="displayCooldown > 0">Resend in {{ formatCooldown(displayCooldown) }}</span>
              <span v-else>Resend OTP</span>
            </button>
          </div>
          <p v-if="otpError" class="text-xs text-cb-negative">{{ otpError }}</p>
        </template>
      </template>

      <div v-if="vStore.status?.phoneVerified" class="flex items-center gap-2 text-sm font-semibold text-cb-positive">
        Your phone number is verified.
      </div>
    </div>

    <div v-if="vStore.isPending" class="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-cb-warning-subtle">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="w-8 h-8 rounded-full bg-cb-warning/20 text-cb-warning flex items-center justify-center text-sm flex-shrink-0">
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold text-cb-text mb-0.5">Under Review</p>
          <p class="text-xs text-cb-muted leading-relaxed">Your document is being reviewed. This usually takes 24–48 hours.</p>
        </div>
      </div>
      <div v-if="vStore.latestSubmission" class="flex flex-col gap-1 mt-1">
        <div class="flex justify-between text-xs">
          <span class="text-cb-muted">Document type</span>
          <span class="font-semibold text-cb-text">{{ formatDocType(vStore.latestSubmission.docType || vStore.latestSubmission.documentType) }}</span>
        </div>
        <div v-if="vStore.latestSubmission.createdAt || vStore.latestSubmission.submittedAt" class="flex justify-between text-xs">
          <span class="text-cb-muted">Submitted</span>
          <span class="font-semibold text-cb-text">{{ formatDate(vStore.latestSubmission.createdAt || vStore.latestSubmission.submittedAt) }}</span>
        </div>
      </div>
    </div>

    <div v-if="vStore.isRejected" class="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-cb-negative-subtle border border-cb-negative">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cb-negative text-white flex items-center justify-center text-sm sm:text-base flex-shrink-0">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-cb-negative mb-1">Verification Rejected</p>
          <div v-if="rejectionNote" class="flex items-start gap-2 bg-cb-negative/10 rounded-lg px-3 py-2 mb-1">
            <i class="fa-solid fa-comment-dots text-cb-negative text-xs mt-0.5 flex-shrink-0"></i>
            <p class="text-xs text-cb-text leading-relaxed italic">"{{ rejectionNote }}"</p>
          </div>
          <p class="text-xs text-cb-muted leading-relaxed">
            Please resubmit with a clear, valid document that matches the required type.
          </p>
        </div>
      </div>
      <div v-if="vStore.latestSubmission" class="flex flex-col gap-1 border-t border-cb-negative/20 pt-2">
        <div class="flex justify-between text-xs">
          <span class="text-cb-muted">Document type</span>
          <span class="font-semibold text-cb-text">{{ formatDocType(vStore.latestSubmission.docType || vStore.latestSubmission.documentType) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-cb-muted">Reviewed</span>
          <span class="font-semibold text-cb-text">{{ formatDate(vStore.latestSubmission.reviewedAt || vStore.latestSubmission.submittedAt) }}</span>
        </div>
      </div>
    </div>

    <template v-if="vStore.isUnverified || vStore.isRejected">
      <div class="flex items-start gap-3 p-3 bg-cb-accent-subtle border border-cb-accent-muted rounded-lg text-xs text-cb-muted leading-relaxed">
        <i class="fa-solid fa-circle-info text-cb-accent flex-shrink-0 mt-0.5"></i>
        <p>Verified users get more trust, higher visibility, and access to premium features.</p>
      </div>

      <div v-if="vStore.userAccountType" class="flex items-start gap-3 p-3 bg-cb-field border border-cb-divider rounded-lg text-xs text-cb-muted leading-relaxed">
        <i class="fa-solid fa-user-tag text-cb-accent flex-shrink-0 mt-0.5"></i>
        <p>
          <span class="font-semibold text-cb-text capitalize">{{ vStore.userAccountType }}</span> account — 
          {{ vStore.userAccountType === 'corporate' ? 'Business verification documents accepted.' : 
             vStore.userAccountType === 'student' ? 'Student verification documents accepted.' : 
             'Personal verification documents accepted.' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-cb-text">
            Document Type <span class="text-cb-negative">*</span>
          </label>
          <DropDown
            :label="selectedDocLabel"
            :minWidth="240"
            class="w-full"
            bgClass="bg-cb-base"
            :borderClass="docTypeError ? 'border-cb-negative' : 'border-cb-divider'"
            textClass="text-cb-text"
          >
            <div class="py-1">
              <button
                v-for="opt in availableDocOptions"
                :key="opt.value"
                type="button"
                class="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left hover:bg-cb-field transition-colors"
                :class="form.docType === opt.value ? 'text-cb-accent font-semibold bg-cb-accent-subtle' : 'text-cb-text'"
                @click="selectDocType(opt.value)"
              >
                <span class="flex items-center gap-2">
                  <i :class="opt.icon" class="text-xs w-4 text-cb-muted flex-shrink-0"></i>
                  {{ opt.label }}
                </span>
                <i v-if="form.docType === opt.value" class="fa-solid fa-check text-cb-accent text-xs flex-shrink-0"></i>
              </button>
            </div>
          </DropDown>
          <p v-if="docTypeError" class="text-xs text-cb-negative">{{ docTypeError }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-cb-text">
            Upload Document <span class="text-cb-negative">*</span>
          </label>
          <div
            class="relative border-2 border-dashed rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center gap-1 cursor-pointer text-center transition-all min-h-[120px]"
            :class="{
              'border-cb-divider': !form.file && !isDragging,
              'border-cb-accent bg-cb-accent-subtle': form.file || isDragging
            }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*,.pdf"
              class="hidden"
              @change="onFileChange"
            />
            <template v-if="!form.file">
              <i class="fa-solid fa-cloud-arrow-up text-xl sm:text-2xl text-cb-muted mb-1"></i>
              <p class="text-sm font-semibold text-cb-text">Drag & drop or <span class="text-cb-accent">browse</span></p>
              <p class="text-xs text-cb-muted">JPG, PNG or PDF · Max 5MB</p>
            </template>
            <template v-else>
              <i class="fa-solid fa-file-circle-check text-xl sm:text-2xl text-cb-accent mb-1"></i>
              <p class="text-sm font-semibold text-cb-text break-all">{{ form.file.name }}</p>
              <p class="text-xs text-cb-muted">{{ formatFileSize(form.file.size) }}</p>
              <button 
                type="button" 
                class="absolute top-2 right-2 w-6 h-6 rounded-full bg-cb-negative text-white text-xs flex items-center justify-center hover:opacity-90 transition-opacity"
                @click.stop="removeFile"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </template>
          </div>
          <p v-if="fileError" class="text-xs text-cb-negative">{{ fileError }}</p>
        </div>

        <p v-if="vStore.error" class="text-xs text-cb-negative bg-cb-negative-subtle rounded-lg p-3">{{ vStore.error }}</p>

        <button 
          type="submit" 
          class="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cb-accent text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          :disabled="vStore.submitting || !form.file || !form.docType"
        >
          <span v-if="vStore.submitting">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...
          </span>
          <span v-else>
            <i class="fa-solid fa-paper-plane"></i>
            {{ vStore.isRejected ? 'Resubmit Document' : 'Submit for Verification' }}
          </span>
        </button>
      </form>
    </template>

    <template v-if="historyItems.length > 0">
      <div class="border-t border-cb-divider pt-4">
        <p class="text-xs font-bold uppercase tracking-wider text-cb-muted mb-2">Submission History</p>
        <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
          <div
            v-for="(sub, i) in historyItems"
            :key="sub._id || i"
            class="flex items-center gap-3 p-2.5 rounded-lg bg-cb-base"
          >
            <span 
              class="w-2 h-2 rounded-full flex-shrink-0"
              :class="{
                'bg-cb-positive': sub.status === 'verified',
                'bg-cb-warning': sub.status === 'pending',
                'bg-cb-negative': sub.status === 'rejected'
              }"
            ></span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-cb-text truncate">{{ formatDocType(sub.docType || sub.documentType) }}</p>
              <p v-if="sub.adminNote" class="text-xs text-cb-muted truncate italic">"{{ sub.adminNote }}"</p>
              <p class="text-xs text-cb-muted">{{ formatDate(sub.createdAt || sub.submittedAt) }}</p>
            </div>
            <span 
              class="text-[0.65rem] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
              :class="{
                'bg-cb-positive-subtle text-cb-positive': sub.status === 'verified',
                'bg-cb-warning-subtle text-cb-warning': sub.status === 'pending',
                'bg-cb-negative-subtle text-cb-negative': sub.status === 'rejected'
              }"
            >
              {{ sub.status || '—' }}
            </span>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useVerificationStore } from '@/stores/verificationStore'
import { useUserStore } from '@/stores/userStore'
import DropDown from '@/components/reusables/DropDownComponent.vue'

const vStore    = useVerificationStore()
const userStore = useUserStore()

// ── Document type registry ──────────────────────────────────
const allDocTypeOptions = [
  { value: 'national_id',  label: 'National ID',            icon: 'fa-solid fa-id-card'         },
  { value: 'nin',          label: 'NIN',                    icon: 'fa-solid fa-fingerprint'      },
  { value: 'passport',     label: 'International Passport', icon: 'fa-solid fa-passport'         },
  { value: 'voters_card',  label: "Voter's Card",           icon: 'fa-solid fa-check-to-slot'    },
  { value: 'student_id',   label: 'Student ID',             icon: 'fa-solid fa-graduation-cap'   },
  { value: 'cac',          label: 'CAC Certificate',        icon: 'fa-solid fa-building-columns' },
  { value: 'director_id',  label: 'Director ID',            icon: 'fa-solid fa-user-tie'         },
]

const allDocTypeMap = Object.fromEntries(allDocTypeOptions.map(o => [o.value, o.label]))

const availableDocOptions = computed(() => {
  const allowed = vStore.allowedDocTypes || []
  if (allowed.length === 0) return allDocTypeOptions
  return allowed.map(doc => {
    const existing = allDocTypeOptions.find(o => o.value === doc.docType)
    return existing || { value: doc.docType, label: doc.label, icon: 'fa-solid fa-file' }
  })
})

const selectedDocLabel = computed(() =>
  form.value.docType ? allDocTypeMap[form.value.docType] : 'Select document type'
)

function selectDocType(value) {
  form.value.docType = value
  docTypeError.value = ''
}

const rejectionNote = computed(() =>
  vStore.latestSubmission?.adminNote ||
  vStore.latestSubmission?.rejectionReason ||
  null
)

const fileInputRef = ref(null)
const isDragging   = ref(false)
const fileError    = ref('')
const docTypeError = ref('')
const submitted    = ref(false)
const phoneInput   = ref('')
const otpInput     = ref('')
const phoneError   = ref('')
const otpError     = ref('')

// Cooldown Logic: 10 minutes = 600 seconds
const displayCooldown = ref(0)
let timerInterval = null

function startCooldownTimer(seconds) {
  if (timerInterval) clearInterval(timerInterval)
  displayCooldown.value = seconds
  
  timerInterval = setInterval(() => {
    if (displayCooldown.value > 0) {
      displayCooldown.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

function formatCooldown(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}s`
}

const form = ref({ docType: '', file: null })

watch(
  () => vStore.isRejected,
  (isRejected) => {
    if (isRejected) {
      form.value = { docType: '', file: null }
      docTypeError.value = ''
      fileError.value = ''
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  },
  { immediate: true }
)

// Sync with store cooldown (if store handles it) or manually trigger on OTP send
watch(() => vStore.phoneOtpCooldown, (newVal) => {
  if (newVal > 0) startCooldownTimer(newVal)
})

const statusIcon = computed(() => {
  if (vStore.isVerified) return 'fa-solid fa-circle-check'
  if (vStore.isPending)  return 'fa-solid fa-clock'
  if (vStore.isRejected) return 'fa-solid fa-circle-xmark'
  return 'fa-solid fa-circle-question'
})

const statusLabel = computed(() => {
  if (vStore.isVerified) return 'Verified'
  if (vStore.isPending)  return 'Pending'
  if (vStore.isRejected) return 'Rejected'
  return 'Unverified'
})

const historyItems = computed(() => {
  if (vStore.submissions?.length) return vStore.submissions
  return vStore.status?.documents || []
})

async function handleSendOtp() {
  phoneError.value = ''
  if (!phoneInput.value) { phoneError.value = 'Enter a phone number'; return }

  let phone = phoneInput.value.trim().replace(/\s+/g, '')
  if (phone.startsWith('0')) phone = '+234' + phone.slice(1)
  else if (phone.startsWith('234') && !phone.startsWith('+')) phone = '+' + phone

  if (!/^\+[0-9]{10,15}$/.test(phone)) {
    phoneError.value = 'Enter a valid Nigerian phone number e.g. 08012345678'
    return
  }

  phoneInput.value = phone
  try {
    await vStore.sendPhoneOtp(phone)
    // Start 10-minute timer locally if store doesn't provide it immediately
    startCooldownTimer(600) 
  } catch {
    phoneError.value = vStore.error || 'Failed to send OTP'
  }
}

async function handleVerifyOtp() {
  otpError.value = ''
  if (!otpInput.value) { otpError.value = 'Enter the OTP'; return }
  try {
    await vStore.verifyPhoneOtp(otpInput.value)
    otpInput.value = ''
    if (timerInterval) clearInterval(timerInterval)
    displayCooldown.value = 0
  } catch {
    otpError.value = vStore.error || 'Invalid or expired OTP'
  }
}

function triggerFileInput() { fileInputRef.value?.click() }
function onFileChange(e) { validateAndSetFile(e.target.files[0]) }
function onDrop(e) { isDragging.value = false; validateAndSetFile(e.dataTransfer.files[0]) }

function validateAndSetFile(file) {
  fileError.value = ''
  if (!file) return
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (!allowed.includes(file.type)) { fileError.value = 'Only JPG, PNG, or PDF files are allowed'; return }
  if (file.size > 5 * 1024 * 1024)  { fileError.value = 'File must be under 5MB'; return }
  form.value.file = file
}

function removeFile() {
  form.value.file = null
  fileError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function handleSubmit() {
  docTypeError.value = ''
  if (!form.value.docType) { docTypeError.value = 'Please select a document type'; return }
  if (!form.value.file)    { fileError.value = 'Please upload a document'; return }

  const allowed = vStore.allowedDocTypes || []
  if (allowed.length > 0) {
    const allowedValues = allowed.map(d => d.docType)
    if (!allowedValues.includes(form.value.docType)) {
      docTypeError.value = 'This document type is not allowed for your account'
      return
    }
  }

  try {
    await vStore.submitVerification({ docType: form.value.docType, document: form.value.file })
    form.value = { docType: '', file: null }
    docTypeError.value = ''
    fileError.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
    submitted.value = true
  } catch {}
}

function formatDocType(type) {
  const map = {
    national_id:     'National ID',
    passport:        'International Passport',
    drivers_license: "Driver's License",
    voters_card:     "Voter's Card",
    student_id:      'Student ID',
    nin:             'NIN',
    cac:             'CAC Certificate',
    director_id:     'Director ID',
  }
  return map[type] || type || '—'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(async () => {
  const rawPhone = userStore.user?.phone || ''
  if (rawPhone) {
    let phone = rawPhone.trim().replace(/\s+/g, '')
    if (phone.startsWith('0')) phone = '+234' + phone.slice(1)
    else if (phone.startsWith('234') && !phone.startsWith('+')) phone = '+' + phone
    phoneInput.value = phone
  }

  await Promise.all([
    vStore.fetchVerificationStatus(),
    vStore.fetchMyVerifications(),
    vStore.fetchAllowedDocs(),
  ])
  
  if (vStore.phoneOtpCooldown > 0) startCooldownTimer(vStore.phoneOtpCooldown)
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>