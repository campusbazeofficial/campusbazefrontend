<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Header -->
    <header
      class="sticky -top-8 z-10 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3 py-3">
        <button
          @click="router.back()"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
        >
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <div>
          <h1 class="text-base font-bold text-cb-text">Login & Security</h1>
          <p class="text-[11px] text-cb-muted">
            Manage your sessions and account
          </p>
        </div>
      </div>
    </header>

    <div class="mx-auto max-w-7xl py-5 space-y-5">
      <!-- ── Account Details ── -->
      <section
        class="rounded-2xl bg-[var(--color-cb-card)] border border-[var(--color-cb-divider)] p-5"
      >
        <h2
          class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-text)] mb-5"
        >
          <i
            class="fa-solid fa-shield-halved text-[var(--color-cb-accent)]"
          ></i>
          Account Details
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Email
            </p>
            <p class="text-sm text-[var(--color-cb-text)] break-all">
              {{ user?.email }}
            </p>
          </div>
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Role
            </p>
            <p class="text-sm text-[var(--color-cb-text)] capitalize">
              {{ user?.role }}
            </p>
          </div>
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Subscription
            </p>
            <p class="text-sm text-[var(--color-cb-text)]">
              {{ humanTier(user?.subscriptionTier) }}
            </p>
          </div>
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Status
            </p>
            <p
              class="text-sm text-[var(--color-cb-text)] flex items-center gap-1.5"
            >
              <span
                class="w-2 h-2 rounded-full inline-block"
                :class="
                  user?.isActive
                    ? 'bg-[var(--color-cb-positive)]'
                    : 'bg-[var(--color-cb-muted)]'
                "
              ></span>
              {{ user?.isActive ? "Active" : "Inactive" }}
            </p>
          </div>
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Member Since
            </p>
            <p class="text-sm text-[var(--color-cb-text)]">
              {{ formatDate(user?.createdAt) }}
            </p>
          </div>
          <div>
            <p
              class="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--color-cb-muted)] mb-0.5"
            >
              Last Seen
            </p>
            <p class="text-sm text-[var(--color-cb-text)]">
              {{ formatDate(user?.lastSeen) }}
            </p>
          </div>
        </div>
        <!-- Change Password Button -->
        <div
          class="border-t border-[var(--color-cb-divider)] pt-4 mt-5 flex items-center justify-between gap-4 flex-wrap"
        >
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--color-cb-text)]">
              Password
            </p>
            <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">
              Update your account password
            </p>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-[var(--color-cb-accent)] text-[var(--color-cb-accent)] bg-[var(--color-cb-accent-subtle)] hover:opacity-80 transition-opacity flex-shrink-0"
            @click="changePasswordModalOpen = true"
          >
            <i class="fa-solid fa-key"></i> Change Password
          </button>
        </div>
      </section>

      <!-- ── Active Sessions ── -->
      <section
        class="rounded-2xl bg-[var(--color-cb-card)] border border-[var(--color-cb-divider)] p-5"
      >
        <div class="flex items-center justify-between mb-5">
          <h2
            class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-text)]"
          >
            <i class="fa-solid fa-laptop text-[var(--color-cb-accent)]"></i>
            Active Sessions
          </h2>
          <span
            class="text-xs font-semibold text-[var(--color-cb-muted)] bg-[var(--color-cb-field)] px-3 py-1 rounded-full"
          >
            {{ sessions.length }} session{{ sessions.length !== 1 ? "s" : "" }}
          </span>
        </div>

        <!-- Loading -->
        <div
          v-if="sessionsLoading"
          class="flex items-center gap-3 text-sm text-[var(--color-cb-muted)] py-2"
        >
          <div
            class="w-4 h-4 rounded-full border-2 border-[var(--color-cb-divider)] border-t-[var(--color-cb-accent)] animate-spin flex-shrink-0"
          ></div>
          Loading sessions…
        </div>

        <!-- Empty -->
        <div
          v-else-if="sessions.length === 0"
          class="flex flex-col items-center gap-2 py-8 text-[var(--color-cb-muted)] text-sm text-center"
        >
          <i
            class="fa-solid fa-shield-halved text-2xl text-[var(--color-cb-divider)]"
          ></i>
          <p>No active sessions found.</p>
        </div>

        <!-- Sessions list -->
        <div v-else class="flex flex-col gap-3 max-h-96 overflow-y-auto pr-0.5">
          <div
            v-for="session in sessions"
            :key="session._id"
            class="flex gap-3 p-3.5 rounded-xl bg-[var(--color-cb-base)] border border-[var(--color-cb-divider)]"
          >
            <div
              class="w-9 h-9 rounded-xl bg-[var(--color-cb-accent-subtle)] text-[var(--color-cb-accent)] flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            >
              <i :class="getDeviceIcon(session.deviceInfo)"></i>
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <p
                  class="text-sm font-semibold text-[var(--color-cb-text)] truncate flex-1 min-w-0"
                >
                  {{ formatDevice(session.deviceInfo) }}
                </p>
                <span
                  class="w-2 h-2 rounded-full bg-[var(--color-cb-positive)] flex-shrink-0"
                  title="Active"
                ></span>
              </div>
              <div
                class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[var(--color-cb-muted)]"
              >
                <span v-if="session.ipAddress === '::1'"
                  ><i class="fa-solid fa-location-dot mr-1"></i>Local</span
                >
                <span v-else
                  ><i class="fa-solid fa-location-dot mr-1"></i
                  >{{
                    session.location && session.location !== "Unknown location"
                      ? session.location
                      : "Unknown location"
                  }}</span
                >
                <span v-if="session.ipAddress && session.ipAddress !== '::1'"
                  ><i class="fa-solid fa-server mr-1"></i
                  >{{ session.ipAddress }}</span
                >
                <span v-if="session.createdAt"
                  ><i class="fa-regular fa-clock mr-1"></i
                  >{{ formatDate(session.createdAt) }}</span
                >
              </div>
              <div class="flex items-center justify-between mt-0.5">
                <span
                  v-if="session.isCurrent"
                  class="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-[var(--color-cb-positive)] bg-[var(--color-cb-positive-subtle)] px-2 py-0.5 rounded-full"
                >
                  <i class="fa-solid fa-circle-check text-[0.55rem]"></i>
                  Current session
                </span>
                <button
                  v-else
                  class="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] px-2.5 py-1 rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="revokingIds.includes(session._id)"
                  @click="revokeSession(session._id)"
                >
                  <i
                    :class="
                      revokingIds.includes(session._id)
                        ? 'fa-solid fa-spinner animate-spin text-[0.65rem]'
                        : 'fa-solid fa-right-from-bracket text-[0.65rem]'
                    "
                  ></i>
                  {{
                    revokingIds.includes(session._id) ? "Revoking…" : "Revoke"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-[var(--color-cb-muted)] mt-4">
          <i class="fa-solid fa-circle-info mr-1"></i>Revoke any session you
          don't recognise immediately.
        </p>

        <!-- Logout all -->
        <div
          class="border-t border-[var(--color-cb-divider)] pt-4 mt-4 flex items-center justify-between gap-4 flex-wrap"
        >
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--color-cb-text)]">
              Logout all sessions
            </p>
            <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">
              Signs you out from every device at once.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border border-[var(--color-cb-negative)] text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            :disabled="loggingOutAll"
            @click="handleLogoutAll"
          >
            <i
              :class="
                loggingOutAll
                  ? 'fa-solid fa-spinner animate-spin'
                  : 'fa-solid fa-arrow-right-from-bracket'
              "
            ></i>
            {{ loggingOutAll ? "Signing out…" : "Logout all devices" }}
          </button>
        </div>
      </section>

      <!-- ── Danger Zone ── -->
      <section class="rounded-2xl bg-[var(--color-cb-card)] p-5">
        <h2
          class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-negative)] mb-4"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          Danger Zone
        </h2>
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--color-cb-text)]">
              Delete my account
            </p>
            <p class="text-xs text-[var(--color-cb-muted)] mt-0.5">
              Permanently removes your account and all associated data. Cannot
              be undone.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[var(--color-cb-negative)] text-white hover:opacity-85 transition-opacity flex-shrink-0"
            @click="deleteAccountModalOpen = true"
          >
            <i class="fa-solid fa-trash"></i> Delete account
          </button>
        </div>
      </section>

      <div class="h-6"></div>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-4 inset-x-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg lg:inset-x-auto lg:top-auto lg:bottom-6 lg:right-6 lg:w-auto"
        :class="
          toast.type === 'success'
            ? 'bg-[var(--color-cb-positive)]'
            : 'bg-[var(--color-cb-negative)]'
        "
      >
        <i
          :class="
            toast.type === 'success'
              ? 'fa-solid fa-circle-check'
              : 'fa-solid fa-circle-exclamation'
          "
        ></i>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Change Password Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="changePasswordModalOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="closeChangePasswordModal"
        >
          <div
            class="w-full max-w-md rounded-2xl bg-[var(--color-cb-card)] flex flex-col overflow-hidden shadow-2xl"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cb-divider)] bg-[var(--color-cb-accent-subtle)]"
            >
              <h3
                class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-accent)]"
              >
                <i class="fa-solid fa-key"></i> Change Password
              </h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] text-sm"
                @click="closeChangePasswordModal"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form
              @submit.prevent="handleChangePassword"
              class="px-5 py-5 flex flex-col gap-4"
            >
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[var(--color-cb-text)]"
                  >Current Password</label
                >
                <div class="relative">
                  <input
                    v-model="changePasswordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    placeholder="Enter current password"
                    class="form-input pr-10"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] transition-colors"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i
                      :class="
                        showCurrentPassword
                          ? 'fa-solid fa-eye-slash'
                          : 'fa-solid fa-eye'
                      "
                    ></i>
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[var(--color-cb-text)]"
                  >New Password</label
                >
               <div class="relative">
  <input v-model="changePasswordForm.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="Min. 8 characters" class="form-input pr-10" autocomplete="new-password" />
  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] transition-colors" @click="showNewPassword = !showNewPassword">
    <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
  </button>
</div>
                <!-- Password strength -->
                <div
                  class="strength-wrap"
                  v-if="changePasswordForm.newPassword"
                >
                  <div class="strength-bars">
                    <div
                      v-for="i in 4"
                      :key="i"
                      class="strength-bar"
                      :class="changePasswordStrengthClass(i)"
                    ></div>
                  </div>
                  <span class="strength-label">{{
                    changePasswordStrengthLabel
                  }}</span>
                </div>
                <div class="flex flex-col gap-1 mt-1">
                  <div
                    class="flex items-center gap-2 text-xs"
                    :class="
                      changePasswordForm.newPassword.length >= 8
                        ? 'text-[var(--color-cb-positive)]'
                        : 'text-[var(--color-cb-muted)]'
                    "
                  >
                    <i
                      :class="
                        changePasswordForm.newPassword.length >= 8
                          ? 'fa-solid fa-circle-check'
                          : 'fa-regular fa-circle'
                      "
                    ></i>
                    At least 8 characters
                  </div>
                  <div
                    class="flex items-center gap-2 text-xs"
                    :class="
                      /[A-Z]/.test(changePasswordForm.newPassword)
                        ? 'text-[var(--color-cb-positive)]'
                        : 'text-[var(--color-cb-muted)]'
                    "
                  >
                    <i
                      :class="
                        /[A-Z]/.test(changePasswordForm.newPassword)
                          ? 'fa-solid fa-circle-check'
                          : 'fa-regular fa-circle'
                      "
                    ></i>
                    One uppercase letter
                  </div>
                  <div
                    class="flex items-center gap-2 text-xs"
                    :class="
                      /[0-9]/.test(changePasswordForm.newPassword)
                        ? 'text-[var(--color-cb-positive)]'
                        : 'text-[var(--color-cb-muted)]'
                    "
                  >
                    <i
                      :class="
                        /[0-9]/.test(changePasswordForm.newPassword)
                          ? 'fa-solid fa-circle-check'
                          : 'fa-regular fa-circle'
                      "
                    ></i>
                    One number
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[var(--color-cb-text)]"
                  >Confirm New Password</label
                >
              <div class="relative">
  <input v-model="changePasswordForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Repeat new password" class="form-input pr-10" :class="changePasswordForm.confirmPassword && changePasswordForm.confirmPassword !== changePasswordForm.newPassword ? 'border-[var(--color-cb-negative)]' : ''" autocomplete="new-password" />
  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] transition-colors" @click="showConfirmPassword = !showConfirmPassword">
    <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
  </button>
</div>
                <p
                  v-if="
                    changePasswordForm.confirmPassword &&
                    changePasswordForm.confirmPassword !==
                      changePasswordForm.newPassword
                  "
                  class="text-xs text-[var(--color-cb-negative)]"
                >
                  Passwords do not match
                </p>
              </div>
              <p
                v-if="changePasswordError"
                class="text-xs text-[var(--color-cb-negative)] bg-[var(--color-cb-negative-subtle)] px-3 py-2 rounded-lg"
              >
                {{ changePasswordError }}
              </p>
            </form>
            <div
              class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-5 py-4 border-t border-[var(--color-cb-divider)]"
            >
              <button
                class="btn-cancel w-full sm:w-auto"
                :disabled="changingPassword"
                @click="closeChangePasswordModal"
              >
                Cancel
              </button>
              <button
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-[var(--color-cb-accent)] text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="!isChangePasswordValid || changingPassword"
                @click="handleChangePassword"
              >
                <i
                  :class="
                    changingPassword
                      ? 'fa-solid fa-spinner animate-spin'
                      : 'fa-solid fa-key'
                  "
                ></i>
                {{ changingPassword ? "Updating…" : "Update Password" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="deleteAccountModalOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="deleteAccountModalOpen = false"
        >
          <div
            class="w-full max-w-md rounded-2xl bg-[var(--color-cb-card)] flex flex-col overflow-hidden shadow-2xl"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-[var(--color-cb-divider)] bg-[var(--color-cb-negative-subtle)]"
            >
              <h3
                class="flex items-center gap-2 text-sm font-bold text-[var(--color-cb-negative)]"
              >
                <i class="fa-solid fa-triangle-exclamation"></i> Delete Account
              </h3>
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-cb-muted)] hover:text-[var(--color-cb-text)] text-sm"
                @click="
                  deleteAccountModalOpen = false;
                  confirmationText = '';
                "
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="px-5 py-5 flex flex-col gap-4">
              <p class="text-sm text-[var(--color-cb-muted)] leading-relaxed">
                This will
                <strong class="text-[var(--color-cb-text)]"
                  >permanently delete</strong
                >
                your account and all associated data. This action is
                <strong class="text-[var(--color-cb-negative)]"
                  >irreversible</strong
                >.
              </p>
              <div
                class="rounded-xl bg-[var(--color-cb-base)] border border-[var(--color-cb-divider)] px-3.5 py-3 text-xs text-[var(--color-cb-muted)] font-mono break-all"
              >
                {{ expectedConfirmationText }}
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-[var(--color-cb-text)]"
                  >Type the phrase above to confirm</label
                >
                <input
                  v-model="confirmationText"
                  type="text"
                  placeholder="sudo-delete-First-Last"
                  class="form-input font-mono text-sm"
                  :class="
                    confirmationText && !confirmationValid
                      ? 'border-[var(--color-cb-negative)]'
                      : ''
                  "
                  autocomplete="off"
                  spellcheck="false"
                />
                <p
                  v-if="confirmationText && !confirmationValid"
                  class="text-xs text-[var(--color-cb-negative)]"
                >
                  Phrase doesn't match. Check capitalisation and hyphens.
                </p>
              </div>
            </div>
            <div
              class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-5 py-4 border-t border-[var(--color-cb-divider)]"
            >
              <button
                class="btn-cancel w-full sm:w-auto"
                :disabled="deletingAccount"
                @click="
                  deleteAccountModalOpen = false;
                  confirmationText = '';
                "
              >
                Cancel
              </button>
              <button
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-[var(--color-cb-negative)] text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="!confirmationValid || deletingAccount"
                @click="handleDeleteAccount"
              >
                <i
                  :class="
                    deletingAccount
                      ? 'fa-solid fa-spinner animate-spin'
                      : 'fa-solid fa-trash'
                  "
                ></i>
                {{ deletingAccount ? "Deleting…" : "Delete my account" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const user = computed(() => userStore.user);

const sessionsLoading = ref(false);
const revokingIds = ref([]);
const loggingOutAll = ref(false);
const deleteAccountModalOpen = ref(false);
const confirmationText = ref("");
const deletingAccount = ref(false);
const toast = ref({ show: false, type: "success", message: "" });

// Change Password state
const changePasswordModalOpen = ref(false);
const changingPassword = ref(false);
const changePasswordError = ref("");
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const changePasswordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const sessions = computed(() => {
  const now = new Date();
  return (userStore.sessions || []).filter(
    (s) => !s.expiresAt || new Date(s.expiresAt) > now,
  );
});

const expectedConfirmationText = computed(() =>
  user.value
    ? `sudo-delete-${user.value.firstName}-${user.value.lastName}`
    : "",
);
const confirmationValid = computed(
  () => confirmationText.value === expectedConfirmationText.value,
);

// Change Password strength
const changePasswordStrength = computed(() => {
  const p = changePasswordForm.value.newPassword;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const changePasswordStrengthLabel = computed(
  () => ["", "Weak", "Fair", "Good", "Strong"][changePasswordStrength.value],
);

function changePasswordStrengthClass(bar) {
  const s = changePasswordStrength.value;
  if (bar > s) return "";
  if (s <= 1) return "weak";
  if (s === 2) return "fair";
  if (s === 3) return "good";
  return "strong";
}

const isChangePasswordValid = computed(() => {
  const { currentPassword, newPassword, confirmPassword } =
    changePasswordForm.value;
  const strongPass =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);
  return currentPassword && strongPass && newPassword === confirmPassword;
});

function humanTier(tier) {
  const map = {
    free: "Free",
    basic: "Basic",
    pro: "Pro",
    elite: "Elite",
    corporate_free: "Corporate Free",
    corporate_pro: "Corporate Pro",
    corporate_elite: "Corporate Elite",
  };
  return map[tier?.toLowerCase()] ?? tier ?? "Free";
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function getDeviceIcon(d) {
  if (!d) return "fa-solid fa-circle-question";
  const l = d.toLowerCase();
  if (l.includes("mobile") || l.includes("android") || l.includes("iphone"))
    return "fa-solid fa-mobile-screen";
  if (l.includes("postman")) return "fa-solid fa-code";
  if (
    l.includes("mozilla") ||
    l.includes("chrome") ||
    l.includes("safari") ||
    l.includes("firefox")
  )
    return "fa-solid fa-globe";
  return "fa-solid fa-laptop";
}
function formatDevice(d) {
  if (!d) return "Unknown device";
  return d.length > 40 ? d.slice(0, 40) + "..." : d;
}
function showToast(type, message) {
  toast.value = { show: true, type, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
}

async function revokeSession(sessionId) {
  if (revokingIds.value.includes(sessionId)) return;
  revokingIds.value.push(sessionId);
  try {
    await userStore.revokeSession(sessionId);
    showToast("success", "Session revoked");
  } catch {
    showToast("error", "Failed to revoke session");
  } finally {
    revokingIds.value = revokingIds.value.filter((id) => id !== sessionId);
  }
}

async function handleLogoutAll() {
  if (loggingOutAll.value) return;
  loggingOutAll.value = true;
  try {
    await authStore.logoutAll();
    router.replace("/auth/login");
  } catch {
    showToast("error", "Failed to logout all sessions");
    loggingOutAll.value = false;
  }
}

function closeChangePasswordModal() {
  changePasswordModalOpen.value = false
  changePasswordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  changePasswordError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

async function handleChangePassword() {
  if (!isChangePasswordValid.value || changingPassword.value) return;
  changingPassword.value = true;
  changePasswordError.value = "";
  try {
    await authStore.changePassword(
      changePasswordForm.value.currentPassword,
      changePasswordForm.value.newPassword,
    );
    showToast("success", "Password updated successfully");
    closeChangePasswordModal();
  } catch (err) {
    changePasswordError.value =
      err?.response?.data?.message ||
      "Failed to change password. Please check your current password and try again.";
  } finally {
    changingPassword.value = false;
  }
}

async function handleDeleteAccount() {
  if (!confirmationValid.value || deletingAccount.value) return;
  deletingAccount.value = true;
  try {
    await userStore.deleteAccount({ confirmationText: confirmationText.value });
    authStore.clearAuth();
    localStorage.clear();
    router.replace("/auth/login");
  } catch (err) {
    showToast(
      "error",
      err?.response?.data?.message || "Failed to delete account",
    );
    deletingAccount.value = false;
  }
}

onMounted(async () => {
  sessionsLoading.value = true;
  try {
    await userStore.fetchSessions();
  } finally {
    sessionsLoading.value = false;
  }
});
</script>

<style scoped>
.form-input {
  width: 100%;
  background: var(--color-cb-base);
  border: 1.5px solid var(--color-cb-divider);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-cb-text);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.form-input:focus {
  border-color: var(--color-cb-accent);
}
.btn-cancel {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--color-cb-divider);
  background: transparent;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel:hover {
  background-color: var(--color-cb-field);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Password strength */
.strength-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}
.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}
.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background-color: var(--color-cb-divider);
  transition: background-color 0.3s ease;
}
.strength-bar.weak {
  background-color: var(--color-cb-negative);
}
.strength-bar.fair {
  background-color: var(--color-cb-warning);
}
.strength-bar.good {
  background-color: var(--color-cb-accent);
}
.strength-bar.strong {
  background-color: var(--color-cb-positive);
}
.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-cb-muted);
  min-width: 36px;
}
.relative { position: relative; }
.pr-10 { padding-right: 2.5rem; }
</style>
