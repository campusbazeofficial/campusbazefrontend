<template>
  <div class="relative flex flex-col gap-5">

    <!-- ── Skeleton ── -->
    <template v-if="initialLoading">
      <div class="h-52 rounded-2xl bg-[var(--color-cb-card)] animate-pulse"></div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-[var(--color-cb-card)] animate-pulse"></div>
      </div>
      <div class="h-28 rounded-2xl bg-[var(--color-cb-card)] animate-pulse"></div>
    </template>

    <template v-else-if="user">

      <!-- Saving toast -->
      <Transition name="toast">
        <div
          v-if="actionLoading"
          class="fixed top-4 inset-x-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-cb-card)] border border-[var(--color-cb-divider)] shadow-lg text-sm font-semibold text-[var(--color-cb-text)] lg:inset-x-auto lg:top-auto lg:bottom-6 lg:right-6 lg:w-auto"
        >
          <div class="w-4 h-4 rounded-full border-2 border-[var(--color-cb-divider)] border-t-[var(--color-cb-accent)] animate-spin flex-shrink-0"></div>
          {{ actionLabel }}
        </div>
      </Transition>

      <!-- ══ HERO ══════════════════════════════════ -->
      <div class="rounded-2xl bg-[var(--color-cb-card)] overflow-hidden">
        <!-- Cover -->
        <div class="h-24 bg-cb-accent relative">
          <span class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
            <i :class="tierIcon(user.subscriptionTier)"></i>
            {{ humanTier(user.subscriptionTier) }}
          </span>
        </div>

        <div class="px-5 pb-5">
          <!-- Avatar row -->
          <div class="flex items-end justify-between -mt-8 mb-3">
            <div class="relative flex-shrink-0">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-cb-accent)] border-4 border-[var(--color-cb-card)] overflow-hidden flex items-center justify-center">
                <img v-if="avatarSrc" :src="avatarSrc" alt="Profile" class="w-full h-full object-cover" />
                <span v-else class="text-2xl text-white">{{ initials }}</span>
              </div>
              <div class="absolute -bottom-1 -right-1 flex gap-1">
                <label class="w-7 h-7 rounded-full bg-[var(--color-cb-accent)] text-white flex items-center justify-center text-xs cursor-pointer border-2 border-[var(--color-cb-card)] hover:opacity-90 transition-opacity" title="Upload photo">
                  <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
                  <i class="fa-solid fa-camera"></i>
                </label>
                <button v-if="avatarSrc" class="w-7 h-7 rounded-full bg-[var(--color-cb-negative)] text-white flex items-center justify-center text-xs cursor-pointer border-2 border-[var(--color-cb-card)] hover:opacity-90 transition-opacity" title="Remove photo" @click="confirmDeleteAvatar">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            <!-- Right: View public profile + Edit -->
            <div class="flex items-center gap-2">
              <router-link
                v-if="user.slug"
                :to="{ name: 'ServiceProviderProfile', params: { identifier: user.slug } }"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-cb-divider)] text-xs font-semibold text-[var(--color-cb-muted)] hover:border-[var(--color-cb-accent)] hover:text-[var(--color-cb-accent)] transition-colors no-underline"
              >
                <i class="fa-solid fa-eye text-[10px]"></i>
                <span class="hidden sm:inline">View Profile</span>
              </router-link>
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-cb-accent text-xs font-semibold text-cb-contrast hover:opacity-90 transition-opacity" @click="startEditPersonal">
                <i class="fa-solid fa-pen"></i> Edit Profile
              </button>
            </div>
          </div>

          <!-- Name + badges -->
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <h1 class="text-xl text-[var(--color-cb-text)] leading-none">{{ user.displayName }}</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-cb-accent-subtle)] text-[var(--color-cb-accent)] capitalize">{{ user.role }}</span>
            <VerificationBadge :user="user" :company="company" :status="effectiveStatus" size="sm" />
          </div>
          <p class="text-sm text-[var(--color-cb-muted)] mb-3 break-all">{{ user.email }}</p>

          <!-- Status chips -->
          <div class="flex flex-wrap gap-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="user.isEmailVerified ? 'bg-[var(--color-cb-positive-subtle)] text-[var(--color-cb-positive)]' : 'bg-[var(--color-cb-negative-subtle)] text-[var(--color-cb-negative)]'">
              <i :class="user.isEmailVerified ? 'fa-solid fa-envelope-circle-check' : 'fa-solid fa-envelope'"></i>
              Email {{ user.isEmailVerified ? 'verified' : 'unverified' }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="user.isPhoneVerified ? 'bg-[var(--color-cb-positive-subtle)] text-[var(--color-cb-positive)]' : 'bg-[var(--color-cb-negative-subtle)] text-[var(--color-cb-negative)]'">
              <i :class="user.isPhoneVerified ? 'fa-solid fa-phone-volume' : 'fa-solid fa-phone'"></i>
              Phone {{ user.isPhoneVerified ? 'verified' : 'unverified' }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="user.identityVerificationStatus === 'verified' ? 'bg-[var(--color-cb-positive-subtle)] text-[var(--color-cb-positive)]' : 'bg-[var(--color-cb-warning-subtle)] text-[var(--color-cb-warning)]'">
              <i class="fa-solid fa-id-card"></i>
              Identity {{ user.identityVerificationStatus }}
            </span>
          </div>
        </div>
      </div>

      <!-- ══ COMPLETENESS ══════════════════════════ -->
      <div v-if="completenessPercent < 100" class="rounded-2xl bg-[var(--color-cb-card)] px-5 py-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-bold text-[var(--color-cb-text)]">Profile completeness</span>
          <span class="text-xs font-semibold text-[var(--color-cb-muted)]">{{ completenessPercent }}%</span>
        </div>
        <div class="h-1.5 w-full rounded-full bg-[var(--color-cb-field)] overflow-hidden">
          <div class="h-1.5 rounded-full bg-[var(--color-cb-accent)] transition-all duration-500" :style="{ width: completenessPercent + '%' }"></div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <span v-for="step in completenessSteps" :key="step.label" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" :class="step.done ? 'bg-[var(--color-cb-positive-subtle)] text-[var(--color-cb-positive)]' : 'bg-[var(--color-cb-field)] text-[var(--color-cb-muted)] border border-[var(--color-cb-divider)]'">
            <i :class="step.done ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i>
            {{ step.label }}
          </span>
        </div>

        <!-- Verification / completion CTAs — one per incomplete actionable step -->
        <div class="mt-4 space-y-2">

          <!-- Phone not added at all -->
          <div
            v-if="!user.phone"
            class="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-cb-divider)] bg-[var(--color-cb-field)] px-4 py-3"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-phone text-[var(--color-cb-muted)] text-sm shrink-0"></i>
              <p class="text-xs font-semibold text-[var(--color-cb-text)]">Add your phone number</p>
            </div>
            <button
              @click="startEditPersonal"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-cb-divider)] bg-[var(--color-cb-card)] px-3 py-1.5 text-xs font-bold text-[var(--color-cb-text)] hover:border-[var(--color-cb-accent)] hover:text-[var(--color-cb-accent)] transition-colors"
            >
              Add <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <!-- Phone added but not verified -->
          <div
            v-else-if="user.phone && !user.isPhoneVerified"
            class="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-cb-divider)] bg-[var(--color-cb-field)] px-4 py-3"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-phone text-[var(--color-cb-muted)] text-sm shrink-0"></i>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[var(--color-cb-text)]">Verify your phone number</p>
                <p class="text-[11px] text-[var(--color-cb-muted)]">{{ user.phone }}</p>
              </div>
            </div>
            <router-link
              to="/user/verification"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-cb-divider)] bg-[var(--color-cb-card)] px-3 py-1.5 text-xs font-bold text-[var(--color-cb-text)] hover:border-[var(--color-cb-accent)] hover:text-[var(--color-cb-accent)] transition-colors no-underline"
            >
              Verify <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </router-link>
          </div>

          <!-- Identity not verified -->
          <div
            v-if="user.identityVerificationStatus !== 'verified' && user.identityVerificationStatus !== 'pending'"
            class="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-cb-warning)]/30 bg-[var(--color-cb-warning-subtle)] px-4 py-3"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="fa-solid fa-shield-halved text-[var(--color-cb-warning)] text-sm shrink-0"></i>
              <p class="text-xs font-semibold text-[var(--color-cb-warning)]">Verify your identity to unlock all features</p>
            </div>
            <router-link
              to="/user/verification"
              class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-cb-warning)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity no-underline"
            >
              Verify <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </router-link>
          </div>

          <!-- Identity pending -->
          <div
            v-if="user.identityVerificationStatus === 'pending'"
            class="flex items-center gap-2.5 rounded-xl border border-[var(--color-cb-accent)]/20 bg-[var(--color-cb-accent-subtle)] px-4 py-3"
          >
            <i class="fa-solid fa-hourglass-half text-[var(--color-cb-accent)] text-sm shrink-0"></i>
            <p class="text-xs font-semibold text-[var(--color-cb-accent)]">Identity verification under review — we'll notify you once approved.</p>
          </div>
        </div>
      </div>

      <!-- ══ STATS — 3 tiles, no member card ════════ -->
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl bg-[var(--color-cb-card)] px-4 py-3 flex flex-col gap-0.5">
          <span class="text-lg text-[var(--color-cb-text)]">{{ user.averageRating != null ? user.averageRating.toFixed(1) : '—' }}</span>
          <span class="text-[0.65rem] uppercase tracking-widest font-semibold text-[var(--color-cb-muted)]">Rating</span>
        </div>
        <div class="rounded-xl bg-[var(--color-cb-card)] px-4 py-3 flex flex-col gap-0.5">
          <span class="text-lg text-[var(--color-cb-text)]">{{ user.totalReviews }}</span>
          <span class="text-[0.65rem] uppercase tracking-widest font-semibold text-[var(--color-cb-muted)]">Reviews</span>
        </div>
        <div class="rounded-xl bg-[var(--color-cb-card)] px-4 py-3 flex flex-col gap-0.5">
          <span class="text-lg text-[var(--color-cb-text)]">{{ user.totalOrdersCompleted }}</span>
          <span class="text-[0.65rem] uppercase tracking-widest font-semibold text-[var(--color-cb-muted)]">Completed</span>
        </div>
      </div>

      <!-- ══ REFERRAL ════════════════════════════════ -->
      <div class="rounded-xl bg-[var(--color-cb-accent-subtle)] px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-[var(--color-cb-accent)] mb-0.5 uppercase tracking-wider">Your referral code</p>
          <p class="text-base tracking-widest text-[var(--color-cb-text)]">{{ user.referralCode }}</p>
        </div>
        <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-cb-card)] border border-[var(--color-cb-divider)] text-xs font-bold text-[var(--color-cb-text)] hover:border-[var(--color-cb-accent)] transition-colors flex-shrink-0" @click="copy(user.referralCode)">
          <i :class="copied ? 'fa-solid fa-check text-[var(--color-cb-positive)]' : 'fa-solid fa-copy'"></i>
          {{ copied ? 'Copied!' : 'Copy link' }}
        </button>
      </div>

      <!-- ══ PERSONAL INFO ══════════════════════════ -->
      <div class="rounded-2xl bg-[var(--color-cb-card)] p-5 flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-text)]">
            <i class="fa-solid fa-user text-[var(--color-cb-accent)]"></i>
            Personal Information
          </h2>
          <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-cb-divider)] text-xs font-semibold text-[var(--color-cb-muted)] hover:border-[var(--color-cb-accent)] hover:text-[var(--color-cb-accent)] transition-colors" @click="startEditPersonal">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <!-- Row: First + Last name pushed to ends -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">First Name</p>
              <p class="text-sm text-[var(--color-cb-text)]">{{ user.firstName }}</p>
            </div>
            <div class="text-right">
              <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Last Name</p>
              <p class="text-sm text-[var(--color-cb-text)]">{{ user.lastName }}</p>
            </div>
          </div>
          <!-- Row: Display Name + Phone -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Display Name</p>
              <p class="text-sm text-[var(--color-cb-text)]">{{ user.displayName }}</p>
            </div>
            <div class="text-right">
              <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Phone</p>
              <p class="text-sm" :class="user.phone ? 'text-[var(--color-cb-text)]' : 'text-[var(--color-cb-muted)] italic'">{{ user.phone || 'Not added yet' }}</p>
            </div>
          </div>
          <!-- Institution + Student — students only (hidden for professional & corporate) -->
          <template v-if="user.isStudent">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Institution</p>
                <p class="text-sm text-[var(--color-cb-text)]">{{ user.institutionName || '—' }}</p>
              </div>
              <div class="text-right">
                <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Student</p>
                <p class="text-sm text-[var(--color-cb-text)]">Yes</p>
              </div>
            </div>
          </template>
          <!-- Bio — full width -->
          <div>
            <p class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5">Bio</p>
            <p class="text-sm" :class="user.bio ? 'text-[var(--color-cb-text)]' : 'text-[var(--color-cb-muted)] italic'">{{ user.bio || 'Tell people about yourself…' }}</p>
          </div>
        </div>
      </div>

      <!-- ══ QUICK LINKS to extracted pages ════════ -->
      <!-- <div class="rounded-2xl bg-[var(--color-cb-card)] overflow-hidden divide-y divide-[var(--color-cb-divider)]">
        <router-link
          v-for="link in settingsLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold text-[var(--color-cb-text)] hover:bg-[var(--color-cb-field)] transition-colors no-underline group"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" :class="link.iconBg">
            <i :class="[link.icon, link.iconColor, 'text-sm']"></i>
          </div>
          <span class="flex-1">{{ link.label }}</span>
          <i class="fa-solid fa-chevron-right text-[10px] text-[var(--color-cb-muted)] transition-transform group-hover:translate-x-0.5"></i>
        </router-link>
      </div> -->

    </template>

    <!-- Error -->
    <div v-else-if="userError" class="flex flex-col items-center gap-3 py-16 text-[var(--color-cb-negative)] text-sm text-center">
      <i class="fa-solid fa-circle-exclamation text-3xl"></i>
      <p>{{ userError }}</p>
      <button class="btn-save" @click="load">Try again</button>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed top-4 inset-x-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg lg:inset-x-auto lg:top-auto lg:bottom-6 lg:right-6 lg:w-auto" :class="toast.type === 'success' ? 'bg-[var(--color-cb-positive)]' : 'bg-[var(--color-cb-negative)]'">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"></i>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ══ CONFIRM DELETE AVATAR MODAL ═════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmDeleteAvatarOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="confirmDeleteAvatarOpen = false">
          <div class="w-full max-w-sm rounded-2xl bg-[var(--color-cb-card)] overflow-hidden shadow-2xl">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-cb-divider)]">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-cb-negative-subtle)]">
                <i class="fa-solid fa-trash text-sm text-[var(--color-cb-negative)]"></i>
              </div>
              <h3 class="text-sm font-bold text-[var(--color-cb-text)]">Remove profile photo?</h3>
            </div>
            <div class="px-5 py-4">
              <p class="text-sm text-[var(--color-cb-muted)]">Your profile photo will be removed and replaced with your initials. This cannot be undone.</p>
            </div>
            <div class="flex gap-2.5 px-5 pb-5">
              <button class="btn-cancel flex-1" @click="confirmDeleteAvatarOpen = false">Cancel</button>
              <button class="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[var(--color-cb-negative)] text-white hover:opacity-85 transition-opacity disabled:opacity-60" :disabled="actionLoading" @click="handleAvatarDelete">
                <i v-if="actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                <i v-else class="fa-solid fa-trash text-xs"></i>
                {{ actionLoading ? 'Removing…' : 'Remove photo' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ EDIT PROFILE MODAL ════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="editProfileModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @mousedown.self="closeEditModal">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEditModal"></div>
          <div class="edit-profile-modal relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[var(--color-cb-card)] shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh]">
            <div class="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
              <div class="w-10 h-1 rounded-full bg-[var(--color-cb-divider)]"></div>
            </div>
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cb-divider)] flex-shrink-0">
              <div>
                <h3 class="text-base font-bold text-[var(--color-cb-text)]">Edit Profile</h3>
                <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">Update your personal information.</p>
              </div>
              <button class="w-8 h-8 rounded-full bg-[var(--color-cb-field)] flex items-center justify-center text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] transition-colors" @click="closeEditModal">
                <i class="fa-solid fa-times text-sm"></i>
              </button>
            </div>
            <div class="overflow-y-auto flex-1 px-5 py-5">
              <form id="edit-profile-form" @submit.prevent="savePersonal" class="flex flex-col gap-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-[var(--color-cb-text)]">First Name</label>
                    <input v-model="personalForm.firstName" class="form-input" placeholder="First Name" required />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-[var(--color-cb-text)]">Last Name</label>
                    <input v-model="personalForm.lastName" class="form-input" placeholder="Last Name" required />
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">Display Name</label>
                  <input v-model="personalForm.displayName" class="form-input" placeholder="Display Name" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <label class="text-xs font-semibold text-[var(--color-cb-text)]">Bio</label>
                    <div class="flex items-center gap-2">
                      <button type="button" class="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-cb-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed" :disabled="bioGenerating" @click="handleGenerateBio">
                        <span v-if="bioGenerating" class="w-2.5 h-2.5 rounded-full border-2 border-[var(--color-cb-accent)]/30 border-t-[var(--color-cb-accent)] animate-spin"></span>
                        <span v-else>✨</span>
                        {{ bioGenerating ? 'Generating…' : 'AI bio' }}
                      </button>
                      <button v-if="generatedBio" type="button" class="text-xs font-semibold text-[var(--color-cb-muted)] hover:underline" @click="copyGeneratedBio">Copy</button>
                    </div>
                  </div>
                  <textarea v-model="personalForm.bio" class="form-input resize-y min-h-[80px]" placeholder="Tell people about yourself..." rows="3"></textarea>
                </div>
                <div v-if="user.isStudent" class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-[var(--color-cb-text)]">Institution</label>
                  <input v-model="personalForm.institutionName" class="form-input" placeholder="e.g. University of Lagos" />
                </div>
                <p v-if="saveError" class="text-xs text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] rounded-lg px-3 py-2">{{ saveError }}</p>
              </form>
            </div>
            <div class="flex items-center gap-3 px-5 py-4 border-t border-[var(--color-cb-divider)] flex-shrink-0">
              <button type="button" class="btn-cancel flex-1 sm:flex-none" @click="closeEditModal">Cancel</button>
              <button type="submit" form="edit-profile-form" class="btn-save flex-1 sm:flex-none justify-center" :disabled="actionLoading">
                <span v-if="actionLoading" class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useVerificationStore } from '@/stores/verificationStore'
import VerificationBadge from '@/components/profile/VerificationBadge.vue'

const userStore = useUserStore()
const vStore    = useVerificationStore()

const user        = computed(() => userStore.user)
const company     = computed(() => userStore.company)
const isCorporate = computed(() => userStore.isCorporate)
const userError   = computed(() => userStore.error)
const initialLoading = computed(() => userStore.loading && !user.value)

const actionLoading = ref(false)
const actionLabel   = ref('')
const saveError     = ref('')
const copied        = ref(false)
const generatedBio  = ref('')
const bioGenerating = ref(false)
const confirmDeleteAvatarOpen  = ref(false)
const editProfileModalOpen     = ref(false)
function confirmDeleteAvatar() { confirmDeleteAvatarOpen.value = true }
const personalForm  = ref({})
const toast = ref({ show: false, type: 'success', message: '' })

// ── Quick nav to extracted pages ───────────────────────────────
// const settingsLinks = [
//   { to: '/user/security',     label: 'Login & Security',  icon: 'fa-solid fa-shield-halved',   iconBg: 'bg-cb-accent-subtle',          iconColor: 'text-cb-accent' },
//   { to: '/user/verification', label: 'Identity Verification', icon: 'fa-solid fa-id-card',    iconBg: 'bg-cb-warning-subtle',         iconColor: 'text-cb-warning' },
//   { to: '/user/skills',       label: 'My Skills',         icon: 'fa-solid fa-code',            iconBg: 'bg-[#dbeafe]',                 iconColor: 'text-blue-600' },
//   { to: '/user/subscription-plans', label: 'Subscription Plans', icon: 'fa-solid fa-star',    iconBg: 'bg-cb-warning-subtle',         iconColor: 'text-cb-warning' },
// ]

// ── effectiveStatus — used by VerificationBadge ───────────────
// Always derived from user fields so the badge never flickers when
// vStore.status loads. vStore.status is only used for documents
// (corporate CAC check). Priority order matches VerificationBadge:
//
//  ① Gold  — identity + phone + email all verified (any role)
//  ② Corporate — corporate role + identity verified (phone optional)
//  ③ Student   — isStudent + identity verified (phone optional)
//  ④ ID Verified — professional + identity verified (phone optional)
//  ⑤ Basic — email + phone verified, no identity yet
const effectiveStatus = computed(() => {
  const u = user.value
  if (!u) return null

  const identityVerified = !!(u.identityVerificationBadge || u.identityVerificationStatus === 'verified')
  const phoneVerified    = !!u.isPhoneVerified
  const emailVerified    = !!u.isEmailVerified

  let verificationTierLabel = ''
  let verificationLevel     = -1

  // ① Fully verified — Gold (all three confirmed)
  if (identityVerified && phoneVerified && emailVerified) {
    verificationTierLabel = 'Tier 2 — Gold Verified'
    verificationLevel     = 2
  }
  // ③ Student — Blue (identity verified, phone not required)
  else if (identityVerified && u.isStudent) {
    verificationTierLabel = 'Tier 1A — Student Verified'
    verificationLevel     = 1
  }
  // ④ ID / Professional — Green (identity verified, phone not required)
  else if (identityVerified) {
    verificationTierLabel = 'Tier 1B — ID Verified'
    verificationLevel     = 1
  }
  // ⑤ Basic — Grey (email + phone only)
  else if (emailVerified && phoneVerified) {
    verificationTierLabel = 'Tier 0 — Basic'
    verificationLevel     = 0
  }

  // Corporate badge (②) is resolved by VerificationBadge checking
  // u.role === "corporate" && hasCacDoc on the documents array.
  // Synthesise a verified CAC entry so the badge shows immediately
  // before vStore.status loads, whenever identity is confirmed.
  let documents = vStore.status?.documents ?? []
  if (
    u.role === 'corporate' &&
    identityVerified &&
    !documents.some(d => d.docType === 'cac' && d.status === 'verified')
  ) {
    documents = [{ docType: 'cac', status: 'verified' }, ...documents]
  }

  return {
    verificationTierLabel,
    verificationLevel,
    isStudent:  u.isStudent ?? false,
    documents,
  }
})
function humanTier(tier) {
  const map = { free: 'Free', basic: 'Basic', pro: 'Pro', elite: 'Elite', corporate_free: 'Corporate Free', corporate_pro: 'Corporate Pro', corporate_elite: 'Corporate Elite' }
  return map[tier?.toLowerCase()] ?? (tier ?? 'Free')
}
function tierIcon(tier) {
  const t = tier?.toLowerCase() ?? 'free'
  if (t === 'elite' || t === 'corporate_elite') return 'fa-solid fa-gem text-purple-300'
  if (t === 'pro'   || t === 'corporate_pro')   return 'fa-solid fa-crown text-yellow-300'
  if (t === 'basic')                             return 'fa-solid fa-bolt text-sky-300'
  return 'fa-solid fa-circle text-white/60'
}
const avatarSrc = computed(() => { const a = user.value?.avatar; if (!a) return null; return typeof a === 'string' ? a : a?.url || null })
const initials  = computed(() => { const n = user.value?.displayName || ''; return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U' })

const memberMonths = computed(() => {
  if (!user.value?.createdAt) return '—'
  return Math.max(1, Math.floor((Date.now() - new Date(user.value.createdAt)) / (1000 * 60 * 60 * 24 * 30)))
})

const completenessSteps = computed(() => {
  if (!user.value) return []
  return [
    { label: 'Basic info',        done: !!(user.value.firstName && user.value.lastName) },
    { label: 'Email verified',    done: !!user.value.isEmailVerified },
    { label: 'Phone added',       done: !!user.value.phone },
    { label: 'Phone verified',    done: !!user.value.isPhoneVerified },
    { label: 'Identity verified', done: user.value.identityVerificationStatus === 'verified' },
    { label: 'Bio added',         done: !!user.value.bio },
  ]
})
const completenessPercent = computed(() => {
  const s = completenessSteps.value
  return s.length ? Math.round((s.filter(x => x.done).length / s.length) * 100) : 0
})

function showToast(type, message) { toast.value = { show: true, type, message }; setTimeout(() => { toast.value.show = false }, 3500) }
function copy(text) { navigator.clipboard.writeText(text); copied.value = true; setTimeout(() => { copied.value = false }, 2000) }

async function withOverlay(label, fn) { actionLabel.value = label; actionLoading.value = true; try { await fn() } finally { actionLoading.value = false; actionLabel.value = '' } }

// ── Edit profile ───────────────────────────────────────────────
function startEditPersonal() {
  personalForm.value = { firstName: user.value.firstName, lastName: user.value.lastName, displayName: user.value.displayName, phone: user.value.phone || '', bio: user.value.bio || '', institutionName: user.value.institutionName || '' }
  saveError.value = ''; generatedBio.value = ''; editProfileModalOpen.value = true
}
function closeEditModal() { if (actionLoading.value) return; editProfileModalOpen.value = false; saveError.value = '' }

async function savePersonal() {
  saveError.value = ''
  await withOverlay('Saving profile...', async () => {
    try {
      if (isCorporate.value) await userStore.updateCorporateMe(personalForm.value)
      else await userStore.updateMe(personalForm.value)
      if (userStore.profile?.user) { Object.assign(userStore.profile.user, personalForm.value); localStorage.setItem('user', JSON.stringify(userStore.profile.user)) }
      editProfileModalOpen.value = false
      showToast('success', 'Profile updated successfully')
    } catch (e) { saveError.value = e.response?.data?.message || 'Failed to save changes' }
  })
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0]; if (!file) return
  await withOverlay('Uploading photo...', async () => { try { await userStore.uploadAvatar(file); showToast('success', 'Profile photo updated') } catch { showToast('error', 'Failed to upload photo') } })
}
async function handleAvatarDelete() {
  await withOverlay('Removing photo...', async () => {
    try { await userStore.deleteAvatar(); showToast('success', 'Profile photo removed') }
    catch { showToast('error', 'Failed to remove photo') }
    finally { confirmDeleteAvatarOpen.value = false }
  })
}

async function handleGenerateBio() {
  if (bioGenerating.value) return; bioGenerating.value = true
  try { const res = await userStore.generateBio(); const bio = res?.bio || res?.data?.bio; if (bio) { personalForm.value.bio = bio; generatedBio.value = bio } }
  catch { showToast('error', 'Failed to generate bio') }
  finally { bioGenerating.value = false }
}
function copyGeneratedBio() { if (!generatedBio.value) return; navigator.clipboard.writeText(generatedBio.value); showToast('success', 'Generated bio copied') }

async function load() {
  await userStore.fetchMe()
  if (user.value) await vStore.fetchVerificationStatus()
}
onMounted(load)
</script>

<style scoped>
.form-input { width: 100%; background: var(--color-cb-base); border: 1.5px solid var(--color-cb-divider); border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.875rem; color: var(--color-cb-text); outline: none; box-sizing: border-box; transition: border-color 0.2s ease; }
.form-input:focus { border-color: var(--color-cb-accent); }
.form-input::placeholder { color: var(--color-cb-muted); }
.btn-cancel { padding: 0.6rem 1.25rem; border-radius: 8px; border: 1px solid var(--color-cb-divider); background: transparent; color: var(--color-cb-muted); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.2s ease; }
.btn-cancel:hover { background-color: var(--color-cb-field); }
.btn-save { display: inline-flex; align-items: center; gap: 6px; padding: 0.6rem 1.25rem; border-radius: 8px; border: none; background-color: var(--color-cb-accent); color: #fff; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s ease; }
.btn-save:hover { opacity: 0.88; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-1rem); }
@media (min-width: 1024px) { .toast-enter-from, .toast-leave-to { transform: translateY(1rem); } }
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .edit-profile-modal { animation: epSlideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1) both; }
.modal-leave-active .edit-profile-modal { animation: epSlideDown 0.18s ease both; }
@keyframes epSlideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes epSlideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(16px); opacity: 0; } }
</style>