<template>
  <AuthLayout
    :title="step === 0 ? 'Join Us' : step === 1 ? 'Personal Info' : 'More Details'"
    :subtitle="step === 0 ? 'Create a free account' : step === 1 ? 'Tell us about yourself' : 'Almost done!'"
  >

    <!-- Step indicator -->
    <div class="step-indicator" v-if="step > 0">
      <div v-for="i in totalSteps" :key="i" class="step-dot" :class="{ active: step >= i }"></div>
    </div>

    <!-- ── Step 0: Account type ── -->
    <template v-if="step === 0">
      <div class="form-header">
        <h2 class="form-title">Choose Account Type</h2>
        <p class="form-sub">Select the type of account you want to create.</p>
      </div>
      <div class="account-type-grid">
        <button type="button" class="account-type-card" :class="{ selected: accountType === 'individual' }" @click="accountType = 'individual'">
          <div class="account-type-icon"><i class="fa-solid fa-user"></i></div>
          <p class="account-type-label">Individual</p>
          <p class="account-type-sub">Student or freelancer</p>
        </button>
        <button type="button" class="account-type-card" :class="{ selected: accountType === 'corporate' }" @click="accountType = 'corporate'">
          <div class="account-type-icon"><i class="fa-solid fa-building"></i></div>
          <p class="account-type-label">Corporate</p>
          <p class="account-type-sub">Business or organization</p>
        </button>
      </div>
      <button class="auth-btn" :disabled="!accountType" @click="step = 1" style="margin-top: 1.5rem">Continue</button>
      <p class="auth-switch">
        Already have an account?
        <router-link to="/auth/login" class="switch-link">Back to Login</router-link>
      </p>
    </template>

    <!-- ── Step 1: Personal info ── -->
    <template v-if="step === 1">
      <div class="form-header">
        <h2 class="form-title">Personal Info</h2>
        <p class="form-sub">{{ accountType === 'individual' ? 'Fill in your personal details.' : "Fill in the account owner's details." }}</p>
      </div>
      <form @submit.prevent="goStep2" class="auth-form" novalidate>
        <div class="two-col">
          <AuthInput
            v-model="form.firstName"
            label="First Name"
            placeholder="First Name"
            :error="errors.firstName"
            @blur="validateField('firstName')"
          />
          <AuthInput
            v-model="form.lastName"
            label="Last Name"
            placeholder="Last Name"
            :error="errors.lastName"
            @blur="validateField('lastName')"
          />
        </div>
        <AuthInput
          v-model="form.email"
          label="Email Address"
          placeholder="Your Email Address"
          type="email"
          icon="fa-regular fa-envelope"
          autocomplete="email"
          :error="errors.email"
          @blur="validateField('email')"
        />
        <AuthInput
          v-model="form.phone"
          label="Phone Number"
          placeholder="+234 800 000 0000"
          type="tel"
          :error="errors.phone"
          @blur="validateField('phone')"
        />

        <template v-if="accountType === 'individual'">
          <div class="section-divider"><span>Student details</span></div>
          <div class="input-wrap">
            <label class="input-label">Are you a student?</label>
            <div class="toggle-row">
              <button type="button" class="toggle-btn" :class="{ active: form.isStudent === true }" @click="form.isStudent = true">Yes</button>
              <button type="button" class="toggle-btn" :class="{ active: form.isStudent === false }" @click="form.isStudent = false">No</button>
            </div>
          </div>
          <AuthInput
            v-if="form.isStudent"
            v-model="form.institutionName"
            label="Institution Name"
            placeholder="e.g. University of Lagos"
            :error="errors.institutionName"
            @blur="validateField('institutionName')"
          />
        </template>

        <div class="section-divider"><span>Location</span></div>
        <div class="two-col">
          <AuthInput
            v-model="form.locationState"
            label="State"
            placeholder="e.g. Lagos"
            :error="errors.locationState"
            @blur="validateField('locationState')"
          />
          <AuthInput
            v-model="form.locationLocalGovt"
            label="Local Govt Area"
            placeholder="e.g. Ikeja"
            :error="errors.locationLocalGovt"
            @blur="validateField('locationLocalGovt')"
          />
        </div>
        <AuthInput
          v-model="form.locationVillage"
          label="Village / Area (optional)"
          placeholder="e.g. Allen"
        />

        <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>
        <button type="submit" class="auth-btn" :disabled="!step1Valid">Save & Continue</button>
        <p class="auth-switch">
          <button type="button" class="switch-link btn-plain" @click="step = 0">
            <i class="fa fa-arrow-left"></i>
            Change account type</button>
        </p>
      </form>
    </template>

    <!-- ── Step 2: Password + company ── -->
    <template v-if="step === 2">
      <div class="form-header">
        <h2 class="form-title">{{ accountType === 'individual' ? 'Secure Account' : 'Company Details' }}</h2>
        <p class="form-sub">{{ accountType === 'individual' ? 'Set a strong password for your account.' : 'Tell us about your company.' }}</p>
      </div>
      <form @submit.prevent="handleRegister" class="auth-form" novalidate>

        <template v-if="accountType === 'individual'">
          <AuthInput
            v-model="form.password"
            label="Password"
            placeholder="Min. 8 characters"
            type="password"
            autocomplete="new-password"
            :error="errors.password"
            @blur="validateField('password')"
          />
          <!-- Password strength -->
          <div class="strength-wrap" v-if="form.password">
            <div class="strength-bars">
              <div v-for="i in 4" :key="i" class="strength-bar" :class="strengthClass(i)"></div>
            </div>
            <span class="strength-label">{{ strengthLabel }}</span>
          </div>
          <AuthInput
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="Repeat your password"
            type="password"
            :error="errors.confirmPassword"
            @blur="validateField('confirmPassword')"
          />
          <AuthInput v-model="form.referralCode" label="Referral Code (optional)" placeholder="Enter referral code" autocomplete="off" />
          <!-- Referral feedback -->

        </template>

        <template v-if="accountType === 'corporate'">
          <div class="section-divider"><span>Company info</span></div>
          <AuthInput v-model="form.companyName" label="Company Name" placeholder="e.g. TechNova Ltd" :error="errors.companyName" @blur="validateField('companyName')" />
          <AuthInput v-model="form.companyEmail" label="Company Email" placeholder="company@example.com" type="email" :error="errors.companyEmail" @blur="validateField('companyEmail')" />
          <AuthInput v-model="form.companyPhone" label="Company Phone" placeholder="+234 800 000 0000" />
          <AuthInput v-model="form.rcNumber" label="RC Number" placeholder="RC1234567" :error="errors.rcNumber" @blur="validateField('rcNumber')" />
          <div class="two-col">
            <AuthInput v-model="form.industry" label="Industry" placeholder="e.g. Technology" />
            <AuthInput v-model="form.website" label="Website (optional)" placeholder="https://yourcompany.com" :error="errors.website" @blur="validateField('website')" />
          </div>
          <div class="two-col">
            <AuthInput v-model="form.country" label="Country" placeholder="Nigeria" />
            <AuthInput v-model="form.locationState" label="State" placeholder="e.g. Lagos" :error="errors.locationState" @blur="validateField('locationState')" />
          </div>
          <div class="two-col">
            <AuthInput v-model="form.locationLocalGovt" label="Local Govt Area" placeholder="e.g. Ikeja" :error="errors.locationLocalGovt" @blur="validateField('locationLocalGovt')" />
            <AuthInput v-model="form.locationVillage" label="Village / Area (optional)" placeholder="e.g. Allen" />
          </div>
          <div class="section-divider"><span>Security</span></div>
          <AuthInput
            v-model="form.password"
            label="Password"
            placeholder="Min. 8 characters"
            type="password"
            autocomplete="new-password"
            :error="errors.password"
            @blur="validateField('password')"
          />
          <div class="strength-wrap" v-if="form.password">
            <div class="strength-bars">
              <div v-for="i in 4" :key="i" class="strength-bar" :class="strengthClass(i)"></div>
            </div>
            <span class="strength-label">{{ strengthLabel }}</span>
          </div>
          <AuthInput
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="Repeat your password"
            type="password"
            :error="errors.confirmPassword"
            @blur="validateField('confirmPassword')"
          />
          <AuthInput v-model="form.referralCode" label="Referral Code (optional)" placeholder="Enter referral code" autocomplete="off" />

        </template>

        <!-- Terms checkbox -->
        <AuthCheckbox
          v-model="form.agreedToTerms"
          class="terms-checkbox"
        >
          <template #label>
            By creating an account you agree to our
            <router-link to="/terms-of-service" class="switch-link" @click.stop>Terms of Service</router-link>
            and
            <router-link to="/privacy-policy" class="switch-link" @click.stop>Privacy Policy</router-link>.
          </template>
        </AuthCheckbox>
        <p v-if="errors.agreedToTerms" class="field-error">{{ errors.agreedToTerms }}</p>

        <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>

        <button type="submit" class="auth-btn" :disabled="authStore.loading || !step2Valid">
          <span v-if="!authStore.loading">Create Account</span>
          <span v-else class="btn-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Creating...</span>
        </button>
        <p class="auth-switch">
          <button type="button" class="switch-link btn-plain" @click="step = 1">
             <i class="fa fa-arrow-left"></i>
            Back</button>
        </p>
      </form>
    </template>

  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthInput from '@/components/auth/AuthInput.vue'
import AuthCheckbox from '@/components/auth/AuthCheckbox.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const step = ref(0)
const totalSteps = 2
const accountType = ref(null)
const errors = ref({})
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  isStudent: true,
  institutionName: '',
  password: '',
  confirmPassword: '',
  referralCode: route.query.ref?.toString() || '',
  agreedToTerms: false,
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  rcNumber: '',
  industry: '',
  website: '',
  country: 'Nigeria',
  state: '',
  locationState: '',
  locationLocalGovt: '',
  locationVillage: '',
})
// referralCode is a plain optional field — no live validation, just submitted with the form

// ── Inline validation ──
function validateField(field) {
  const v = form.value
  const e = errors.value

  if (field === 'firstName') {
    if (!v.firstName.trim()) e.firstName = 'First name is required'
    else if (v.firstName.trim().length < 2) e.firstName = 'First name must be at least 2 characters'
    else if (/[^a-zA-Z\s'-]/.test(v.firstName)) e.firstName = 'First name can only contain letters, spaces, hyphens or apostrophes'
    else e.firstName = ''
  }
  if (field === 'lastName') {
    if (!v.lastName.trim()) e.lastName = 'Last name is required'
    else if (v.lastName.trim().length < 2) e.lastName = 'Last name must be at least 2 characters'
    else if (/[^a-zA-Z\s'-]/.test(v.lastName)) e.lastName = 'Last name can only contain letters, spaces, hyphens or apostrophes'
    else e.lastName = ''
  }
  if (field === 'email') {
    if (!v.email.trim()) e.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Enter a valid email address (e.g. you@example.com)'
    else e.email = ''
  }
  if (field === 'phone') {
    const phone = v.phone.replace(/\s/g, '')
    if (!phone) e.phone = 'Phone number is required'
    else if (!/^\+?[0-9]{7,15}$/.test(phone)) e.phone = 'Enter a valid phone number (7–15 digits, optionally starting with +)'
    else e.phone = ''
  }
  if (field === 'institutionName') {
    e.institutionName = (v.isStudent && !v.institutionName.trim()) ? 'Institution name is required for students' : ''
  }
  if (field === 'password') {
    if (!v.password) e.password = 'Password is required'
    else if (v.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(v.password)) e.password = 'Password must include at least one uppercase letter'
    else if (!/[0-9]/.test(v.password)) e.password = 'Password must include at least one number'
    else e.password = ''
    if (v.confirmPassword) validateField('confirmPassword')
  }
  if (field === 'confirmPassword') {
    e.confirmPassword = v.confirmPassword !== v.password ? 'Passwords do not match' : ''
  }
  if (field === 'companyName') {
    e.companyName = v.companyName.trim() ? '' : 'Company name is required'
  }
  if (field === 'companyEmail') {
    if (!v.companyEmail.trim()) e.companyEmail = 'Company email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.companyEmail.trim())) e.companyEmail = 'Enter a valid company email address'
    else e.companyEmail = ''
  }
  if (field === 'rcNumber') {
    if (!v.rcNumber.trim()) e.rcNumber = 'RC number is required'
    else if (!/^RC?\d{5,10}$/i.test(v.rcNumber.trim())) e.rcNumber = 'Enter a valid RC number (e.g. RC1234567)'
    else e.rcNumber = ''
  }
  if (field === 'locationState') {
    e.locationState = v.locationState.trim() ? '' : 'State is required'
  }
  if (field === 'locationLocalGovt') {
    e.locationLocalGovt = v.locationLocalGovt.trim() ? '' : 'Local Government Area is required'
  }
  if (field === 'website') {
    if (!v.website.trim()) { e.website = ''; return }
    if (!v.website.trim().startsWith('https://')) {
      e.website = 'Website must begin with https:// — e.g. https://yourcompany.com'
    } else {
      try {
        new URL(v.website.trim())
        e.website = ''
      } catch {
        e.website = 'Enter a valid website URL (e.g. https://yourcompany.com)'
      }
    }
  }
}

// ── Password strength ──
const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.value])

function strengthClass(bar) {
  const s = passwordStrength.value
  if (bar > s) return ''
  if (s <= 1) return 'weak'
  if (s === 2) return 'fair'
  if (s === 3) return 'good'
  return 'strong'
}

// ── Step validity (drives disabled states) ──
const step1Valid = computed(() => {
  const v = form.value
  const noErrors = !['firstName','lastName','email','phone','institutionName','locationState','locationLocalGovt'].some(f => errors.value[f])
  const hasBasic = v.firstName.trim().length >= 2 && v.lastName.trim().length >= 2
    && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())
    && /^\+?[0-9]{7,15}$/.test(v.phone.replace(/\s/g, ''))
  const hasStudent = accountType.value !== 'individual' || !v.isStudent || v.institutionName.trim().length > 0
  const hasLocation = v.locationState.trim().length > 0 && v.locationLocalGovt.trim().length > 0
  return hasBasic && hasStudent && hasLocation && noErrors
})

const step2Valid = computed(() => {
  const v = form.value
  const strongPass = v.password.length >= 8 && /[A-Z]/.test(v.password) && /[0-9]/.test(v.password)
  const passOk = strongPass && v.confirmPassword === v.password
  const termsOk = v.agreedToTerms
  const websiteOk = !v.website.trim() || (v.website.trim().startsWith('https://') && (() => { try { new URL(v.website.trim()); return true } catch { return false } })())
  if (accountType.value === 'corporate') {
    return passOk && termsOk && websiteOk
      && v.companyName.trim().length > 0
      && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.companyEmail.trim())
      && /^RC?\d{5,10}$/i.test(v.rcNumber.trim())
      && v.locationState.trim().length > 0
      && v.locationLocalGovt.trim().length > 0
  }
  return passOk && termsOk
})

// ── Step 1 submit ──
function goStep2() {
  errors.value = {}
  ;['firstName', 'lastName', 'email', 'phone', 'locationState', 'locationLocalGovt'].forEach(validateField)
  if (accountType.value === 'individual' && form.value.isStudent) validateField('institutionName')
  const hasErrors = ['firstName', 'lastName', 'email', 'phone', 'institutionName', 'locationState', 'locationLocalGovt'].some(f => errors.value[f])
  if (!hasErrors) step.value = 2
}

// ── Step 2 submit ──
async function handleRegister() {
  errors.value = {}
  ;['password', 'confirmPassword'].forEach(validateField)
  if (accountType.value === 'corporate') {
    ;['companyName', 'companyEmail', 'rcNumber', 'website'].forEach(validateField)
  }
  if (!form.value.agreedToTerms) {
    errors.value.agreedToTerms = 'You must agree to the terms to continue'
  }
  const hasErrors = Object.values(errors.value).some(Boolean)
  if (hasErrors) return

  try {
    if (accountType.value === 'individual') {
      await authStore.registerIndividual({
        firstName: form.value.firstName.trim(),
        lastName: form.value.lastName.trim(),
        email: form.value.email.trim().toLowerCase(),
        password: form.value.password,
        phone: form.value.phone.trim(),
        isStudent: form.value.isStudent,
        institutionName: form.value.isStudent ? form.value.institutionName.trim() : undefined,
        referralCode: form.value.referralCode.trim() || undefined,
        location: {
          state: form.value.locationState.trim(),
          localGovt: form.value.locationLocalGovt.trim(),
          ...(form.value.locationVillage.trim() && { village: form.value.locationVillage.trim() }),
        },
      })
    } else {
      await authStore.registerCorporate({
        firstName: form.value.firstName.trim(),
        lastName: form.value.lastName.trim(),
        email: form.value.email.trim().toLowerCase(),
        password: form.value.password,
        phone: form.value.phone.trim(),
        companyName: form.value.companyName.trim(),
        companyEmail: form.value.companyEmail.trim().toLowerCase(),
        companyPhone: form.value.companyPhone.trim() || undefined,
        rcNumber: form.value.rcNumber.trim(),
        industry: form.value.industry.trim() || undefined,
        website: form.value.website.trim() || undefined,
        country: form.value.country.trim() || 'Nigeria',
        referralCode: form.value.referralCode.trim() || undefined,
        location: {
          state: form.value.locationState.trim(),
          localGovt: form.value.locationLocalGovt.trim(),
          ...(form.value.locationVillage.trim() && { village: form.value.locationVillage.trim() }),
        },
      })
    }
    router.push({ path: '/auth/verify-email', query: { email: form.value.email.trim().toLowerCase() } })
  } catch (e) {
    errors.value.general = getErrorMessage(e, 'register', 'Registration failed. Please try again.')
  }
}
</script>

<style scoped>
@import '@/assets/auth-shared.css';

.account-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.account-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  border-radius: 14px;
  background: var(--color-cb-base);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.account-type-card.selected {
  border-color: var(--color-cb-accent);
  background-color: var(--color-cb-accent-subtle);
}

.account-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background-color 0.2s ease;
}

.account-type-card.selected .account-type-icon {
  background-color: var(--color-cb-accent);
  color: #ffffff;
}

.account-type-label { font-size: 0.9rem; font-weight: 700; color: var(--color-cb-text); margin: 0; }
.account-type-sub { font-size: 0.75rem; color: var(--color-cb-muted); margin: 0; text-align: center; }

.input-wrap { display: flex; flex-direction: column; gap: 6px; }
.input-label { font-size: 0.8rem; font-weight: 600; color: var(--color-cb-text); }

.toggle-row { display: flex; gap: 0.5rem; }

.toggle-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1.5px solid var(--color-cb-divider);
  background: transparent;
  color: var(--color-cb-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.toggle-btn.active {
  border-color: var(--color-cb-accent);
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
}

.strength-wrap { display: flex; align-items: center; gap: 0.75rem; margin-top: -0.25rem; }
.strength-bars { display: flex; gap: 4px; flex: 1; }
.strength-bar { height: 4px; flex: 1; border-radius: 2px; background-color: var(--color-cb-divider); transition: background-color 0.3s ease; }
.strength-bar.weak   { background-color: var(--color-cb-negative); }
.strength-bar.fair   { background-color: var(--color-cb-warning); }
.strength-bar.good   { background-color: var(--color-cb-accent); }
.strength-bar.strong { background-color: var(--color-cb-positive); }
.strength-label { font-size: 0.72rem; font-weight: 600; color: var(--color-cb-muted); min-width: 36px; }

.terms-checkbox { margin-top: 0.25rem; }
.field-error { font-size: 0.75rem; color: var(--color-cb-negative); margin: -0.5rem 0 0; }
.btn-plain { background: none; border: none; cursor: pointer; font-family: var(--font-sans); padding: 0; }

</style>